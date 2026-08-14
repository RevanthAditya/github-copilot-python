from flask import Flask, render_template, jsonify, request
import sudoku_logic

app = Flask(__name__)

# Store the current puzzle and solution in memory for the active game session
CURRENT_GAME = {
    'puzzle': None,
    'solution': None
}

DEFAULT_CLUES = 35


def _get_incorrect_cells(user_board, solution):
    """Compare user board with solution and return cells with incorrect values.
    
    Args:
        user_board: User's current board state.
        solution: Correct solution board.
    
    Returns:
        List of [row, col] coordinates where user board differs from solution.
    """
    if not solution or not user_board:
        return []
    
    incorrect = []
    for i in range(sudoku_logic.SIZE):
        for j in range(sudoku_logic.SIZE):
            if user_board[i][j] != solution[i][j]:
                incorrect.append([i, j])
    return incorrect


def _validate_clues_parameter(clues_param):
    """Validate and parse the clues query parameter.
    
    Args:
        clues_param: Raw parameter from request.
    
    Returns:
        Valid integer clue count.
    
    Raises:
        ValueError: If parameter is invalid.
    """
    try:
        clues = int(clues_param)
        if not (1 <= clues <= sudoku_logic.SIZE * sudoku_logic.SIZE):
            raise ValueError(f"Clues must be between 1 and {sudoku_logic.SIZE * sudoku_logic.SIZE}")
        return clues
    except (TypeError, ValueError) as e:
        raise ValueError(f"Invalid clues parameter: {e}")


@app.route('/')
def index():
    """Render the main game page."""
    return render_template('index.html')


@app.route('/new')
def new_game():
    """Generate and return a new Sudoku puzzle.
    
    Query parameter:
        clues: Number of prefilled cells (1-81, default: 35).
    
    Returns:
        JSON with puzzle and solution boards.
    """
    try:
        clues_param = request.args.get('clues', DEFAULT_CLUES)
        clues = _validate_clues_parameter(clues_param)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    
    try:
        puzzle, solution = sudoku_logic.generate_puzzle(clues)
        CURRENT_GAME['puzzle'] = puzzle
        CURRENT_GAME['solution'] = solution
        return jsonify({'puzzle': puzzle, 'solution': solution})
    except Exception as e:
        return jsonify({'error': f"Failed to generate puzzle: {str(e)}"}), 500


@app.route('/check', methods=['POST'])
def check_solution():
    """Validate the user's board against the current puzzle solution.
    
    Request body:
        JSON with 'board' key containing user's 9x9 board state.
    
    Returns:
        JSON with 'incorrect' list of [row, col] cells that don't match solution.
    """
    if not request.json:
        return jsonify({'error': 'Request body must be JSON'}), 400
    
    user_board = request.json.get('board')
    if not user_board:
        return jsonify({'error': 'Board data missing from request'}), 400
    
    solution = CURRENT_GAME.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress. Start a new game first.'}), 400
    
    try:
        incorrect = _get_incorrect_cells(user_board, solution)
        return jsonify({'incorrect': incorrect})
    except Exception as e:
        return jsonify({'error': f"Error checking solution: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True)
