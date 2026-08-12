
import copy
import random

SIZE = 9
EMPTY = 0


def deep_copy(board):
    return copy.deepcopy(board)


def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_safe(board, row, col, num):
    # Check row and column
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    # Check 3x3 box
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True


def _find_next_empty(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                return row, col
    return None, None


def count_solutions(board, limit=2):
    working_board = deep_copy(board)
    solution_count = 0

    def backtrack():
        nonlocal solution_count
        if solution_count >= limit:
            return

        row, col = _find_next_empty(working_board)
        if row is None and col is None:
            solution_count += 1
            return

        for num in range(1, SIZE + 1):
            if is_safe(working_board, row, col, num):
                working_board[row][col] = num
                backtrack()
                working_board[row][col] = EMPTY
                if solution_count >= limit:
                    return

    backtrack()
    return solution_count


def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True


def remove_cells(board, clues):
    attempts = SIZE * SIZE - clues
    while attempts > 0:
        row = random.randrange(SIZE)
        col = random.randrange(SIZE)
        if board[row][col] != EMPTY:
            board[row][col] = EMPTY
            attempts -= 1


def generate_puzzle(clues=35):
    clues = max(1, min(clues, SIZE * SIZE))

    while True:
        board = create_empty_board()
        fill_board(board)
        solution = deep_copy(board)
        puzzle = deep_copy(board)

        cells = [(row, col) for row in range(SIZE) for col in range(SIZE)]
        random.shuffle(cells)
        cells_to_remove = SIZE * SIZE - clues
        removed = 0

        for row, col in cells:
            if removed >= cells_to_remove:
                break

            current_value = puzzle[row][col]
            puzzle[row][col] = EMPTY
            if count_solutions(puzzle) != 1:
                puzzle[row][col] = current_value
            else:
                removed += 1

        if count_solutions(puzzle) == 1:
            return puzzle, solution
