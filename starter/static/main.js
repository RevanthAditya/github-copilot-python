// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
const SCOREBOARD_KEY = 'sudoku-top-10-fastest-times';
const THEME_KEY = 'sudoku-theme';
const DIFFICULTY_SETTINGS = {
  easy: { label: 'Easy', clues: 35 },
  medium: { label: 'Medium', clues: 30 },
  hard: { label: 'Hard', clues: 24 }
};

let puzzle = [];
let currentSolution = [];
const state = {
  difficulty: 'easy',
  timerSeconds: 0,
  timerId: null,
  hintsUsed: 0,
  completed: false
};

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateTimer() {
  document.getElementById('timer').textContent = formatTime(state.timerSeconds);
}

function updateHintsUsed() {
  const hintsUsedEl = document.getElementById('hints-used');
  if (hintsUsedEl) {
    hintsUsedEl.textContent = `Hints Used: ${state.hintsUsed}`;
  }
}

function startTimer() {
  stopTimer();
  state.timerSeconds = 0;
  updateTimer();
  const startedAt = Date.now();
  state.timerId = window.setInterval(() => {
    state.timerSeconds = Math.floor((Date.now() - startedAt) / 1000);
    updateTimer();
  }, 1000);
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      const boxRow = Math.floor(i / 3);
      const boxCol = Math.floor(j / 3);
      if ((boxRow + boxCol) % 2 === 0) {
        input.classList.add('box-light');
      } else {
        input.classList.add('box-dark');
      }
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', async (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        if (val) {
          await validateBoard(false);
        } else {
          input.classList.remove('incorrect', 'empty');
        }
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      inp.classList.remove('prefilled', 'hinted', 'incorrect');
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.classList.add('prefilled');
      } else {
        inp.value = '';
        inp.disabled = false;
      }
    }
  }
}

function getDifficulty() {
  const select = document.getElementById('difficulty-select');
  state.difficulty = select.value;
  return state.difficulty;
}

function loadScoreboard() {
  try {
    const raw = localStorage.getItem(SCOREBOARD_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((entry) => {
      return entry && typeof entry.name === 'string' && typeof entry.time === 'number' && typeof entry.level === 'string' && typeof entry.hints === 'number';
    });
  } catch (error) {
    return [];
  }
}

function saveScoreboard(entries) {
  try {
    localStorage.setItem(SCOREBOARD_KEY, JSON.stringify(entries));
  } catch (error) {
    // Ignore storage write failures in unsupported browser environments.
  }
}

function sortScoreboard(entries) {
  return [...entries].sort((a, b) => {
    if (a.time !== b.time) {
      return a.time - b.time;
    }
    return a.name.localeCompare(b.name);
  }).slice(0, 10);
}

function renderScoreboard() {
  const entries = sortScoreboard(loadScoreboard());
  const tbody = document.getElementById('scoreboard-body');
  tbody.innerHTML = '';

  if (entries.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'No scores yet';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  entries.forEach((entry, index) => {
    const row = document.createElement('tr');
    const rank = document.createElement('td');
    const name = document.createElement('td');
    const time = document.createElement('td');
    const level = document.createElement('td');
    const hints = document.createElement('td');

    rank.textContent = String(index + 1);
    name.textContent = entry.name;
    time.textContent = formatTime(entry.time);
    level.textContent = entry.level;
    hints.textContent = String(entry.hints);

    row.append(rank, name, time, level, hints);
    tbody.appendChild(row);
  });
}

function recordScore() {
  const name = window.prompt('Enter your name for the Top 10 scoreboard:', 'Player');
  const cleanName = (name || 'Player').trim() || 'Player';
  const scores = loadScoreboard();
  const entry = {
    name: cleanName,
    time: state.timerSeconds,
    level: DIFFICULTY_SETTINGS[state.difficulty].label,
    hints: state.hintsUsed
  };

  const updated = sortScoreboard([...scores, entry]);
  saveScoreboard(updated);
  renderScoreboard();
}

function boardFromInputs() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  return board;
}

function applyIncorrectHighlights(incorrect) {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const incorrectSet = new Set(incorrect.map(x => x[0] * SIZE + x[1]));

  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) {
      inp.classList.remove('incorrect');
      continue;
    }
    inp.classList.remove('incorrect');
    if (incorrectSet.has(idx)) {
      inp.classList.add('incorrect');
    }
  }
}

function getIncorrectUserCells() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const incorrect = [];

  for (let idx = 0; idx < inputs.length; idx++) {
    const input = inputs[idx];
    if (input.disabled || input.value === '') {
      continue;
    }

    const row = Math.floor(idx / SIZE);
    const col = idx % SIZE;
    const userValue = Number.parseInt(input.value, 10);
    if (userValue !== currentSolution[row][col]) {
      incorrect.push([row, col]);
    }
  }

  return incorrect;
}

