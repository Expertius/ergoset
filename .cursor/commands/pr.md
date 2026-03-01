---
description: "Создать PR — коммит, пуш, pull request через gh CLI"
---

Create a pull request for the current changes.

1. Run `git diff` and `git status` to understand all changes.
2. Write a clear commit message in Russian based on what changed (conventional commits style: feat/fix/refactor).
3. Stage all relevant files with `git add`.
4. Commit with the message.
5. Push to the current branch with `git push -u origin HEAD`.
6. Use `gh pr create` to open a pull request with a title and description summarizing the changes.
7. Return the PR URL when done.
