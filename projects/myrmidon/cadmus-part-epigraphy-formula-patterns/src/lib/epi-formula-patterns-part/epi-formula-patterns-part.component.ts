import { Component, OnInit, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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

import { deepCopy, NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  CloseSaveButtonsComponent,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';
import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject,
} from '@myrmidon/cadmus-core';

import {
  EpiFormulaPattern,
  EpiFormulaPatternsPart,
  EPI_FORMULA_PATTERNS_PART_TYPEID,
} from '../epi-formula-patterns-part';
import { EpiFormulaPatternComponent } from '../epi-formula-pattern/epi-formula-pattern.component';
import { EpiFormulaTokenPipe } from '../epi-formula-token.pipe';

/**
 * EpiFormulaPatterns part editor component.
 * Thesauri: epi-formula-pattern-languages, epi-formula-pattern-tags,
 * epi-formula-token-tags (all optional).
 */
@Component({
  selector: 'cadmus-epi-formula-patterns-part',
  templateUrl: './epi-formula-patterns-part.component.html',
  styleUrls: ['./epi-formula-patterns-part.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
  ],
})
export class EpiFormulaPatternsPartComponent
  extends ModelEditorComponentBase<EpiFormulaPatternsPart>
  implements OnInit
{
  public readonly edited = signal<EpiFormulaPattern | undefined>(undefined);
  public readonly editedIndex = signal<number>(-1);

  // epi-formula-pattern-languages
  public readonly langEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // epi-formula-pattern-tags
  public readonly tagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // epi-formula-token-tags
  public readonly tokTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );

  public patterns: FormControl<EpiFormulaPattern[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    // form
    this.patterns = formBuilder.control([], {
      // at least 1 entry
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      entries: this.patterns,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'epi-formula-pattern-languages';
    if (this.hasThesaurus(key)) {
      this.langEntries.set(thesauri[key].entries);
    } else {
      this.langEntries.set(undefined);
    }
    key = 'epi-formula-pattern-tags';
    if (this.hasThesaurus(key)) {
      this.tagEntries.set(thesauri[key].entries);
    } else {
      this.tagEntries.set(undefined);
    }
    key = 'epi-formula-token-tags';
    if (this.hasThesaurus(key)) {
      this.tokTagEntries.set(thesauri[key].entries);
    } else {
      this.tokTagEntries.set(undefined);
    }
  }

  private updateForm(part?: EpiFormulaPatternsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.patterns.setValue(part.patterns || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(
    data?: EditedObject<EpiFormulaPatternsPart>
  ): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): EpiFormulaPatternsPart {
    let part = this.getEditedPart(
      EPI_FORMULA_PATTERNS_PART_TYPEID
    ) as EpiFormulaPatternsPart;
    part.patterns = this.patterns.value || [];
    return part;
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
    this.edited.set(deepCopy(entry));
  }

  public closePattern(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public savePattern(pattern: EpiFormulaPattern): void {
    const patterns = [...this.patterns.value];
    if (this.editedIndex() === -1) {
      patterns.push(pattern);
    } else {
      patterns.splice(this.editedIndex(), 1, pattern);
    }
    this.patterns.setValue(patterns);
    this.patterns.markAsDirty();
    this.patterns.updateValueAndValidity();
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
          }
          const patterns = [...this.patterns.value];
          patterns.splice(index, 1);
          this.patterns.setValue(patterns);
          this.patterns.markAsDirty();
          this.patterns.updateValueAndValidity();
        }
      });
  }

  public movePatternUp(index: number): void {
    if (index < 1) {
      return;
    }
    const pattern = this.patterns.value[index];
    const patterns = [...this.patterns.value];
    patterns.splice(index, 1);
    patterns.splice(index - 1, 0, pattern);
    this.patterns.setValue(patterns);
    this.patterns.markAsDirty();
    this.patterns.updateValueAndValidity();
  }

  public movePatternDown(index: number): void {
    if (index + 1 >= this.patterns.value.length) {
      return;
    }
    const pattern = this.patterns.value[index];
    const patterns = [...this.patterns.value];
    patterns.splice(index, 1);
    patterns.splice(index + 1, 0, pattern);
    this.patterns.setValue(patterns);
    this.patterns.markAsDirty();
    this.patterns.updateValueAndValidity();
  }
}
