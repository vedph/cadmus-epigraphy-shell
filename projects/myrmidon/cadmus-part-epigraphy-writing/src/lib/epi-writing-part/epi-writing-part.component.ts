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
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { Flag } from '@myrmidon/cadmus-ui-flags-picker';
import { NgToolsValidators } from '@myrmidon/ng-tools';

import { EpiWritingPart, EPI_WRITING_PART_TYPEID } from '../epi-writing-part';

/**
 * EpiWriting part editor component.
 * Thesauri: epi-writing-systems, epi-writing-types, epi-writing-languages,
 * epi-writing-techniques, epi-writing-tools, epi-writing-fig-types,
 * epi-writing-fig-features, epi-writing-script-features,
 * epi-writing-frame-types, epi-writing-metres;
 * decorated-count-ids, decorated-count-tags.
 */
@Component({
  selector: 'cadmus-gisarc-epi-writing-part',
  templateUrl: './epi-writing-part.component.html',
  styleUrls: ['./epi-writing-part.component.css'],
})
export class EpiWritingPartComponent
  extends ModelEditorComponentBase<EpiWritingPart>
  implements OnInit
{
  public system: FormControl<string>;
  public type: FormControl<string>;
  public technique: FormControl<string | null>;
  public tool: FormControl<string | null>;
  public frameType: FormControl<string | null>;
  public counts: FormControl<DecoratedCount[]>;
  public figType: FormControl<string | null>;
  public figFeatures: FormControl<string[]>;
  public scriptFeatures: FormControl<string[]>;
  public languages: FormControl<string[]>;
  public hasPoetry: FormControl<boolean>;
  public metres: FormControl<string[]>;

  public lngFlags: Flag[];
  public figFlags: Flag[];
  public scrFlags: Flag[];
  public mtrFlags: Flag[];

  public initialLanguages: string[];
  public initialFigFeatures: string[];
  public initialScriptFeatures: string[];
  public initialMetres: string[];
  public initialCounts: DecoratedCount[];

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
  public lngEntries: ThesaurusEntry[] | undefined;
  // epi-writing-fig-features
  public figFeatEntries: ThesaurusEntry[] | undefined;
  // epi-writing-script-features
  public scriptFeatEntries: ThesaurusEntry[] | undefined;
  // epi-writing-metres
  public mtrEntries: ThesaurusEntry[] | undefined;
  // decorated-count-ids
  public cidEntries: ThesaurusEntry[] | undefined;
  // decorated-count-tags
  public ctgEntries: ThesaurusEntry[] | undefined;

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
    this.lngFlags = [];
    this.figFlags = [];
    this.scrFlags = [];
    this.mtrFlags = [];
    this.initialLanguages = [];
    this.initialFigFeatures = [];
    this.initialScriptFeatures = [];
    this.initialMetres = [];
    this.initialCounts = [];
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
    this.figType = formBuilder.control(null, Validators.maxLength(50));
    this.figFeatures = formBuilder.control([], { nonNullable: true });
    this.scriptFeatures = formBuilder.control([], { nonNullable: true });
    this.languages = formBuilder.control([], {
      validators: NgToolsValidators.strictMinLengthValidator(1),
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

  private entryToFlag(entry: ThesaurusEntry): Flag {
    return {
      id: entry.id,
      label: entry.value,
    };
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
      this.lngFlags = this.lngEntries!.map((e) => this.entryToFlag(e));
    } else {
      this.lngEntries = undefined;
      this.lngFlags = [];
    }
    key = 'epi-writing-fig-features';
    if (this.hasThesaurus(key)) {
      this.figFeatEntries = thesauri[key].entries;
      this.figFlags = this.figFeatEntries!.map((e) => this.entryToFlag(e));
    } else {
      this.figFeatEntries = undefined;
      this.figFlags = [];
    }
    key = 'epi-writing-script-features';
    if (this.hasThesaurus(key)) {
      this.scriptFeatEntries = thesauri[key].entries;
      this.scrFlags = this.scriptFeatEntries!.map((e) => this.entryToFlag(e));
    } else {
      this.scriptFeatEntries = undefined;
      this.scrFlags = [];
    }
    key = 'epi-writing-metres';
    if (this.hasThesaurus(key)) {
      this.mtrEntries = thesauri[key].entries;
      this.mtrFlags = this.mtrEntries!.map((e) => this.entryToFlag(e));
    } else {
      this.mtrEntries = undefined;
      this.mtrFlags = [];
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

  private updateForm(part?: EpiWritingPart | null): void {
    if (!part) {
      this.form.reset();
      this.system.setValue(this.getDefaultEntryId(this.sysEntries) || '');
      this.type.setValue(this.getDefaultEntryId(this.typeEntries) || '');
      this.initialCounts = [];
      this.initialLanguages = [];
      this.initialFigFeatures = [];
      this.initialScriptFeatures = [];
      this.initialMetres = [];
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
    this.figType.setValue(part.figType || null);
    this.languages.setValue(part.languages || []);
    this.hasPoetry.setValue(part.hasPoetry || false);

    this.initialCounts = part.counts || [];
    this.initialLanguages = part.languages;
    this.initialFigFeatures = part.figFeatures || [];
    this.initialScriptFeatures = part.scriptFeatures || [];
    this.initialMetres = part.metres || [];

    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<EpiWritingPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): EpiWritingPart {
    let part = this.getEditedPart(EPI_WRITING_PART_TYPEID) as EpiWritingPart;
    part.system = this.system.value.trim();
    part.type = this.type.value.trim();
    part.technique = this.technique.value?.trim();
    part.tool = this.tool.value?.trim();
    part.frameType = this.frameType.value?.trim();
    part.counts = this.counts.value?.length ? this.counts.value : undefined;
    part.figType = this.figType.value?.trim();
    part.figFeatures = this.figFeatures.value.length
      ? this.figFeatures.value
      : undefined;
    part.scriptFeatures = this.scriptFeatures.value.length
      ? this.scriptFeatures.value
      : undefined;
    part.languages = this.languages.value;
    part.hasPoetry = this.hasPoetry.value || undefined;
    part.metres = this.metres.value?.length ? this.metres.value : undefined;

    return part;
  }

  public onCountsChange(counts: DecoratedCount[]): void {
    this.counts.setValue(counts);
  }

  public onLngIdsChange(ids: string[]): void {
    this.languages.setValue(ids);
  }

  public onFigIdsChange(ids: string[]): void {
    this.figFeatures.setValue(ids);
  }

  public onScriptIdsChange(ids: string[]): void {
    this.scriptFeatures.setValue(ids);
  }

  public onMetreIdsChange(ids: string[]): void {
    this.metres.setValue(ids);
  }
}
