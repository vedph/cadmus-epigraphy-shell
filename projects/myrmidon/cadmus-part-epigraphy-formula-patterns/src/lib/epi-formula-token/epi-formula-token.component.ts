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

import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatHint,
  MatError,
  MatLabel,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  renderLabelFromLastColon,
  ThesaurusTreeComponent,
} from '@myrmidon/cadmus-thesaurus-store';

import { EpiFormulaToken } from '../epi-formula-patterns-part';

interface EpiFormulaTokenControls {
  optional: boolean;
  placeholder: boolean;
  tags: string[];
  values: string;
  note: string;
}

function toDraft(token?: EpiFormulaToken | null): EpiFormulaTokenControls {
  return {
    optional: token?.isOptional || false,
    placeholder: token?.isPlaceholder || false,
    tags: [...(token?.tags || [])],
    values: (token?.values || []).join('\n'),
    note: token?.note || '',
  };
}

function toModel(draft: EpiFormulaTokenControls): EpiFormulaToken {
  return {
    tags: [...draft.tags],
    values: draft.values
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s),
    isOptional: draft.optional ? true : undefined,
    isPlaceholder: draft.placeholder ? true : undefined,
    note: draft.note.trim() || undefined,
  };
}

/**
 * Epigraphic formula pattern's token editor.
 */
@Component({
  selector: 'cadmus-epi-formula-token',
  templateUrl: './epi-formula-token.component.html',
  styleUrls: ['./epi-formula-token.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatCheckbox,
    MatIconButton,
    MatTooltip,
    MatIcon,
    MatFormField,
    MatInput,
    MatHint,
    MatError,
    MatLabel,
    ThesaurusTreeComponent,
  ],
})
export class EpiFormulaTokenComponent {
  /**
   * The token being edited.
   */
  public readonly token = model<EpiFormulaToken>();

  // epi-formula-token-tags
  public readonly tagEntries = input<ThesaurusEntry[]>();

  public readonly editorClose = output();

  /**
   * The editable draft, derived from the token. The echo of our own save,
   * normalized by toModel, keeps the draft instead of rebuilding it.
   */
  private readonly _draft = linkedSignal<
    EpiFormulaToken | undefined,
    EpiFormulaTokenControls
  >({
    source: () => this.token(),
    computation: (token, previous) =>
      previous &&
      JSON.stringify(token) === JSON.stringify(toModel(previous.value))
        ? previous.value
        : toDraft(token),
  });

  public readonly form = form(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.tags, 1);
    required(p.values);
    maxLength(p.values, 500);
    maxLength(p.note, 1000);
  });

  /**
   * The labels of the tags, from their thesaurus entries; a tag with no
   * entry is labeled with its ID.
   */
  public readonly tagLabels = computed<string[]>(() => {
    const entries = this.tagEntries();
    return this.form
      .tags()
      .value()
      .map((id) => entries?.find((e) => e.id === id)?.value ?? id);
  });

  constructor() {
    // clear the interaction state when the draft mirrors the token again
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (this.isDraftInSync(draft)) {
          this.form().reset();
        }
      });
    });
  }

  private isDraftInSync(draft: EpiFormulaTokenControls): boolean {
    return JSON.stringify(draft) === JSON.stringify(toDraft(this.token()));
  }

  private setTags(tags: string[]): void {
    this.form.tags().value.set(tags);
    this.form.tags().markAsDirty();
  }

  public onEntryChange(entry: ThesaurusEntry): void {
    // append the new tag if not already present
    const tags = this.form.tags().value();
    if (tags.includes(entry.id)) {
      return;
    }
    this.setTags([...tags, entry.id]);
  }

  public removeTag(index: number): void {
    const tags = [...this.form.tags().value()];
    tags.splice(index, 1);
    this.setTags(tags);
  }

  public moveTagUp(index: number): void {
    if (index < 1) {
      return;
    }
    const tags = [...this.form.tags().value()];
    const t = tags[index];
    tags[index] = tags[index - 1];
    tags[index - 1] = t;
    this.setTags(tags);
  }

  public moveTagDown(index: number): void {
    const tags = [...this.form.tags().value()];
    if (index + 1 >= tags.length) {
      return;
    }
    const t = tags[index];
    tags[index] = tags[index + 1];
    tags[index + 1] = t;
    this.setTags(tags);
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }
    this.token.set(toModel(this._draft()));
    this.form().reset();
  }

  public renderLabel(label: string): string {
    return renderLabelFromLastColon(label);
  }
}
