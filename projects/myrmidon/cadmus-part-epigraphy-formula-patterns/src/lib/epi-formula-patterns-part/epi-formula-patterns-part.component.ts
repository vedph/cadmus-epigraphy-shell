import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { take } from 'rxjs/operators';

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
} from '@angular/material/expansion';

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  CloseSaveButtonsComponent,
  ModelEditorComponentBase,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  EpiFormulaPattern,
  EpiFormulaPatternsPart,
  EPI_FORMULA_PATTERNS_PART_TYPEID,
} from '../epi-formula-patterns-part';
import { EpiFormulaPatternComponent } from '../epi-formula-pattern/epi-formula-pattern.component';
import { EpiFormulaTokenPipe } from '../epi-formula-token.pipe';

interface EpiFormulaPatternsPartControls {
  patterns: EpiFormulaPattern[];
}

function toDraft(
  part?: EpiFormulaPatternsPart | null,
): EpiFormulaPatternsPartControls {
  return {
    patterns: copyFormValue(part?.patterns || []),
  };
}

/**
 * EpiFormulaPatterns part editor component.
 * Thesauri: epi-formula-pattern-languages, epi-formula-pattern-tags,
 * epi-formula-token-tags (all optional).
 */
@Component({
  selector: 'cadmus-epi-formula-patterns-part',
  templateUrl: './epi-formula-patterns-part.component.html',
  styleUrls: ['./epi-formula-patterns-part.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatIconButton,
    MatTooltip,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    EpiFormulaPatternComponent,
    MatCardActions,
    EpiFormulaTokenPipe,
    TitleCasePipe,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
  ],
})
export class EpiFormulaPatternsPartComponent extends ModelEditorComponentBase<EpiFormulaPatternsPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly edited = signal<EpiFormulaPattern | undefined>(undefined);
  public readonly editedIndex = signal<number>(-1);

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    // at least 1 entry
    NgxToolsSignalValidators.strictMinLength(p.patterns, 1);
  });

  // epi-formula-pattern-languages
  public readonly langEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-formula-pattern-languages']?.entries,
  );
  // epi-formula-pattern-tags
  public readonly tagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-formula-pattern-tags']?.entries,
  );
  // epi-formula-token-tags
  public readonly tokTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-formula-token-tags']?.entries,
  );

  protected getValue(): EpiFormulaPatternsPart {
    const part = this.getEditedPart(
      EPI_FORMULA_PATTERNS_PART_TYPEID,
    ) as EpiFormulaPatternsPart;
    part.patterns = copyFormValue(this._draft().patterns);
    return part;
  }

  private setPatterns(patterns: EpiFormulaPattern[]): void {
    this.form.patterns().value.set(patterns);
    this.form.patterns().markAsDirty();
  }

  public addPattern(): void {
    const pattern: EpiFormulaPattern = {
      language: '',
      tokens: [],
    };
    this.editPattern(pattern, -1);
  }

  public editPattern(entry: EpiFormulaPattern, index: number): void {
    this.editedIndex.set(index);
    this.edited.set(copyFormValue(entry));
  }

  public closePattern(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public savePattern(pattern: EpiFormulaPattern): void {
    const patterns = [...this.form.patterns().value()];
    if (this.editedIndex() === -1) {
      patterns.push(copyFormValue(pattern));
    } else {
      patterns.splice(this.editedIndex(), 1, copyFormValue(pattern));
    }
    this.setPatterns(patterns);
    this.closePattern();
  }

  public deletePattern(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete pattern?')
      .pipe(take(1))
      .subscribe((yes) => {
        if (yes) {
          if (this.editedIndex() === index) {
            this.closePattern();
          } else if (this.editedIndex() > index) {
            // keep the edited index pointing to the edited pattern
            this.editedIndex.set(this.editedIndex() - 1);
          }
          const patterns = [...this.form.patterns().value()];
          patterns.splice(index, 1);
          this.setPatterns(patterns);
        }
      });
  }

  /**
   * Keep the edited index pointing to the edited pattern when the patterns
   * at the specified indexes are swapped.
   */
  private swapEditedIndex(a: number, b: number): void {
    if (this.editedIndex() === a) {
      this.editedIndex.set(b);
    } else if (this.editedIndex() === b) {
      this.editedIndex.set(a);
    }
  }

  public movePatternUp(index: number): void {
    if (index < 1) {
      return;
    }
    const patterns = [...this.form.patterns().value()];
    const pattern = patterns[index];
    patterns.splice(index, 1);
    patterns.splice(index - 1, 0, pattern);
    this.swapEditedIndex(index, index - 1);
    this.setPatterns(patterns);
  }

  public movePatternDown(index: number): void {
    const patterns = [...this.form.patterns().value()];
    if (index + 1 >= patterns.length) {
      return;
    }
    const pattern = patterns[index];
    patterns.splice(index, 1);
    patterns.splice(index + 1, 0, pattern);
    this.swapEditedIndex(index, index + 1);
    this.setPatterns(patterns);
  }
}
