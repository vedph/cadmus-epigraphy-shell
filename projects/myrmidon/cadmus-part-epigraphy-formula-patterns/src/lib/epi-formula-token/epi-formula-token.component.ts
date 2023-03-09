import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { renderLabelFromLastColon } from '@myrmidon/cadmus-ui';
import { NgToolsValidators } from '@myrmidon/ng-tools';

import { EpiFormulaToken } from '../epi-formula-patterns-part';

/**
 * Epigraphic formula pattern's token editor.
 */
@Component({
  selector: 'cadmus-epi-formula-token',
  templateUrl: './epi-formula-token.component.html',
  styleUrls: ['./epi-formula-token.component.css'],
})
export class EpiFormulaTokenComponent {
  private _token: EpiFormulaToken | undefined;

  @Input()
  public get token(): EpiFormulaToken | undefined | null {
    return this._token;
  }
  public set token(value: EpiFormulaToken | undefined | null) {
    if (this._token === value) {
      return;
    }
    this._token = value || undefined;
    this.updateForm(this._token);
  }

  // epi-formula-token-tags
  @Input()
  public tagEntries: ThesaurusEntry[] | undefined;

  @Output()
  public tokenChange: EventEmitter<EpiFormulaToken>;

  @Output()
  public editorClose: EventEmitter<any>;

  public optional: FormControl<boolean>;
  public placeholder: FormControl<boolean>;
  public tags: FormControl<ThesaurusEntry[]>;
  public values: FormControl<string[]>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    // form
    this.optional = formBuilder.control(false, { nonNullable: true });
    this.placeholder = formBuilder.control(false, { nonNullable: true });
    this.tags = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.values = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
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
    // events
    this.tokenChange = new EventEmitter<EpiFormulaToken>();
    this.editorClose = new EventEmitter<any>();
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
        (t) => this.tagEntries?.find((e) => e.id === t) || { id: t, value: t }
      )
    );
    this.values.setValue(pattern.values);
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
      tags: this.tags.value.map((e) => e.id),
      values: this.values.value,
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
    this._token = this.getToken();
    this.tokenChange.emit(this._token);
  }

  public renderLabel(label: string): string {
    return renderLabelFromLastColon(label);
  }
}
