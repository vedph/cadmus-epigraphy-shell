# Signal forms migration log

Migration of the libraries under `projects/myrmidon/` from reactive forms to
`@angular/forms/signals`, after the `@myrmidon/cadmus-*` core packages moved
to version 20 (signal forms based `ModelEditorComponentBase`).

References:

- `cadmus-shell-v3/CHANGELOG.md`, "Migrating a part editor" and its checklist;
- `cadmus-bricks-shell-v3/signal-forms-component-template.md` (canonical
  sub-editor pattern and regression specs);
- `cadmus-doc/frontend/dev/app-parts.md`.

**Convention:** anything not marked otherwise was measured (test run, build,
mutation check, or DOM check), and the entry says how. Anything inferred but
not measured is marked **believed**, with how to check it.

## Tooling

- `scripts/build-libs.mjs` (`pnpm build:libs [lib...]`), copied from
  `cadmus-shell-v3`: builds the named libraries plus everything downstream,
  in dependency order. The graph is the union of manifest dependencies and
  the `@myrmidon/*` imports found in non-spec sources. Measured order
  (`--dry`): the 7 leaf libraries, then `cadmus-part-epigraphy-pg`, which
  imports all of them.
- `scripts/check-local-libs.js` (`pnpm check-libs`), copied from
  `cadmus-shell-v3`, fails if a local library exists in `node_modules` as
  anything but a symlink into this workspace's `dist/`. It runs before
  `build:libs`, `start` and `build`. Changed from the original: it parses
  `tsconfig.json` with TypeScript's own reader, because this workspace's
  `tsconfig.json` has comments (`JSON.parse` failed on it, measured).
- Resolution state at start (measured: `ls -la node_modules/@myrmidon`, and
  the guard): the 8 local libraries resolve only through `tsconfig.json`
  paths to `dist/myrmidon/*`; none is present in `node_modules`.

## Patterns used

- Part/fragment editors: `_draft = linkedSignal(() => toDraft(this.data()?.value))`,
  `form = this.createForm(this._draft, schema)`, thesaurus entries as
  `computed()` over `data().thesauri`, no `<form>`,
  `(saveRequest)="save()"` on the close/save buttons.
- Sub-editors (`model()` bound): pure `toDraft`/`toModel`, a `linkedSignal`
  whose `previous` check keeps the draft on the echo of our own save, an
  effect keyed on the draft that resets the interaction state only when the
  draft is back in sync with the model (`isDraftInSync`), no `<form>`,
  `type="button"` save, and Enter-to-save kept by a root
  `(keydown.enter)` handler using `isImplicitSubmission`, gated on
  `invalid || !dirty` because the old implicit submission went through a
  submit button disabled in that state.
- Child editor outputs (flag sets, measurement sets) go through
  `setFieldFromChild`, arrays of objects through `copyFormValue` in and out;
  Monaco is bound with `[value]` + `setFieldFromEditor`.

## Libraries

### `cadmus-part-epigraphy-technique`

- `EpiTechniquePartComponent` migrated.
- Measured: 34 of 34 tests pass; library builds.
- New specs: pristine after binding, typing dirties and new data cleans
  (`dirtyChange` = `[true, false]`), flag set echo leaves it pristine, save
  through the real save button, save button disabled while invalid, no
  `<form>`, invalid save marks touched, disabled input disables fields.
- Spec changes: `dirtyChange` is now emitted by an effect, so the specs run
  change detection before reading it (also in the feature spec).

### `cadmus-fr-epigraphy-ligatures`

- `EpiLigaturesFragmentComponent` migrated (`strictMinLength(types, 1)` via
  `NgxToolsSignalValidators`).
- Measured: 32 of 32 tests pass; library builds.
- Deliberate behaviour change: empty `eid`, `groupId` and `note` are now
  saved as missing; the old code saved `''` for an emptied field (it only
  trimmed). Spec added.

### `cadmus-part-epigraphy-scripts`

- `EpiScriptsPartComponent` and the `EpiScriptComponent` sub-editor migrated.
- Measured: 70 of 70 tests pass; library builds.
- Mutation check: making the sub-editor's `linkedSignal` always rebuild the
  draft fails exactly the "keeps an in-progress edit when its own save echoes
  back normalized" spec; restoring it passes.
- Behaviour notes:
  - removed the "system required" and "casing required" messages: no such
    validator ever existed, so they could never appear;
  - the sub-editor now trims `system`, `script`, `casing` and `note` on save
    (it did not before). A whitespace-only script passes `required` and is
    saved as `''`, as `required` did not trim before either;
  - Enter in the child editor saves the script into the part (not the part).
    Spec drives the real key events through the part editor.

### `cadmus-part-epigraphy-signs`

- `EpiSignsPartComponent` and the `EpiSignComponent` sub-editor migrated.
  Monaco (description) is bound with `[value]` + `setFieldFromEditor`.
- Measured: 69 of 69 tests pass; library builds.
- Mutation check: replacing `setFieldFromChild` in the measurements handler
  with an unconditional set + `markAsDirty` fails exactly the "stays pristine
  when children emit the bound values" spec.