async function validateBoard(showMessage = false) {
  const msg = document.getElementById('message');
  const incorrect = getIncorrectUserCells();
  applyIncorrectHighlights(incorrect);

  const board = boardFromInputs();
  const isComplete = board.every(row => row.every(value => value !== 0)) && incorrect.length === 0;
  if (showMessage) {
    if (isComplete) {
      if (!state.completed) {
        state.completed = true;
        stopTimer();
        msg.style.color = '#388e3c';
        msg.innerText = 'Congratulations! You solved it!';
        recordScore();
      }
    } else if (incorrect.length > 0) {
      msg.style.color = '#d32f2f';
      msg.innerText = 'Some cells are incorrect.';
    } else {
      msg.style.color = '#388e3c';
      msg.innerText = 'Keep going!';
    }
  }

  return { incorrect, complete: isComplete };
}

async function newGame() {
  getDifficulty();
  state.completed = false;
  state.hintsUsed = 0;
  updateHintsUsed();
  const clues = DIFFICULTY_SETTINGS[state.difficulty].clues;
  const res = await fetch(`/new?clues=${clues}`);
  const data = await res.json();
  currentSolution = data.solution || [];
  renderPuzzle(data.puzzle);
  document.getElementById('message').innerText = '';
  startTimer();
}

async function applyHint() {
  if (state.completed) {
    return;
  }

  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');

  for (let idx = 0; idx < inputs.length; idx++) {
    const input = inputs[idx];
    if (!input.disabled && input.value === '') {
      const row = Math.floor(idx / SIZE);
      const col = idx % SIZE;
      const value = currentSolution[row][col];
      if (value === undefined || value === 0) {
        continue;
      }

      input.value = String(value);
      input.disabled = true;
      input.classList.add('hinted');
      input.classList.remove('incorrect');
      state.hintsUsed += 1;
      updateHintsUsed();
      document.getElementById('message').textContent = 'Hint used.';
      await validateBoard(false);
      return;
    }
  }

  document.getElementById('message').textContent = 'No empty cells left for a hint.';
}

async function checkSolution() {
  await validateBoard(true);
}

function getEmptyEditableCells() {
  // Identify all empty, non-prefilled cells that still need to be filled.
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const empty = [];

  for (let idx = 0; idx < inputs.length; idx++) {
    const input = inputs[idx];
    // Cell is editable (not disabled) and has no value
    if (!input.disabled && input.value === '') {
      const row = Math.floor(idx / SIZE);
      const col = idx % SIZE;
      empty.push([row, col]);
    }
  }

  return empty;
}

async function performDetailedCheck() {
  // Evaluate the board and highlight both incorrect values and empty cells.
  const msg = document.getElementById('message');
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');

  // Get incorrect user-entered values
  const incorrect = getIncorrectUserCells();
  // Get empty cells that still need to be filled
  const empty = getEmptyEditableCells();

  // Create sets for efficient lookup during highlighting
  const incorrectSet = new Set(incorrect.map(x => x[0] * SIZE + x[1]));
  const emptySet = new Set(empty.map(x => x[0] * SIZE + x[1]));

  // Clear previous highlights and apply new ones
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    // Never highlight prefilled cells
    if (inp.disabled) {
      inp.classList.remove('incorrect', 'empty');
      continue;
    }
    
    inp.classList.remove('incorrect', 'empty');
    if (incorrectSet.has(idx)) {
      inp.classList.add('incorrect');
    } else if (emptySet.has(idx)) {
      inp.classList.add('empty');
    }
  }

  // Determine and display feedback message
  const board = boardFromInputs();
  const isComplete = board.every(row => row.every(value => value !== 0)) && incorrect.length === 0;

  if (isComplete) {
    if (!state.completed) {
      state.completed = true;
      stopTimer();
      msg.style.color = '#388e3c';
      msg.innerText = 'Congratulations! You solved it!';
      recordScore();
    }
  } else {
    // Build descriptive feedback message
    if (incorrect.length > 0 && empty.length > 0) {
      msg.style.color = '#d32f2f';
      msg.innerText = `${incorrect.length} incorrect, ${empty.length} empty cells.`;
    } else if (incorrect.length > 0) {
      msg.style.color = '#d32f2f';
      msg.innerText = `${incorrect.length} incorrect cell${incorrect.length !== 1 ? 's' : ''}.`;
    } else if (empty.length > 0) {
      msg.style.color = '#d32f2f';
      msg.innerText = `${empty.length} cell${empty.length !== 1 ? 's' : ''} need${empty.length === 1 ? 's' : ''} to be filled.`;
    } else {
      msg.style.color = '#388e3c';
      msg.innerText = 'Keep going!';
    }
  }
}


function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'light';
  } catch (error) {
    return 'light';
  }
}

function applyTheme(theme) {
  const html = document.documentElement;
  const isDark = theme === 'dark';
  html.dataset.theme = theme;
  const toggleButton = document.getElementById('theme-toggle');
  if (toggleButton) {
    toggleButton.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    toggleButton.setAttribute('aria-pressed', String(isDark));
  }
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    // Ignore storage failures in unsupported browser environments.
  }
}

function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
}

window.addEventListener('load', () => {
  renderScoreboard();
  applyTheme(getStoredTheme());
  updateHintsUsed();
  document.getElementById('difficulty-select').addEventListener('change', newGame);
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('hint-button').addEventListener('click', applyHint);
  document.getElementById('check-solution').addEventListener('click', performDetailedCheck);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  newGame();
});