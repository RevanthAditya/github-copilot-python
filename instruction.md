# Copilot Instruction Guide for This Sudoku Project

## Purpose
This file gives GitHub Copilot project-specific guidance so it can generate code that matches the repository's architecture, coding conventions, and feature requirements.

Copilot reads this file as contextual guidance before generating or modifying code. In practice, this influences the output by helping it:

- follow the existing project structure and naming conventions
- reuse established patterns instead of inventing new ones
- avoid unrelated features or scope creep
- align with the Flask + JavaScript Sudoku architecture already used here
- respect the required behavior for Sudoku generation, validation, UI, and persistence

## Project expectations
- Keep the app as a simple Flask web application served from the `starter/` folder.
- Preserve the existing file structure: `app.py`, `sudoku_logic.py`, templates, and static assets.
- Do not change Sudoku generation logic unless the task explicitly requires it.
- Do not change unique-solution validation, timer logic, hint logic, check logic, completion detection, or localStorage scoreboard behavior unless a requirement says to.
- Keep UI changes minimal, clean, and consistent with the current design.
- Prefer small, focused fixes over large rewrites.

## Modular, reusable code guidance
- Break larger responsibilities into smaller functions or modules with a single purpose.
- Reuse shared logic instead of duplicating it across the app.
- Keep the Flask routes focused on request handling and keep the Sudoku logic separate from presentation logic.
- In JavaScript, group related behavior such as timer updates, validation, board rendering, and theme handling into focused functions.
- Favor reusable helpers for formatting, storage access, and board state updates rather than embedding repeated logic throughout the file.

## Error handling guidance
- Use `try/catch` around browser storage access and JSON parsing when working with `localStorage`.
- Handle failed fetch or invalid response data gracefully without breaking the app UI.
- Keep validation messages consistent and clear for users.
- Avoid silent failures when a request or data operation fails; use fallback behavior that maintains a usable app state.
- Log meaningful errors only where debugging is useful, and keep production behavior stable and user-friendly.

## Comments and documentation guidance
- Add comments only where they clarify intent, business rules, or a non-obvious implementation detail.
- Prefer comments that explain why a decision exists rather than describing obvious code lines.
- Keep comments concise and consistent with the project’s existing style.
- Document any project-specific behavior that future developers may need to understand, such as difficulty mapping, Sudoku generation rules, or browser persistence logic.
- Use the project instruction file as the central place for coding rules, architecture expectations, and reusable prompt guidance.

## Coding standards
- Use clear, readable Python and JavaScript naming conventions.
- Prefer simple, maintainable functions over overly complex abstractions.
- Keep comments concise and useful; explain why something is done, not obvious code details.
- Maintain consistent indentation and formatting.
- Prefer existing project patterns over introducing new frameworks or libraries.
- Use only the libraries already present in the project unless a requirement explicitly adds a new dependency.

## UI and behavior rules
- Maintain responsive layout behavior for desktop and mobile.
- Preserve readability and contrast in both light and dark mode.
- Keep accessibility in mind: readable text, visible borders, and clear status messages.
- Keep the scoreboard and theme logic working with browser localStorage.
- Do not add unrelated features or decorative behavior that is outside the current task.

## Safe coding practices
- Verify assumptions with the existing tests before and after changes.
- Favor small, testable changes with clear scope.
- Avoid breaking current behavior while fixing issues.
- Ensure new code is compatible with the existing Flask routes and client-side game flow.
- Validate the build and test status with the available Python test suite before finalizing work.

## Example prompt guidance for Copilot
When generating code for this project, Copilot should follow patterns like:

- "Update the Sudoku UI styling only; preserve all game logic and localStorage behavior."
- "Fix the dark mode contrast issue without changing the timer, hints, or validation rules."
- "Keep the existing Flask app architecture and add only the required UI improvements."
- "Do not add unrelated features; focus on readability, accessibility, and responsive behavior."
- "Refactor this section into smaller reusable functions without changing runtime behavior."
- "Add a focused error-handling fallback for storage access and keep the user-facing behavior consistent."

## References
- GitHub Docs: Configuring GitHub Copilot: https://docs.github.com/en/copilot/configuring-copilot
- GitHub Docs: Best practices for writing prompts: https://docs.github.com/en/copilot/using-github-copilot/best-practices-for-writing-prompts
- GitHub Blog: GitHub Copilot instructions and workflows: https://github.blog/changelog/2024-03-27-github-copilot-workflows-and-instructions/
- W3C WCAG Color and Contrast Guidelines: https://www.w3.org/WAI/WCAG21/quickref/#contrast-minimum
- MDN: JavaScript Modules and maintainable code practices: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- MDN: try/catch and error handling: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch
- Refactoring Guru: Refactoring best practices: https://refactoring.guru/refactoring
- Google JS Style Guide: Comments and formatting guidance: https://google.github.io/styleguide/jsguide.html#formatting-comments

## Summary
This instruction file helps Copilot generate code that is consistent with the project’s existing architecture, preserves current gameplay logic, supports modular reusable components, handles errors safely, and keeps the codebase maintainable and readable for future contributors.
