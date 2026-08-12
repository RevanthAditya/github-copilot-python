import copy

import sudoku_logic


def _is_complete_valid_board(board):
    for row in board:
        if sorted(row) != list(range(1, sudoku_logic.SIZE + 1)):
            return False

    for col in range(sudoku_logic.SIZE):
        column_values = [board[row][col] for row in range(sudoku_logic.SIZE)]
        if sorted(column_values) != list(range(1, sudoku_logic.SIZE + 1)):
            return False

    for box_row in range(0, sudoku_logic.SIZE, 3):
        for box_col in range(0, sudoku_logic.SIZE, 3):
            box_values = []
            for row in range(box_row, box_row + 3):
                for col in range(box_col, box_col + 3):
                    box_values.append(board[row][col])
            if sorted(box_values) != list(range(1, sudoku_logic.SIZE + 1)):
                return False

    return True


def test_fill_board_produces_complete_valid_board():
    board = sudoku_logic.create_empty_board()
    assert sudoku_logic.fill_board(board) is True
    assert _is_complete_valid_board(board)


def test_is_safe_accepts_valid_placements_and_rejects_invalid_ones():
    board = sudoku_logic.create_empty_board()

    assert sudoku_logic.is_safe(board, 0, 0, 5) is True
    board[0][0] = 5
    assert sudoku_logic.is_safe(board, 0, 1, 5) is False

    board = sudoku_logic.create_empty_board()
    board[0][0] = 1
    board[0][1] = 2
    board[1][0] = 3
    board[1][1] = 4
    assert sudoku_logic.is_safe(board, 0, 2, 1) is False
    assert sudoku_logic.is_safe(board, 0, 2, 5) is True


def test_generate_puzzle_has_single_unique_solution():
    puzzle, solution = sudoku_logic.generate_puzzle(clues=30)

    assert sudoku_logic.count_solutions(puzzle) == 1
    assert len(puzzle) == sudoku_logic.SIZE
    assert len(solution) == sudoku_logic.SIZE

    for row in range(sudoku_logic.SIZE):
        for col in range(sudoku_logic.SIZE):
            if puzzle[row][col] != sudoku_logic.EMPTY:
                assert puzzle[row][col] == solution[row][col]


def test_count_solutions_detects_multiple_solutions():
    empty_board = sudoku_logic.create_empty_board()

    assert sudoku_logic.count_solutions(empty_board) > 1


def test_generate_puzzle_solution_is_complete_and_valid():
    puzzle, solution = sudoku_logic.generate_puzzle(clues=30)

    assert _is_complete_valid_board(solution)
    assert any(cell == sudoku_logic.EMPTY for row in puzzle for cell in row)
    assert any(cell != sudoku_logic.EMPTY for row in puzzle for cell in row)


def test_deep_copy_creates_independent_copy():
    original = [[1, 2], [3, 4]]
    copied = sudoku_logic.deep_copy(original)

    assert copied == original
    copied[0][0] = 99
    assert original[0][0] == 1
    assert copied[0][0] == 99

    original.append([5, 6])
    assert copied == [[99, 2], [3, 4]]
