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

import { EllipsisPipe, NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  CloseSaveButtonsComponent,
  ModelEditorComponentBase,
  HelpLinkComponent,
  copyFormValue,
} from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  EPI_SIGNS_PART_TYPEID,
  EpiSign,
  EpiSignsPart,
} from '../epi-signs-part';
import { EpiSignComponent } from '../epi-sign/epi-sign.component';

interface EpiSignsPartControls {
  signs: EpiSign[];
}

function toDraft(part?: EpiSignsPart | null): EpiSignsPartControls {
  return {
    signs: copyFormValue(part?.signs || []),
  };
}

/**
 * EpiSignsPart editor component.
 * Thesauri: epi-signs-measure-names, physical-size-units, physical-size-dim-tags,
 * epi-signs-features (all optional).
 */
@Component({
  selector: 'cadmus-epi-signs-part',
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
    EllipsisPipe,
    EpiSignComponent,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
  ],
  templateUrl: './epi-signs-part.component.html',
  styleUrl: './epi-signs-part.component.scss',
})
export class EpiSignsPartComponent extends ModelEditorComponentBase<EpiSignsPart> {
  private readonly _dialogService = inject(DialogService);
  private readonly _snackbar = inject(MatSnackBar);

  public readonly edited = signal<EpiSign | undefined>(undefined);
  public readonly editedIndex = signal<number>(-1);

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    // at least 1 entry
    NgxToolsSignalValidators.strictMinLength(p.signs, 1);
  });

  // epi-signs-measure-names
  public readonly measNameEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-signs-measure-names']?.entries,
  );
  // physical-size-units
  public readonly measUnitEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-units']?.entries,
  );
  // physical-size-dim-tags
  public readonly measDimTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-dim-tags']?.entries,
  );
  // epi-signs-features
  public readonly featEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-signs-features']?.entries,
  );

  protected getValue(): EpiSignsPart {
    const part = this.getEditedPart(EPI_SIGNS_PART_TYPEID) as EpiSignsPart;
    part.signs = copyFormValue(this._draft().signs);
    return part;
  }

  private setSigns(signs: EpiSign[]): void {
    this.form.signs().value.set(signs);
    this.form.signs().markAsDirty();
  }

  public addSign(): void {
    const sign: EpiSign = {
      id: '',
    };
    this.editSign(sign, -1);
  }

  public editSign(entry: EpiSign, index: number): void {
    this.editedIndex.set(index);
    this.edited.set(copyFormValue(entry));
  }

  public closeSign(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  /**
   * Save the edited sign. A sign whose ID belongs to another sign is
   * rejected with an error message, leaving the sign editor open: the
   * user must change its ID, or delete the other sign.
   */
  public saveSign(sign: EpiSign): void {
    const signs = [...this.form.signs().value()];
    if (signs.some((s, i) => i !== this.editedIndex() && s.id === sign.id)) {
      this._snackbar.open(
        `A sign with ID "${sign.id}" already exists: change the ID or delete that sign.`,
        'OK',
        { duration: 5000 },
      );
      return;
    }
    if (this.editedIndex() === -1) {
      signs.push(copyFormValue(sign));
    } else {
      signs.splice(this.editedIndex(), 1, copyFormValue(sign));
    }
    this.setSigns(signs);
    this.closeSign();
  }

  public deleteSign(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete sign?')
      .pipe(take(1))
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedIndex() === index) {
            this.closeSign();
          } else if (this.editedIndex() > index) {
            // keep the edited index pointing to the edited sign
            this.editedIndex.set(this.editedIndex() - 1);
          }
          const signs = [...this.form.signs().value()];
          signs.splice(index, 1);
          this.setSigns(signs);
        }
      });
  }

  /**
   * Keep the edited index pointing to the edited sign when the signs
   * at the specified indexes are swapped.
   */
  private swapEditedIndex(a: number, b: number): void {
    if (this.editedIndex() === a) {
      this.editedIndex.set(b);
    } else if (this.editedIndex() === b) {
      this.editedIndex.set(a);
    }
  }

  public moveSignUp(index: number): void {
    if (index < 1) {
      return;
    }
    const signs = [...this.form.signs().value()];
    const sign = signs[index];
    signs.splice(index, 1);
    signs.splice(index - 1, 0, sign);
    this.swapEditedIndex(index, index - 1);
    this.setSigns(signs);
  }

  public moveSignDown(index: number): void {
    const signs = [...this.form.signs().value()];
    if (index + 1 >= signs.length) {
      return;
    }
    const sign = signs[index];
    signs.splice(index, 1);
    signs.splice(index + 1, 0, sign);
    this.swapEditedIndex(index, index + 1);
    this.setSigns(signs);
  }
}