- `PhysicalMeasurementSetComponent` (`cadmus-mat-physical-size` 10.0.4) was
  read: it emits only on user actions, so it has no binding echo today; the
  handler is still echo-safe.
- The Monaco test fake (`NgxMonacoEditorFakeComponent`) emits `valueChange`
  only on typing, unlike the real editor, so the echo spec calls
  `setFieldFromEditor` directly.

### `cadmus-part-epigraphy-support`

- `EpiSupportPartComponent` and the `EpiTextAreaComponent` sub-editor
  migrated. The frame type's conditional `required` (former
  `conditionalValidator` + a `valueChanges` revalidation subscription) is
  `required(p.frameType, { when: ... hasFrame })`.
- `PhysicalSizeComponent` (10.0.4) was read: it is itself signal-forms
  based and autosaves after a 400 ms debounce, guarded by an in-sync check.
  Handlers use `setFieldFromChild`; specs feed them normalized copies
  (`tag: undefined` for absent tags) and expect a pristine form.
- Measured: 77 of 77 tests pass; library builds.
- Behaviour notes:
  - removed dead messages: "objectType required" (part) and "type too long"
    (text area) had no validator;
  - deliberate: empty `counts` and `features` are now saved as missing; the
    old `getValue()` saved `[]` (`value || undefined` keeps `[]`). Spec
    added.

### `cadmus-part-epigraphy-support-frr`

- `EpiSupportFrrPartComponent`, `EpiSupportFrComponent` and
  `EpiSupportFrCellMappingComponent` migrated (three nesting levels).
- `EpiSupportFr` maps the grid location through
  `PhysicalGridCoordsService` (read: pure parse/format), so `toDraft` and
  `toModel` take the service as a parameter. Saved shape is unchanged
  (`rowCount`/`columnCount` default to 0, `location` to `''`).
- `PhysicalGridLocationComponent` (10.0.4) was read: emits only on user
  actions.
- Nested Enter: the mapping editor's handler calls `preventDefault()` before
  its own gate, and `isImplicitSubmission` ignores consumed events, so Enter
  in a mapping input never saves the fragment (it saves the mapping when
  valid and dirty). This mirrors the old nested forms, where the inner form
  owned its inputs. Specs drive real key events for both cases, including a
  dirty, valid fragment with a pristine mapping editor.
- Measured: 89 of 89 tests pass; library builds.

### `cadmus-part-epigraphy-formula-patterns`

- `EpiFormulaPatternsPartComponent`, `EpiFormulaPatternComponent` and
  `EpiFormulaTokenComponent` migrated.
- Token editor: the draft holds tag IDs; labels are a `computed()` over
  `tagEntries`. The old `updateForm()` read `tagEntries()` inside its effect,
  so a change of entries rebuilt the whole form and discarded the edits
  (read in the old source; spec now checks that labels update and edits
  survive). The token editor has no `<input>` of its own (checkboxes and
  textareas only), so the old implicit submission could never save a token;
  it gets no Enter handler.
- Pattern editor: the old effect also closed the token sub-editor on every
  pattern change; kept as an effect keyed on `pattern()` (a reaction, not a
  derivation). Spec added.
- **Hazard found:** `isImplicitSubmission` (`cadmus-ui` 20.0.0, read in its
  fesm) does not check the input's form owner. The thesaurus tree
  (`cadmus-thesaurus-store`) renders its own `<form [formRoot]>`; Enter in
  its filter input would therefore also have saved the pattern, where the
  old nested form only submitted the tree's form. The pattern editor skips
  inputs with a `form` owner. Mutation check: removing that condition fails
  exactly the "Enter in the token editor tags filter" spec.
  - Checked for the other embedded widgets (grepped their fesm templates):
    flag set, physical size/measurements, grid location and decorated counts
    render no `<form>`; the size, measurement and count widgets
    `preventDefault()` their own Enter.
- Measured: 106 of 106 tests pass; library builds.

### `cadmus-part-epigraphy-pg`

- No form code. Measured: 16 of 16 tests pass and it builds after all its
  dependencies (also through `node scripts/build-libs.mjs`: 8 of 8 ok).

### Cross-library

- `track` by identity on lists of draft objects (scripts, support areas,
  frr mappings, formula patterns/tokens) caused `NG0956` warnings in the
  browser after save, because `toDraft` copies arrays, so the rebuilt draft
  has new objects (measured: 2 warnings in the support flow). The rows are
  plain displays, so they now `track $index`. Measured: no warnings in the
  rerun. **Believed** the old code did not warn here, because its form kept
  the very objects it saved; check by running the previous commit.
- Final measured totals: 493 tests in 8 libraries, all green; no
  `@angular/forms` import, `formControl`, `FormBuilder`,
  `NgxToolsValidators`, `deepCopy` or `type="submit"` left in the libraries
  (grepped).

## Browser verification (2026-10-03)

Setup: `node scripts/build-libs.mjs`, `.angular/cache` deleted (after
stopping the previous `ng serve`, which held a lock on it), `ng serve` on
4200, headless Chrome over CDP, real login through the UI, real local API
(mock data). Scripts: `cdp.mjs` plus scenario modules in the session
scratchpad.

