import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
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

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { copyFormValue, isImplicitSubmission } from '@myrmidon/cadmus-ui';

import {
  EpiFormulaPattern,
  EpiFormulaToken,
} from '../epi-formula-patterns-part';
import { EpiFormulaTokenComponent } from '../epi-formula-token/epi-formula-token.component';
import { EpiFormulaTokenPipe } from '../epi-formula-token.pipe';

interface EpiFormulaPatternControls {
  eid: string;
  language: string;
  tag: string;
  tokens: EpiFormulaToken[];
}

function toDraft(
  pattern?: EpiFormulaPattern | null,
): EpiFormulaPatternControls {
  return {
    eid: pattern?.eid || '',
    language: pattern?.language || '',
    tag: pattern?.tag || '',
    tokens: copyFormValue(pattern?.tokens || []),
  };
}

function toModel(draft: EpiFormulaPatternControls): EpiFormulaPattern {
  return {
    eid: draft.eid.trim() || undefined,
    language: draft.language.trim(),
    tag: draft.tag.trim() || undefined,
    tokens: copyFormValue(draft.tokens),
  };
}

/**
 * Epigraphic formula pattern editor.
 */
@Component({
  selector: 'cadmus-epi-formula-pattern',
  templateUrl: './epi-formula-pattern.component.html',
  styleUrls: ['./epi-formula-pattern.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
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
  private readonly _dialogService = inject(DialogService);

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

  public readonly edited = signal<EpiFormulaToken | undefined>(undefined);
  public readonly editedIndex = signal<number>(-1);

  /**
   * The editable draft, derived from the pattern. The echo of our own save,
   * normalized by toModel, keeps the draft instead of rebuilding it.
   */
  private readonly _draft = linkedSignal<
    EpiFormulaPattern | undefined,
    EpiFormulaPatternControls
  >({
    source: () => this.pattern(),
    computation: (pattern, previous) =>
      previous &&
      JSON.stringify(pattern) === JSON.stringify(toModel(previous.value))
        ? previous.value
        : toDraft(pattern),
  });

  public readonly form = form(this._draft, (p) => {
    maxLength(p.eid, 500);
    required(p.language);
    maxLength(p.language, 50);
    maxLength(p.tag, 50);
    NgxToolsSignalValidators.strictMinLength(p.tokens, 1);
  });

  constructor() {
    // any pattern set closes the token being edited
    effect(() => {
      this.pattern();
      untracked(() => this.closeToken());
    });

    // clear the interaction state when the draft mirrors the pattern again
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (this.isDraftInSync(draft)) {
          this.form().reset();
        }
      });
    });
  }

  private isDraftInSync(draft: EpiFormulaPatternControls): boolean {
    return JSON.stringify(draft) === JSON.stringify(toDraft(this.pattern()));
  }

  private setTokens(tokens: EpiFormulaToken[]): void {
    this.form.tokens().value.set(tokens);
    this.form.tokens().markAsDirty();
  }

  public addToken(): void {
    const token: EpiFormulaToken = {
      tags: [],
      values: [],
    };
    this.editToken(token, -1);
  }

  public editToken(token: EpiFormulaToken, index: number): void {
    this.editedIndex.set(index);
    this.edited.set(copyFormValue(token));
  }

  public closeToken(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveToken(token: EpiFormulaToken): void {
    const tokens = [...this.form.tokens().value()];
    if (this.editedIndex() === -1) {
      tokens.push(copyFormValue(token));
    } else {
      tokens.splice(this.editedIndex(), 1, copyFormValue(token));
    }
    this.setTokens(tokens);
    this.closeToken();
  }

  public deleteToken(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete token?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          if (this.editedIndex() === index) {
            this.closeToken();
          } else if (this.editedIndex() > index) {
            // keep the edited index pointing to the edited token
            this.editedIndex.set(this.editedIndex() - 1);
          }
          const tokens = [...this.form.tokens().value()];
          tokens.splice(index, 1);
          this.setTokens(tokens);
        }
      });
  }

  /**
   * Keep the edited index pointing to the edited token when the tokens
   * at the specified indexes are swapped.
   */
  private swapEditedIndex(a: number, b: number): void {
    if (this.editedIndex() === a) {
      this.editedIndex.set(b);
    } else if (this.editedIndex() === b) {
      this.editedIndex.set(a);
    }
  }

  public moveTokenUp(index: number): void {
    if (index < 1) {
      return;
    }
    const tokens = [...this.form.tokens().value()];
    const token = tokens[index];
    tokens.splice(index, 1);
    tokens.splice(index - 1, 0, token);
    this.swapEditedIndex(index, index - 1);
    this.setTokens(tokens);
  }

  public moveTokenDown(index: number): void {
    const tokens = [...this.form.tokens().value()];
    if (index + 1 >= tokens.length) {
      return;
    }
    const token = tokens[index];
    tokens.splice(index, 1);
    tokens.splice(index + 1, 0, token);
    this.swapEditedIndex(index, index + 1);
    this.setTokens(tokens);
  }

  /**
   * Enter in a text input saves, as the implicit submission of the former
   * form did, unless the save button is disabled. Inputs owned by another
   * form (e.g. the thesaurus tree filter in the token editor) submit that
   * form instead, as they did when this editor was a form.
   * The form check is redundant from @myrmidon/cadmus-ui 20.0.1, whose
   * isImplicitSubmission excludes them: drop it when upgrading.
   */
  public onEnterKey(event: Event): void {
    if (
      !isImplicitSubmission(event) ||
      (event.target as HTMLInputElement).form
    ) {
      return;
    }
    event.preventDefault();
    if (this.form().invalid() || !this.form().dirty()) {
      return;
    }
    this.save();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }
    this.pattern.set(toModel(this._draft()));
    this.form().reset();
  }
}
