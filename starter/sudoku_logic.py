
import copy
import random

SIZE = 9
EMPTY = 0
BOX_SIZE = 3
MIN_CLUES = 1
MAX_CLUES = SIZE * SIZE


def deep_copy(board):
    """Create an independent deep copy of a board to avoid unintended mutations."""
    return copy.deepcopy(board)


def create_empty_board():
    """Create a blank 9x9 Sudoku board with all cells empty."""
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_safe(board, row, col, num):
    """Check if placing num at (row, col) is valid according to Sudoku rules."""
    # Check row and column for duplicates
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    
    # Check 3x3 box for duplicates
    box_start_row = row - row % BOX_SIZE
    box_start_col = col - col % BOX_SIZE
    for i in range(BOX_SIZE):
        for j in range(BOX_SIZE):
            if board[box_start_row + i][box_start_col + j] == num:
                return False
    
    return True


def _find_next_empty(board):
    """Find the next empty cell in the board, scanning left-to-right, top-to-bottom."""
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                return row, col
    return None, None


def count_solutions(board, limit=2):
    """Count the number of valid solutions for a puzzle, up to the limit.
    
    Args:
        board: A 9x9 Sudoku board (may contain empty cells).
        limit: Stop counting after reaching this many solutions (default: 2).
    
    Returns:
        The number of solutions found, capped at limit.
    """
    if not board or len(board) != SIZE:
        raise ValueError(f"Board must be {SIZE}x{SIZE}, got {len(board) if board else 0}x?")
    
    working_board = deep_copy(board)
    solution_count = 0

    def backtrack():
        nonlocal solution_count
        if solution_count >= limit:
            return

        row, col = _find_next_empty(working_board)
        if row is None:
            # No empty cells left; found a complete solution
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
    """Recursively fill a board with valid Sudoku values to create a complete solution.
    
    Uses backtracking with randomized candidate selection to generate diverse solutions.
    """
    row, col = _find_next_empty(board)
    if row is None:
        # All cells filled successfully
        return True
    
    # Try candidates in random order for diversity
    candidates = list(range(1, SIZE + 1))
    random.shuffle(candidates)
    
    for candidate in candidates:
        if is_safe(board, row, col, candidate):
            board[row][col] = candidate
            if fill_board(board):
                return True
            board[row][col] = EMPTY
    
    return False


def _remove_cells_to_target(puzzle, target_clues):
    """Remove cells from a complete solution to reach the target clue count.
    
    Ensures the resulting puzzle has exactly one unique solution.
    """
    cells_to_remove = SIZE * SIZE - target_clues
    removed = 0
    
    cells = [(row, col) for row in range(SIZE) for col in range(SIZE)]
    random.shuffle(cells)
    
    for row, col in cells:
        if removed >= cells_to_remove:
            break
        
        current_value = puzzle[row][col]
        puzzle[row][col] = EMPTY
        
        # Only remove if puzzle still has exactly one solution
        if count_solutions(puzzle) != 1:
            puzzle[row][col] = current_value
        else:
            removed += 1
    
    return removed >= cells_to_remove


def generate_puzzle(clues=35):
    """Generate a valid Sudoku puzzle with exactly one unique solution.
    
    Args:
        clues: Number of prefilled cells (1 to 81). Default: 35.
    
    Returns:
        Tuple of (puzzle, solution) as 9x9 boards.
    
    Raises:
        ValueError: If clues is outside the valid range.
    """
    if not isinstance(clues, int):
        raise ValueError(f"Clues must be an integer, got {type(clues).__name__}")
    
    clues = max(MIN_CLUES, min(clues, MAX_CLUES))
    
    while True:
        board = create_empty_board()
        
        if not fill_board(board):
            # Rare: backtracking failed, retry
            continue
        
        solution = deep_copy(board)
        puzzle = deep_copy(board)
        
        # Remove cells to reach target clue count while maintaining uniqueness
        if _remove_cells_to_target(puzzle, clues):
            # Verify puzzle has exactly one solution before returning
            if count_solutions(puzzle) == 1:
                return puzzle, solution