- Freshness: the served chunk containing `cadmus-epi-text-area` was fetched
  from the page and contains `onEnterKey` and no `formControl`.
- Support part (data with `null`s, e.g. `size.tag`, `size.d`):
  - pristine after opening and after 1.5 s (past the size widget's
    autosave); feature guard not armed; no `<form>`;
  - text area editor opened (nested): no `<form>`, pristine;
  - Enter in its eid input saved the area into the part and closed the
    editor; the part became dirty and the guard armed; no write request;
  - the save button sent `POST /api/parts`; pristine after save; after
    navigating away and back the saved values were there and the editor was
    pristine;
  - the original part was then restored through the API (verified).
- Signs part, twice (Monaco created fresh, then cached): part, guard and the
  nested sign editor pristine after opening with the real Monaco editor
  showing the description (Monaco renders spaces as U+00A0; compared after
  normalizing). Saving the sign put it in the part, made the part dirty, and
  wrote nothing. The part was not saved (verified unchanged via the API).
- Scripts part (child editor open) and ligatures fragment: pristine after
  opening, no `<form>`.
- No console errors or warnings in the final runs.

## Out of scope: reported, not fixed

- ~~`cadmus-ui` 20.0.0 `isImplicitSubmission` ignores the input's form
  owner.~~ Fixed upstream, see follow-up below.
- `projects/myrmidon/cadmus-part-epigraphy-scripts/src/lib/old.zip` and
  `.../cadmus-part-epigraphy-support/src/lib/old.zip` are tracked in git
  inside library sources.
- ~~`dist/myrmidon/cadmus-part-epigraphy-writing` stale build output.~~
  Removed, see follow-up below.
- ~~`EpiSupportPartComponent` never imported the tooltip.~~ Fixed, see
  follow-up below.
- `cadmus-mat-physical-grid` 10.0.4 (external) logs `console.log("mode",
  ...)` and `"updateGrid: location"`; the specs mock `console.log` for it.
- ~~`saveSign` (signs) and `saveFr` (support-frr) overwrite the item with
  the same ID.~~ Now rejected, see follow-up below.
- The mock data contains a text area with `type: ""`, which the editor's
  `required` rule (old and new) rejects, so that area cannot be saved
  without picking a type.

## Follow-up (2026-10-03)

Done on request after the report above. All verified as stated.

- **Upstream `isImplicitSubmission`** (`D:ProjectsCadmuscadmus-shell-v3`,
  `@myrmidon/cadmus-ui`, bumped to 20.0.1, uncommitted and unpublished):
  now also requires `!target.form`, so Enter in an input owned by a native
  form (e.g. a widget's own `<form>`) is left to that form. Regression
  check: none of the 11 upstream callers (general-ui, philology-ui) renders
  a `<form>` itself, so only inputs inside embedded widgets' forms are
  affected, which before the migration were inner forms that Enter
  submitted alone. Two new specs (nested form; `form="id"` owner) fail
  without the check and pass with it. cadmus-ui 165/165, then cadmus-ui
  rebuilt and general-ui 643/643, philology-ui 511/511 (1 spec file skipped
  by a committed `describe.skip`, pre-existing). CHANGELOG entry added.
  Here, the local `.form` guard in `EpiFormulaPatternComponent` is kept
  (this workspace uses cadmus-ui 20.0.0 from npm) with a comment to drop it
  after upgrading.
- **Stale dist:** removed `dist/myrmidon/cadmus-part-epigraphy-writing`
  (untracked, unreferenced). `dist/cadmus-epigraphy-shell` is the demo
  app's build output and was left.
- **Tooltip:** `EpiSupportPartComponent` now imports the `MatTooltip`
  directive (not the module). New spec: each area row button has a
  `MatTooltip` instance; it fails without the import. Browser: hovering the
  first area button shows "Edit this area". (The other components import
  `MatTooltipModule` or `MatTooltip` already; they were not changed.)
- **Duplicate IDs:** `saveSign` / `saveFr` reject an item whose ID
  belongs to another item (any index other than the edited one) with a
  snackbar error ("A sign/fragment with ID "x" already exists: change the
  ID or delete that sign/fragment.", 5 s), leave the part untouched and the
  child editor open; saving an item under its own ID still works. Specs
  (4 per library, replacing the old "replace on same ID" one): new
  duplicate, edited duplicate, own ID, and the child-editor flow (rejected,
  then fixed ID accepted); the 3 duplicate specs fail when the guard's
  `return` is removed. signs 72/72, support-frr 92/92, support 78/78,
  formula-patterns 106/106; build-libs for the 4 + pg ok, pg 16/16.
  Browser (dev server restarted on a cleared `.angular/cache`): signs and
  a temporary support-frr part (created via `POST /api/parts`, deleted
  afterwards, item verified back to 13 parts with no support-frr) both show
  the snackbar, keep the editor open and the part pristine, then accept a
  new ID; nothing written. No console errors or warnings.
  Note: after a rejected save the child editor is pristine (it reset on its
  own save) while still showing the rejected ID; changing the ID dirties it
  again.

