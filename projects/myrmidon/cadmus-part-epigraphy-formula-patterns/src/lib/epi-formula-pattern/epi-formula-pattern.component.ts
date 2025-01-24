import { Component, effect, input, model, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { take } from 'rxjs';

import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
} from '@angular/material/expansion';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  EpiFormulaPattern,
  EpiFormulaToken,
} from '../epi-formula-patterns-part';
import { EpiFormulaTokenComponent } from '../epi-formula-token/epi-formula-token.component';
import { EpiFormulaTokenPipe } from '../epi-formula-token.pipe';

/**
 * Epigraphic formula pattern editor.
 */
@Component({
  selector: 'cadmus-epi-formula-pattern',
  templateUrl: './epi-formula-pattern.component.html',
  styleUrls: ['./epi-formula-pattern.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatSelect,
    MatOption,
    MatButton,
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    EpiFormulaTokenComponent,
    EpiFormulaTokenPipe,
  ],
})
export class EpiFormulaPatternComponent {
  /**
   * The pattern being edited.
   */
  public readonly pattern = model<EpiFormulaPattern>();

  // epi-formula-pattern-languages
  public readonly langEntries = input<ThesaurusEntry[]>();
  // epi-formula-pattern-tags
  public readonly tagEntries = input<ThesaurusEntry[]>();
  // epi-formula-token-tags
  public readonly tokTagEntries = input<ThesaurusEntry[]>();

  public readonly editorClose = output();

  public editedIndex: number;
  public edited?: EpiFormulaToken;

  public eid: FormControl<string | null>;
  public language: FormControl<string>;
  public tag: FormControl<string | null>;
  public tokens: FormControl<EpiFormulaToken[]>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder, private _dialogService: DialogService) {
    this.editedIndex = -1;
    // form
    this.eid = formBuilder.control(null, Validators.maxLength(500));
    this.language = formBuilder.control('', {
      validators: [Validators.required, Validators.maxLength(50)],
      nonNullable: true,
    });
    this.tag = formBuilder.control(null, Validators.maxLength(50));
    this.tokens = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.form = formBuilder.group({
      eid: this.eid,
      language: this.language,
      tag: this.tag,
      tokens: this.tokens,
    });

    effect(() => {
      this.updateForm(this.pattern());
    });
  }

  private updateForm(pattern?: EpiFormulaPattern) {
    this.closeToken();

    if (!pattern) {
      this.form.reset();
      return;
    }
    this.eid.setValue(pattern.eid || null);
    this.language.setValue(pattern.language);
    this.tag.setValue(pattern.tag || null);
    this.tokens.setValue(pattern.tokens);
    this.form.markAsPristine();
  }
  public addToken(): void {
    const token: EpiFormulaToken = {
      tags: [],
      values: [],
    };
    this.editToken(token, -1);
  }

  public editToken(token: EpiFormulaToken, index: number): void {
    this.editedIndex = index;
    this.edited = token;
  }

  public closeToken(): void {
    this.editedIndex = -1;
    this.edited = undefined;
  }

  public saveToken(token: EpiFormulaToken): void {
    const tokens = [...this.tokens.value];
    if (this.editedIndex === -1) {
      tokens.push(token);
    } else {
      tokens.splice(this.editedIndex, 1, token);
    }
    this.tokens.setValue(tokens);
    this.tokens.markAsDirty();
    this.tokens.updateValueAndValidity();
    this.closeToken();
  }

  public deleteToken(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete token?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          if (this.editedIndex === index) {
            this.closeToken();
          }
          const tokens = [...this.tokens.value];
          tokens.splice(index, 1);
          this.tokens.setValue(tokens);
          this.tokens.markAsDirty();
          this.tokens.updateValueAndValidity();
        }
      });
  }

  public moveTokenUp(index: number): void {
    if (index < 1) {
      return;
    }
    const token = this.tokens.value[index];
    const entries = [...this.tokens.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, token);
    this.tokens.setValue(entries);
    this.tokens.markAsDirty();
    this.tokens.updateValueAndValidity();
  }

  public moveTokenDown(index: number): void {
    if (index + 1 >= this.tokens.value.length) {
      return;
    }
    const entry = this.tokens.value[index];
    const entries = [...this.tokens.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.tokens.setValue(entries);
    this.tokens.markAsDirty();
    this.tokens.updateValueAndValidity();
  }

  private getPattern(): EpiFormulaPattern {
    return {
      eid: this.eid.value || undefined,
      language: this.language.value,
      tag: this.tag.value || undefined,
      tokens: this.tokens.value,
    };
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }
    this.pattern.set(this.getPattern());
  }
}
