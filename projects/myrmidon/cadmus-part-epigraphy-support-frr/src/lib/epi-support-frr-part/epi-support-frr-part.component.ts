import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { take } from 'rxjs';

import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  CloseSaveButtonsComponent,
  ModelEditorComponentBase,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { PhysicalSizePipe } from '@myrmidon/cadmus-mat-physical-size';

import {
  EPI_SUPPORT_FRR_PART_TYPEID,
  EpiSupportFr,
  EpiSupportFrrPart,
} from '../epi-support-frr-part';
import { EpiSupportFrComponent } from '../epi-support-fr/epi-support-fr.component';

interface EpiSupportFrrPartControls {
  fragments: EpiSupportFr[];
}

function toDraft(part?: EpiSupportFrrPart | null): EpiSupportFrrPartControls {
  return {
    fragments: copyFormValue(part?.fragments || []),
  };
}

/**
 * EpiSupportFrrPart editor component.
 * Thesauri: physical-size-units, physical-size-tags, physical-size-dim-tags,
 * physical-grid-presets (all optional).
 */
@Component({
  selector: 'cadmus-epi-support-frr-part',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    PhysicalSizePipe,
    EpiSupportFrComponent,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
  ],
  templateUrl: './epi-support-frr-part.component.html',
  styleUrl: './epi-support-frr-part.component.scss',
})
export class EpiSupportFrrPartComponent extends ModelEditorComponentBase<EpiSupportFrrPart> {
  private readonly _dialogService = inject(DialogService);
  private readonly _snackbar = inject(MatSnackBar);

  public readonly edited = signal<EpiSupportFr | undefined>(undefined);
  public readonly editedIndex = signal<number>(-1);

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    // at least 1 entry
    NgxToolsSignalValidators.strictMinLength(p.fragments, 1);
  });

  // physical-size-units
  public readonly unitEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-units']?.entries,
  );
  // physical-size-tags
  public readonly tagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-tags']?.entries,
  );
  // physical-size-dim-tags
  public readonly dimTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-dim-tags']?.entries,
  );
  // physical-grid-presets
  public readonly gridPresetEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-grid-presets']?.entries,
  );

  protected getValue(): EpiSupportFrrPart {
    const part = this.getEditedPart(
      EPI_SUPPORT_FRR_PART_TYPEID,
    ) as EpiSupportFrrPart;
    part.fragments = copyFormValue(this._draft().fragments);
    return part;
  }

  private setFragments(fragments: EpiSupportFr[]): void {
    this.form.fragments().value.set(fragments);
    this.form.fragments().markAsDirty();
  }

  public addFr(): void {
    const fr: EpiSupportFr = {
      id: '',
    };
    this.editFr(fr, -1);
  }

  public editFr(entry: EpiSupportFr, index: number): void {
    this.editedIndex.set(index);
    this.edited.set(copyFormValue(entry));
  }

  public closeFr(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  /**
   * Save the edited fragment. A fragment whose ID belongs to another
   * fragment is rejected with an error message, leaving the fragment editor
   * open: the user must change its ID, or delete the other fragment.
   */
  public saveFr(fr: EpiSupportFr): void {
    const fragments = [...this.form.fragments().value()];
    if (fragments.some((f, i) => i !== this.editedIndex() && f.id === fr.id)) {
      this._snackbar.open(
        `A fragment with ID "${fr.id}" already exists: change the ID or delete that fragment.`,
        'OK',
        { duration: 5000 },
      );
      return;
    }
    if (this.editedIndex() === -1) {
      fragments.push(copyFormValue(fr));
    } else {
      fragments.splice(this.editedIndex(), 1, copyFormValue(fr));
    }
    this.setFragments(fragments);
    this.closeFr();
  }

  public deleteFr(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete fragment?')
      .pipe(take(1))
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedIndex() === index) {
            this.closeFr();
          } else if (this.editedIndex() > index) {
            // keep the edited index pointing to the edited fragment
            this.editedIndex.set(this.editedIndex() - 1);
          }
          const fragments = [...this.form.fragments().value()];
          fragments.splice(index, 1);
          this.setFragments(fragments);
        }
      });
  }

  /**
   * Keep the edited index pointing to the edited fragment when the fragments
   * at the specified indexes are swapped.
   */
  private swapEditedIndex(a: number, b: number): void {
    if (this.editedIndex() === a) {
      this.editedIndex.set(b);
    } else if (this.editedIndex() === b) {
      this.editedIndex.set(a);
    }
  }

  public moveFrUp(index: number): void {
    if (index < 1) {
      return;
    }
    const fragments = [...this.form.fragments().value()];
    const fr = fragments[index];
    fragments.splice(index, 1);
    fragments.splice(index - 1, 0, fr);
    this.swapEditedIndex(index, index - 1);
    this.setFragments(fragments);
  }

  public moveFrDown(index: number): void {
    const fragments = [...this.form.fragments().value()];
    if (index + 1 >= fragments.length) {
      return;
    }
    const fr = fragments[index];
    fragments.splice(index, 1);
    fragments.splice(index + 1, 0, fr);
    this.swapEditedIndex(index, index + 1);
    this.setFragments(fragments);
  }
}
