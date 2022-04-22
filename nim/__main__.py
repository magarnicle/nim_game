"""Nim game.


Usage:
    nim_game [-s STACKS -o OBJECTS -cm]

Options:
    -s, --stacks=STACKS     Number of stacks [default: 3]
    -o, --objects=OBJECTS   Number of objects in each stack [default: 11]
    -c, --computer-first    The computer, not the player, goes first.
    -m, --misère            Win by forcing opponent to take last object.
"""
import sys
import typing as ty
from enum import IntEnum
from dpcontracts import ensure, PostconditionError

from docopt import docopt
from pprint import pprint

class PlayerType(IntEnum):
    """Whether a player is a computer or a human."""

    COMPUTER = 0
    HUMAN = 1

    def __add__(self, value):
        new_value = (self.value + value) % 2
        if new_value == 0:
            return PlayerType.COMPUTER
        return PlayerType.HUMAN

    def __sub__(self, value):
        return self.__add__(-value)

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
    match player_type:
        case PlayerType.COMPUTER:
            #return _get_computer_move(stacks)
            return _get_human_move(stacks)
        case PlayerType.HUMAN:
            return _get_human_move(stacks)


def _get_computer_move(stacks: ty.List[int]) -> ty.Tuple[int, int]:
    return 0, 0

def _get_human_move(stacks: ty.List[int]) -> ty.Tuple[int, int]:
    return int(input("Which stack? ")), int(input("How many objects to take? "))

def determine_winner(current_player: PlayerType, misere: bool=False) -> PlayerType:
    if misere:
        return current_player
    return current_player + 1

def print_game_board(stacks: ty.List[int], player_turn: PlayerType) -> None:
    """Print the state of the game."""
    index_texts = ""
    object_texts = ""
    for index, stack in enumerate(stacks):
        object_text = str(stack)
        object_texts += f"\t{object_text}"
        index_text = (str(index) + (" " * len(object_text)))[:len(object_text)]
        index_texts += f"\t{index_text}"
    index_texts = index_texts.lstrip('\t')
    object_texts = object_texts.lstrip('\t')
    print("\n\tStacks\t")
    print(f"Index:   {index_texts}")
    print(f"Objects: {object_texts}")
    print(f"It is {player_turn.name}'s turn.")

def main(ops: ty.Dict[str, ty.Any]) -> int:
    pprint(ops, stream=sys.stderr)
    stacks = [int(ops["--objects"]) for i in range(0, int(ops["--stacks"]))]
    player_turn = PlayerType.COMPUTER if ops["--computer-first"] else PlayerType.HUMAN
    while not game_over(stacks):
        print_game_board(stacks, player_turn)
        while True:
            try:
                stack_index, objects_to_take = get_move(player_turn, stacks)
            except PostconditionError as issue:
                print(f"Error: {issue}. Please try again.\n")
                continue
            else:
                break
        stacks[stack_index] = take_objects(stacks[stack_index], objects_to_take)
        player_turn += 1
    print(f"{determine_winner(player_turn, ops['--misère']).name} won!")
    return 0

if __name__ == '__main__':
    sys.exit(main(docopt(__doc__)))

