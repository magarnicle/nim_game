"""Nim game.

Usage:
    nim [-cm] STACK ...

Options:
    STACK                   One or more stacks, being the number of objects in the stack.
    -m, --misère            Win by forcing opponent to take last object.
    -c, --computer-first    The computer, not the player, goes first.
"""
import sys
import typing as ty
from enum import IntEnum
from dpcontracts import ensure, PostconditionError
import random
import tkinter
import tkinter.messagebox

from docopt import docopt
from pprint import pprint


class PlayerType(IntEnum):
    """Whether a player is a computer or a human."""

    COMPUTER = 0
    HUMAN = 1

class Player:
    """Represents a player"""

    def __init__(self, name: str, player_type: PlayerType):
        self.name = name
        self.player_type = player_type

def take_objects(stack: int, objects_to_take: int) -> None:
    """Take a number of objects from a stack."""
    return max(0, stack - objects_to_take)


def stack_empty(stack: int) -> bool:
    """Check if a stack is empty."""
    return stack == 0


def game_over(stacks: ty.List[int]) -> bool:
    """Check if the game is over."""
    return all(map(stack_empty, stacks))


def _empty_stack_check(args, ret):
    return not list(map(stack_empty, args.stacks))[ret[0]]

def _positive_object_count_check(args, ret):
    return ret[1] > 0


@ensure("Number of objects must be greater than 0", _positive_object_count_check)
@ensure("Cannot remove object from empty stack", _empty_stack_check)
def get_move(player_type: PlayerType, stacks: ty.List[int]) -> ty.Tuple[int, int]:
    """Get a new move (a stack index and a number objects to take).
    The move can come from a human or the computer."""
    if player_type == PlayerType.COMPUTER:
        return _get_computer_move(stacks)
    return _get_human_move(stacks)


def _get_computer_move(stacks: ty.List[int]) -> ty.Tuple[int, int]:
    """Get a move from the computer."""
    valid_stacks = get_valid_stacks(stacks)
    stack = valid_stacks[random.randint(0, len(valid_stacks) - 1)]
    return stack, random.randint(1, stacks[stack])


def _get_human_move(stacks: ty.List[int]) -> ty.Tuple[int, int]:
    """Ask the human for a move."""
    valid_stacks = get_valid_stacks(stacks)
    return (
        int(input("Which stack? ")) if len(valid_stacks) > 1 else valid_stacks[0],
        int(input("How many objects to take? ")),
    )


def get_valid_stacks(stacks: ty.List[int]) -> ty.List[int]:
    """Get the indices of non-empty stacks."""
    return [i for i, stack in enumerate(stacks) if not stack_empty(stack)]


def determine_winner(current_player: ty.Tuple[str, PlayerType], misere: bool = False) -> bool:
    if misere:
        return True
    return False


def print_game_board(stacks: ty.List[int]) -> None:
    """Print the state of the game."""
    index_texts = ""
    object_texts = ""
    for index, stack in enumerate(stacks):
        object_text = str(stack)
        object_texts += f"\t{object_text}"
        index_text = (str(index) + (" " * len(object_text)))[: len(object_text)]
        index_texts += f"\t{index_text}"
    index_texts = index_texts.lstrip("\t")
    object_texts = object_texts.lstrip("\t")
    print("\n\tStacks\t")
    print(f"Index:   {index_texts}")
    print(f"Objects: {object_texts}")

def setup_game_board() -> tkinter.Tk:
    window = tkinter.Tk(className="Nim Game", useTk=1)
    window.title("Nim Game")
    window.geometry("800x600")
    def button_cmd():
        tkinter.messagebox.showinfo("Alert", "You clicked the button")
    button = tkinter.Button(window, text="I'm a button", width=50, height=30, command=button_cmd)
    button.pack(side=tkinter.BOTTOM)
    return window

def show_game_board(stacks: ty.List[int], game_board) -> None:
    pass

def other_player(current_player: Player, players: ty.Tuple[Player, Player]) -> Player:
    if current_player == players[0]:
        return players[1]
    return players[0]

def main(ops: ty.Dict[str, ty.Any]) -> int:
    #board = setup_game_board()
    #board.mainloop()
    #return 0
    pprint(ops, stream=sys.stderr)
    stacks = [int(stack) for stack in ops["STACK"]]
    assert all(
        map(lambda stack: stack > 0, stacks)
    ), "Stacks must have at least one object in them"
    player1 = ("Human", PlayerType.HUMAN)
    player2 = ("Computer", PlayerType.COMPUTER)
    players = (player1, player2)
    player_turn = player2 if ops["--computer-first"] else player1
    while not game_over(stacks):
        print_game_board(stacks)
        print(f"It is {player_turn[0]}'s turn.")
        if sum(stacks) == 1:
            # One left, take it and end the game
            player_turn = other_player(player_turn, players)
            break
        while True:
            try:
                stack_index, objects_to_take = get_move(player_turn[1], stacks)
            except PostconditionError as issue:
                print(f"Error: {issue}. Please try again.\n")
                continue
            else:
                break
        stacks[stack_index] = take_objects(stacks[stack_index], objects_to_take)
        player_turn = other_player(player_turn, players)
    print(f"{other_player(player_turn, players)} takes the last object...")
    if determine_winner(player_turn, ops['--misère']):
        print(f"{player_turn[0]} won!")
    else:
        print(f"{other_player(player_turn, players)} won!")
    return 0


if __name__ == "__main__":
    sys.exit(main(docopt(__doc__)))
