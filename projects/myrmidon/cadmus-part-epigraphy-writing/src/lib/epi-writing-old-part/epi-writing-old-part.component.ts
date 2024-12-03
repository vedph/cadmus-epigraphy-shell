import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { DecoratedCount } from '@myrmidon/cadmus-refs-decorated-counts';
import {
  EditedObject,
  ModelEditorComponentBase,
  renderLabelFromLastColon,
} from '@myrmidon/cadmus-ui';
import { Flag, FlagsPickerAdapter } from '@myrmidon/cadmus-ui-flags-picker';
import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import { Observable } from 'rxjs';

import {
  EpiWritingOldPart,
  EPI_WRITING_OLD_PART_TYPEID,
} from '../epi-writing-old-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

/**
 * EpiWriting part editor component.
 * Thesauri: epi-writing-systems, epi-writing-types, epi-writing-languages,
 * epi-writing-techniques, epi-writing-tools, epi-writing-fig-types,
 * epi-writing-fig-features, epi-writing-script-features,
 * epi-writing-frame-types, epi-writing-metres;
 * decorated-count-ids, decorated-count-tags.
 */
@Component({
  selector: 'cadmus-epi-writing-old-part',
  templateUrl: './epi-writing-old-part.component.html',
  styleUrls: ['./epi-writing-old-part.component.css'],
  standalone: false,
})
export class EpiWritingOldPartComponent
  extends ModelEditorComponentBase<EpiWritingOldPart>
  implements OnInit
{
  private readonly _flagAdapter: FlagsPickerAdapter;
  private _lngEntries: ThesaurusEntry[];
  private _figFeatEntries: ThesaurusEntry[];
  private _scriptFeatEntries: ThesaurusEntry[];
  private _mtrEntries: ThesaurusEntry[];

  public system: FormControl<string>;
  public type: FormControl<string>;
  public technique: FormControl<string | null>;
  public tool: FormControl<string | null>;
  public frameType: FormControl<string | null>;
  public counts: FormControl<DecoratedCount[]>;
  public figType: FormControl<ThesaurusEntry | null>;
  public figFeatures: FormControl<Flag[]>;
  public scriptFeatures: FormControl<Flag[]>;
  public languages: FormControl<Flag[]>;
  public hasPoetry: FormControl<boolean>;
  public metres: FormControl<Flag[]>;

  public languageFlags$: Observable<Flag[]>;
  public figureFlags$: Observable<Flag[]>;
  public scriptFlags$: Observable<Flag[]>;
  public metreFlags$: Observable<Flag[]>;

  // epi-writing-systems
  public sysEntries: ThesaurusEntry[] | undefined;
  // epi-writing-types
  public typeEntries: ThesaurusEntry[] | undefined;
  // epi-writing-techniques
  public techEntries: ThesaurusEntry[] | undefined;
  // epi-writing-tools
  public toolEntries: ThesaurusEntry[] | undefined;
  // epi-writing-frame-types
  public frameEntries: ThesaurusEntry[] | undefined;
  // epi-writing-fig-types
  public figTypeEntries: ThesaurusEntry[] | undefined;
  // epi-writing-languages
  public get lngEntries(): ThesaurusEntry[] | undefined {
    return this._lngEntries;
  }
  public set lngEntries(value: ThesaurusEntry[] | undefined) {
    if (this._lngEntries === value) {
      return;
    }
    this._lngEntries = value || [];
    this._flagAdapter.setSlotFlags(
      'languages',
      this._lngEntries.map(entryToFlag)
    );
  }
  // epi-writing-fig-features
  public get figFeatEntries(): ThesaurusEntry[] | undefined {
    return this._figFeatEntries;
  }
  public set figFeatEntries(value: ThesaurusEntry[] | undefined) {
    if (this._figFeatEntries === value) {
      return;
    }
    this._figFeatEntries = value || [];
    this._flagAdapter.setSlotFlags(
      'figures',
      this._figFeatEntries.map(entryToFlag)
    );
  }
  // epi-writing-script-features
  public get scriptFeatEntries(): ThesaurusEntry[] | undefined {
    return this._scriptFeatEntries;
  }
  public set scriptFeatEntries(value: ThesaurusEntry[] | undefined) {
    if (this._scriptFeatEntries === value) {
      return;
    }
    this._scriptFeatEntries = value || [];
    this._flagAdapter.setSlotFlags(
      'scripts',
      this._scriptFeatEntries.map(entryToFlag)
    );
  }
  // epi-writing-metres
  public get mtrEntries(): ThesaurusEntry[] | undefined {
    return this._mtrEntries;
  }
  public set mtrEntries(value: ThesaurusEntry[] | undefined) {
    if (this._mtrEntries === value) {
      return;
    }
    this._mtrEntries = value || [];
    this._flagAdapter.setSlotFlags('metres', this._mtrEntries.map(entryToFlag));
  }
  // decorated-count-ids
  public cidEntries: ThesaurusEntry[] | undefined;
  // decorated-count-tags
  public ctgEntries: ThesaurusEntry[] | undefined;

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
    // flags
    this._lngEntries = [];
    this._figFeatEntries = [];
    this._scriptFeatEntries = [];
    this._mtrEntries = [];
    this._flagAdapter = new FlagsPickerAdapter();
    this.languageFlags$ = this._flagAdapter.selectFlags('languages');
    this.figureFlags$ = this._flagAdapter.selectFlags('figures');
    this.scriptFlags$ = this._flagAdapter.selectFlags('scripts');
    this.metreFlags$ = this._flagAdapter.selectFlags('metres');
    // form
    this.system = formBuilder.control('', {
      validators: [Validators.required, Validators.maxLength(50)],
      nonNullable: true,
    });
    this.type = formBuilder.control('', {
      validators: [Validators.required, Validators.maxLength(50)],
      nonNullable: true,
    });
    this.technique = formBuilder.control(null, Validators.maxLength(50));
    this.tool = formBuilder.control(null, Validators.maxLength(50));
    this.frameType = formBuilder.control(null, Validators.maxLength(50));
    this.counts = formBuilder.control([], { nonNullable: true });
    this.figType = formBuilder.control(null);
    this.figFeatures = formBuilder.control([], { nonNullable: true });
    this.scriptFeatures = formBuilder.control([], { nonNullable: true });
    this.languages = formBuilder.control([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.hasPoetry = formBuilder.control(false, { nonNullable: true });
    this.metres = formBuilder.control([], { nonNullable: true });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      system: this.system,
      type: this.type,
      technique: this.technique,
      tool: this.tool,
      frameType: this.frameType,
      counts: this.counts,
      figType: this.figType,
      figFeatures: this.figFeatures,
      scriptFeatures: this.scriptFeatures,
      languages: this.languages,
      hasPoetry: this.hasPoetry,
      metres: this.metres,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'epi-writing-systems';
    if (this.hasThesaurus(key)) {
      this.sysEntries = thesauri[key].entries;
    } else {
      this.sysEntries = undefined;
    }
    key = 'epi-writing-types';
    if (this.hasThesaurus(key)) {
      this.typeEntries = thesauri[key].entries;
    } else {
      this.typeEntries = undefined;
    }
    key = 'epi-writing-techniques';
    if (this.hasThesaurus(key)) {
      this.techEntries = thesauri[key].entries;
    } else {
      this.techEntries = undefined;
    }
    key = 'epi-writing-tools';
    if (this.hasThesaurus(key)) {
      this.toolEntries = thesauri[key].entries;
    } else {
      this.toolEntries = undefined;
    }
    key = 'epi-writing-frame-types';
    if (this.hasThesaurus(key)) {
      this.frameEntries = thesauri[key].entries;
    } else {
      this.frameEntries = undefined;
    }
    key = 'epi-writing-fig-types';
    if (this.hasThesaurus(key)) {
      this.figTypeEntries = thesauri[key].entries;
    } else {
      this.figTypeEntries = undefined;
    }
    key = 'epi-writing-languages';
    if (this.hasThesaurus(key)) {
      this.lngEntries = thesauri[key].entries;
    } else {
      this.lngEntries = undefined;
    }
    key = 'epi-writing-fig-features';
    if (this.hasThesaurus(key)) {
      this.figFeatEntries = thesauri[key].entries;
    } else {
      this.figFeatEntries = undefined;
    }
    key = 'epi-writing-script-features';
    if (this.hasThesaurus(key)) {
      this.scriptFeatEntries = thesauri[key].entries;
    } else {
      this.scriptFeatEntries = undefined;
    }
    key = 'epi-writing-metres';
    if (this.hasThesaurus(key)) {
      this.mtrEntries = thesauri[key].entries;
    } else {
      this.mtrEntries = undefined;
    }
    key = 'decorated-count-ids';
    if (this.hasThesaurus(key)) {
      this.cidEntries = thesauri[key].entries;
    } else {
      this.cidEntries = undefined;
    }
    key = 'decorated-count-tags';
    if (this.hasThesaurus(key)) {
      this.ctgEntries = thesauri[key].entries;
    } else {
      this.ctgEntries = undefined;
    }
  }

  private getDefaultEntryId(
    entries: ThesaurusEntry[] | undefined
  ): string | null {
    return entries?.length ? entries[0].id : null;
  }

  private updateForm(part?: EpiWritingOldPart | null): void {
    if (!part) {
      this.form.reset();
      this.system.setValue(this.getDefaultEntryId(this.sysEntries) || '');
      this.type.setValue(this.getDefaultEntryId(this.typeEntries) || '');
      return;
    }

    this.system.setValue(
      part.system || this.getDefaultEntryId(this.sysEntries) || ''
    );
    this.type.setValue(
      part.type || this.getDefaultEntryId(this.typeEntries) || ''
    );
    this.technique.setValue(part.technique || null);
    this.tool.setValue(part.tool || null);
    this.frameType.setValue(part.frameType || null);
    this.figType.setValue(
      this.figTypeEntries?.find((e) => e.id === part.figType) || null
    );
    this.hasPoetry.setValue(part.hasPoetry || false);
    this.counts.setValue(part.counts || []);
    // update languages control as it's involved in form's validation
    this.languages.setValue(
      this._flagAdapter.setSlotChecks('languages', part.languages)
    );
    this._flagAdapter.setSlotChecks('figures', part.figFeatures || []);
    this._flagAdapter.setSlotChecks('scripts', part.scriptFeatures || []);
    this._flagAdapter.setSlotChecks('metres', part.metres || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<EpiWritingOldPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): EpiWritingOldPart {
    let part = this.getEditedPart(
      EPI_WRITING_OLD_PART_TYPEID
    ) as EpiWritingOldPart;
    part.system = this.system.value.trim();
    part.type = this.type.value.trim();
    part.technique = this.technique.value?.trim();
    part.tool = this.tool.value?.trim();
    part.frameType = this.frameType.value?.trim();
    part.counts = this.counts.value?.length ? this.counts.value : undefined;
    part.figType = this.figType.value?.id;
    part.figFeatures = this._flagAdapter.getOptionalCheckedFlagIds('figures');
    part.scriptFeatures =
      this._flagAdapter.getOptionalCheckedFlagIds('scripts');
    part.languages = this._flagAdapter.getCheckedFlagIds('languages');
    part.hasPoetry = this.hasPoetry.value || undefined;
    part.metres = this._flagAdapter.getOptionalCheckedFlagIds('metres');
    return part;
  }

  public onFigTypeChange(entry: ThesaurusEntry): void {
    this.figType.setValue(entry);
  }

  public renderLabel(label: string): string {
    return renderLabelFromLastColon(label);
  }

  public onCountsChange(counts: DecoratedCount[]): void {
    this.counts.setValue(counts);
  }

  public onLanguageFlagsChange(flags: Flag[]): void {
    this.languages.setValue(flags);
    this.languages.updateValueAndValidity();
    this.languages.markAsDirty();
  }

  public onFigFeatFlagsChange(flags: Flag[]): void {
    this.figFeatures.setValue(flags);
    this.figFeatures.updateValueAndValidity();
    this.figFeatures.markAsDirty();
  }

  public onScriptFeatFlagsChange(flags: Flag[]): void {
    this.scriptFeatures.setValue(flags);
    this.scriptFeatures.updateValueAndValidity();
    this.scriptFeatures.markAsDirty();
  }

  public onMetreFlagsChange(flags: Flag[]): void {
    this.metres.setValue(flags);
    this.metres.updateValueAndValidity();
    this.metres.markAsDirty();
  }
}
