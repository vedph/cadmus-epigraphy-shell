import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { FormField, maxLength, required } from '@angular/forms/signals';

import {
  MatCard,
  MatCardHeader,
  MatCardAvatar,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { TitleCasePipe } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { take } from 'rxjs';

import { FlatLookupPipe } from '@myrmidon/ngx-tools';
import {
  PhysicalSize,
  PhysicalSizeComponent,
  PhysicalSizePipe,
} from '@myrmidon/cadmus-mat-physical-size';
import {
  DecoratedCount,
  DecoratedCountsComponent,
} from '@myrmidon/cadmus-refs-decorated-counts';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CloseSaveButtonsComponent,
  ModelEditorComponentBase,
  HelpLinkComponent,
  copyFormValue,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import {
  EpiSupportPart,
  EPI_SUPPORT_PART_TYPEID,
  EpiTextArea,
} from '../epi-support-part';
import { EpiTextAreaComponent } from '../epi-text-area/epi-text-area.component';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface EpiSupportPartControls {
  material: string;
  objectType: string;
  hasSize: boolean;
  size: PhysicalSize | null;
  counts: DecoratedCount[];
  features: string[];
  areas: EpiTextArea[];
  note: string;
}

function toDraft(part?: EpiSupportPart | null): EpiSupportPartControls {
  return {
    material: part?.material || '',
    objectType: part?.objectType || '',
    hasSize: !!part?.size,
    size: part?.size ? copyFormValue(part.size) : null,
    counts: copyFormValue(part?.counts || []),
    features: [...(part?.features || [])],
    areas: copyFormValue(part?.textAreas || []),
    note: part?.note || '',
  };
}

/**
 * EpiSupport part editor component.
 * Thesauri: epi-support-materials, epi-support-object-types,
 * epi-support-count-types, epi-support-count-tags, epi-support-features,
 * physical-size-units, physical-size-tags, physical-size-dim-tags.
 * epi-support-text-area-types, epi-support-text-area-layouts,
 * epi-support-text-area-features, epi-support-text-area-frame-types.
 */
@Component({
  selector: 'cadmus-epi-support-part',
  templateUrl: './epi-support-part.component.html',
  styleUrls: ['./epi-support-part.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    MatButtonModule,
    MatTooltip,
    MatIcon,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatCardTitle,
    MatCardContent,
    MatTabGroup,
    MatTab,
    MatExpansionModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatError,
    MatInput,
    MatCheckbox,
    TitleCasePipe,
    PhysicalSizeComponent,
    DecoratedCountsComponent,
    FlagSetComponent,
    MatCardActions,
    CloseSaveButtonsComponent,
    EpiTextAreaComponent,
    FlatLookupPipe,
    PhysicalSizePipe,
    HelpLinkComponent,
  ],
})
export class EpiSupportPartComponent extends ModelEditorComponentBase<EpiSupportPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedArea = signal<EpiTextArea | undefined>(undefined);
  public readonly editedAreaIndex = signal<number>(-1);

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    required(p.material);
    maxLength(p.material, 50);
    maxLength(p.objectType, 50);
    maxLength(p.note, 5000);
  });

  // flags
  public readonly featFlags = computed<Flag[]>(() => {
    return this.featEntries()?.map(entryToFlag) || [];
  });

  // epi-support-materials
  public readonly matEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-support-materials']?.entries,
  );
  // epi-support-object-types
  public readonly objTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-support-object-types']?.entries,
  );
  // epi-support-count-types
  public readonly countTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-support-count-types']?.entries,
  );
  // epi-support-count-tags
  public readonly countTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-support-count-tags']?.entries,
  );
  // epi-support-features
  public readonly featEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-support-features']?.entries,
  );
  // size:
  // physical-size-units
  public readonly szUnitEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-units']?.entries,
  );
  // physical-size-tags
  public readonly szTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-tags']?.entries,
  );
  // physical-size-dim-tags
  public readonly szDimTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-dim-tags']?.entries,
  );
  // text areas:
  // epi-support-text-area-types
  public readonly textAreaTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-support-text-area-types']?.entries,
  );
  // epi-support-text-area-layouts
  public readonly textAreaLayoutEntries = computed<
    ThesaurusEntry[] | undefined
  >(() => this.data()?.thesauri?.['epi-support-text-area-layouts']?.entries);
  // epi-support-text-area-features
  public readonly textAreaFeatEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-support-text-area-features']?.entries,
  );
  // epi-support-text-area-frame-types
  public readonly textAreaFrameEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['epi-support-text-area-frame-types']?.entries,
  );

  public onFeatIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.features, [...ids]);
  }

  public onSupportSizeChange(size: PhysicalSize | undefined): void {
    setFieldFromChild(this.form.size, size ? copyFormValue(size) : null);
  }

  public onCountsChange(counts: DecoratedCount[] | undefined): void {
    setFieldFromChild(this.form.counts, copyFormValue(counts || []));
  }

  protected getValue(): EpiSupportPart {
    const part = this.getEditedPart(EPI_SUPPORT_PART_TYPEID) as EpiSupportPart;
    const draft = this._draft();
    part.material = draft.material.trim();
    part.objectType = draft.objectType.trim() || undefined;
    part.size =
      draft.hasSize && draft.size ? copyFormValue(draft.size) : undefined;
    part.counts = draft.counts.length ? copyFormValue(draft.counts) : undefined;
    part.features = draft.features.length ? [...draft.features] : undefined;
    part.textAreas = draft.areas.length
      ? copyFormValue(draft.areas)
      : undefined;
    part.note = draft.note.trim() || undefined;
    return part;
  }

  private setAreas(areas: EpiTextArea[]): void {
    this.form.areas().value.set(areas);
    this.form.areas().markAsDirty();
  }

  public addArea(): void {
    const entry: EpiTextArea = {
      type: this.textAreaTypeEntries()?.length
        ? this.textAreaTypeEntries()![0].id
        : '',
    };
    this.editArea(entry, -1);
  }

  public editArea(entry: EpiTextArea, index: number): void {
    this.editedAreaIndex.set(index);
    this.editedArea.set(copyFormValue(entry));
  }

  public closeArea(): void {
    this.editedAreaIndex.set(-1);
    this.editedArea.set(undefined);
  }

  public saveArea(entry: EpiTextArea): void {
    const areas = [...this.form.areas().value()];
    if (this.editedAreaIndex() === -1) {
      areas.push(copyFormValue(entry));
    } else {
      areas.splice(this.editedAreaIndex(), 1, copyFormValue(entry));
    }
    this.setAreas(areas);
    this.closeArea();
  }

  public deleteArea(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete area?')
      .pipe(take(1))
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedAreaIndex() === index) {
            this.closeArea();
          } else if (this.editedAreaIndex() > index) {
            // keep the edited index pointing to the edited area
            this.editedAreaIndex.set(this.editedAreaIndex() - 1);
          }
          const areas = [...this.form.areas().value()];
          areas.splice(index, 1);
          this.setAreas(areas);
        }
      });
  }

  /**
   * Keep the edited area index pointing to the edited area when the areas
   * at the specified indexes are swapped.
   */
  private swapEditedAreaIndex(a: number, b: number): void {
    if (this.editedAreaIndex() === a) {
      this.editedAreaIndex.set(b);
    } else if (this.editedAreaIndex() === b) {
      this.editedAreaIndex.set(a);
    }
  }

  public moveAreaUp(index: number): void {
    if (index < 1) {
      return;
    }
    const areas = [...this.form.areas().value()];
    const area = areas[index];
    areas.splice(index, 1);
    areas.splice(index - 1, 0, area);
    this.swapEditedAreaIndex(index, index - 1);
    this.setAreas(areas);
  }

  public moveAreaDown(index: number): void {
    const areas = [...this.form.areas().value()];
    if (index + 1 >= areas.length) {
      return;
    }
    const area = areas[index];
    areas.splice(index, 1);
    areas.splice(index + 1, 0, area);
    this.swapEditedAreaIndex(index, index + 1);
    this.setAreas(areas);
  }
}
