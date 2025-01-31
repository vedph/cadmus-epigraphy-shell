import { Component, effect, input, model, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

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

import { NgxToolsValidators } from '@myrmidon/ngx-tools';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  renderLabelFromLastColon,
  ThesaurusTreeComponent,
} from '@myrmidon/cadmus-ui';

import { EpiFormulaToken } from '../epi-formula-patterns-part';

/**
 * Epigraphic formula pattern's token editor.
 */
@Component({
  selector: 'cadmus-epi-formula-token',
  templateUrl: './epi-formula-token.component.html',
  styleUrls: ['./epi-formula-token.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
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

  public editorClose = output();

  public optional: FormControl<boolean>;
  public placeholder: FormControl<boolean>;
  public tags: FormControl<ThesaurusEntry[]>;
  public values: FormControl<string>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    // form
    this.optional = formBuilder.control(false, { nonNullable: true });
    this.placeholder = formBuilder.control(false, { nonNullable: true });
    this.tags = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.values = formBuilder.control('', {
      validators: [Validators.required, Validators.maxLength(500)],
      nonNullable: true,
    });
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      optional: this.optional,
      placeholder: this.placeholder,
      tags: this.tags,
      values: this.values,
      note: this.note,
    });

    effect(() => {
      this.updateForm(this.token());
    });
  }

  private updateForm(pattern: EpiFormulaToken | undefined): void {
    if (!pattern) {
      this.form.reset();
      return;
    }
    this.optional.setValue(pattern.isOptional || false);
    this.placeholder.setValue(pattern.isPlaceholder || false);
    this.tags.setValue(
      pattern.tags.map(
        (t) => this.tagEntries()?.find((e) => e.id === t) || { id: t, value: t }
      )
    );
    this.values.setValue(pattern.values.join('\n'));
    this.note.setValue(pattern.note || null);
    this.form.markAsPristine();
  }

  public onEntryChange(entry: ThesaurusEntry): void {
    // append the new tag if not already present
    if (this.tags.value?.some((e: ThesaurusEntry) => e.id === entry.id)) {
      return;
    }
    const tags = [...this.tags.value];
    tags.push(entry);
    this.tags.setValue(tags);
    this.tags.markAsDirty();
    this.tags.updateValueAndValidity();
  }

  public removeTag(index: number): void {
    const tags = [...this.tags.value];
    tags.splice(index, 1);
    this.tags.setValue(tags);
    this.tags.markAsDirty();
    this.tags.updateValueAndValidity();
  }

  public moveTagUp(index: number): void {
    if (index < 1) {
      return;
    }
    const tags = [...this.tags.value];
    const e = tags[index];
    tags[index] = tags[index - 1];
    tags[index - 1] = e;
    this.tags.setValue(tags);
    this.tags.markAsDirty();
    this.tags.updateValueAndValidity();
  }

  public moveTagDown(index: number): void {
    if (index + 1 >= this.tags.value.length) {
      return;
    }
    const tags = [...this.tags.value];
    const e = tags[index];
    tags[index] = tags[index + 1];
    tags[index + 1] = e;
    this.tags.setValue(tags);
    this.tags.markAsDirty();
    this.tags.updateValueAndValidity();
  }

  private getToken(): EpiFormulaToken {
    return {
      tags: this.tags.value.map((e: ThesaurusEntry) => e.id),
      values: this.values.value
        .split('\n')
        .map((s: string) => s.trim())
        .filter((s: string) => s),
      isOptional: this.optional.value ? true : undefined,
      isPlaceholder: this.placeholder.value ? true : undefined,
      note: this.note.value?.trim(),
    };
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.token.set(this.getToken());
  }

  public renderLabel(label: string): string {
    return renderLabelFromLastColon(label);
  }
}
