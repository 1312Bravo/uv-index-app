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

## Domain authoring convention

- Apply the editable-data / interpreter separation to all future domain work.
- Store editable mappings, thresholds, labels, recommendation text, and rule
  tables in readable JSON beside the TypeScript code that interprets them.
- Keep types, validation, calculations, and algorithms in focused TypeScript
  modules. A pure calculation or type definition does not need a JSON companion.
- Validate editable definitions before use; document field meanings, units,
  boundary behavior, and stable identifiers so they can be edited confidently.
- Domain code returns structured results and stays independent of UI and API
  services. Features handle rendering and app wiring.
- Keep rule rationale and sources in `notes/`, and editing instructions in
  `docs/`. Follow `src/domain/uv/` as the initial example.
- For UV science, category, or protection-guidance research, use
  `prompts/uv-evidence-guidance-reviewer.md` as the research and review brief.
  It supports evidence review; it does not replace authoritative sources or
  automatically approve a product rule.
