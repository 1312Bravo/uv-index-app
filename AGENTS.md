# UV Scout

## Codex instructions

Use the installed Codex skills from:

`C:\Users\Urh\.codex\skills`

For app planning and implementation, follow the `vibecode-app-builder` skill at:

`C:\Users\Urh\.codex\skills\vibecode-app-builder\SKILL.md`

Load other installed skills from that directory when the task clearly matches
their scope. Follow the current user request and higher-priority instructions
before any repository guidance.

## Project principles

- Keep the Expo, React Native, and TypeScript code clear and easy to edit.
- Keep product decisions and durable requirements in `notes/`.
- Consult `PLAN.md` when deciding product scope or implementing the current MVP;
  update it when a meaningful decision or milestone changes.
- Keep run instructions and implementation notes in `docs/`.
- Keep secrets, generated files, and build output out of source control.
- Inspect existing files before editing and preserve user work.
- Before implementing a meaningful product or architecture choice that remains
  undecided, explain the options and ask the user a focused question. Use
  reasonable judgment for routine, reversible implementation details.
- Keep modules focused by responsibility and entry files small. After meaningful
  feature work, review the affected code for duplication, oversized files, and
  awkward boundaries; make small, scoped refactors when needed.
