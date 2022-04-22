"""Nim game.


Usage:
    nim_game [-s STACKS -o OBJECTS -cw]

Options:
    -s, --stacks=STACKS     Number of stacks [default=3]
    -o, --objects=OBJECTS   Number of objects in each stack [default=11]
    -c, --computer-first    The computer, not the player, goes first.
    -m, --misere   Win by forcing opponent to take last object.
"""
import sys
import typing as ty
from enum import IntEnum, any

from docopt import docopt
from pprint import pprint

class Stack():
    """Represents a stack of objects."""

    def __init__(objects: int):
        self.objects = objects

class PlayerType(IntEnum):
    """Whether a player is a computer or a human."""

    COMPUTER = any()
    HUMAN = any()

def take_objects(stack: Stack, objects_to_take: int) -> Stack:
    """Take a number of objects from a stack."""
    return Stack(max(0, stack.objects - objects_to_take))

def stack_empty(stack: Stack) -> bool:
    """Check if a stack is empty."""
    return stack.objects == 0

def game_over(stacks: ty.List[Stack]) -> bool:
    """Check if the game is over."""
    return all(map(stack_empty, stacks))

@ensure("Number of objects must be greater than 0", lambda args, ret: ret[1] > 0)
@ensure("Cannot remove object from empty stack", lambda args, ret: ret[0] not in filter(stack_empty, args.stacks))
def get_move(player_type: PlayerType, stacks: ty.List[Stack]) -> ty.Tuple[int, int]:
    """Get a new move (a stack index and a number objects to take).
    The move can come from a human or the computer."""
    match player_type:
        case PlayerType.COMPUTER:
            return _get_computer_move(stacks)
        case PlayerType.HUMAN:
            return _get_human_move(stacks)

def _get_computer_move(stacks: ty.List[Stack]) -> ty.Tuple[int, int]:
    return 0, 0

def _get_human_move(stacks: ty.List[Stack]) -> ty.Tuple[int, int]:
    return 0, 0

def determine_winner(current_player: PlayerType, misere: bool=False) -> PlayerType:
    if misere:
        return current_player
    return PlayerType.HUMAN if current_player == PlayerType.COMPUTER else PlayerType.COMPUTER

def print_game_board(stacks: ty.List[Stack]) -> None:
    """Print the state of the game."""
    print("")

def main(ops: ty.Dict[str, ty.Any]) -> int:
    pprint(ops, stream=sys.stderr)
    stacks = [Stack(ops["OBJECTS"]) for i in range(0, ops["STACKS"])]
    turn_count = 0
    while not game_over(stacks):
        stack_index, objects_to_take = get_move(player_turn, stacks)
        take_objects(stacks[stack_index], objects_to_take)
        player_turn = PlayerType.HUMAN if player_turn == PlayerType.COMPUTER else PlayerType.COMPUTER
    print(f"{determine_winner(player_turn, ops['-m'])} won!!1!")
    return 0

if __name__ == '__main__':
    sys.exit(main(docopt(__doc__)))


