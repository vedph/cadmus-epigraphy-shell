import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { isImplicitSubmission, setFieldFromChild } from '@myrmidon/cadmus-ui';

import { EpiScript } from '../epi-scripts-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface EpiScriptControls {
  system: string;
  script: string;
  casing: string;
  features: string[];
  note: string;
}

function toDraft(script?: EpiScript | null): EpiScriptControls {
  return {
    system: script?.system || '',
    script: script?.script || '',
    casing: script?.casing || '',
    features: [...(script?.features || [])],
    note: script?.note || '',
  };
}

function toModel(draft: EpiScriptControls): EpiScript {
  return {
    system: draft.system.trim() || undefined,
    script: draft.script.trim(),
    casing: draft.casing.trim() || undefined,
    features: draft.features.length ? [...draft.features] : undefined,
    note: draft.note.trim() || undefined,
  };
}

@Component({
  selector: 'cadmus-epi-script',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    FlagSetComponent,
  ],
  templateUrl: './epi-script.component.html',
  styleUrl: './epi-script.component.css',
})
export class EpiScriptComponent {
  public readonly script = model<EpiScript>();
  public readonly scriptCancel = output();

  // epi-script-systems
  public readonly systemEntries = input<ThesaurusEntry[]>();
  // epi-scripts
  public readonly scriptEntries = input<ThesaurusEntry[]>();
  // epi-script-casings
  public readonly casingEntries = input<ThesaurusEntry[]>();
  // epi-script-features
  public readonly featEntries = input<ThesaurusEntry[]>();

  // flags
  public readonly featFlags = computed<Flag[]>(
    () => this.featEntries()?.map(entryToFlag) || [],
  );

  /**
   * The editable draft, derived from the script. The echo of our own save,
   * normalized by toModel, keeps the draft instead of rebuilding it.
   */
  private readonly _draft = linkedSignal<
    EpiScript | undefined,
    EpiScriptControls
  >({
    source: () => this.script(),
    computation: (script, previous) =>
      previous &&
      JSON.stringify(script) === JSON.stringify(toModel(previous.value))
        ? previous.value
        : toDraft(script),
  });

  public readonly form = form(this._draft, (p) => {
    maxLength(p.system, 50);
    required(p.script);
    maxLength(p.script, 50);
    maxLength(p.casing, 50);
    maxLength(p.note, 5000);
  });

  constructor() {
    // clear the interaction state when the draft mirrors the script again
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (this.isDraftInSync(draft)) {
          this.form().reset();
        }
      });
    });
  }

  private isDraftInSync(draft: EpiScriptControls): boolean {
    return JSON.stringify(draft) === JSON.stringify(toDraft(this.script()));
  }

  public onFeatIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.features, [...ids]);
  }

  /**
   * Enter in a text input saves, as the implicit submission of the former
   * form did, unless the save button is disabled.
   */
  public onEnterKey(event: Event): void {
    if (!isImplicitSubmission(event)) {
      return;
    }
    event.preventDefault();
    if (this.form().invalid() || !this.form().dirty()) {
      return;
    }
    this.save();
  }

  public cancel(): void {
    this.scriptCancel.emit();
  }

  public save(): void {
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }
    this.script.set(toModel(this._draft()));
    this.form().reset();
  }
}
