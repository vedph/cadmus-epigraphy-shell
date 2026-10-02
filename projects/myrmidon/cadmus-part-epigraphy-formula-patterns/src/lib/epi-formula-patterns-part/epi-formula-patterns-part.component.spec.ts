import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject, of } from 'rxjs';

import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { EditedObject, ThesauriSet } from '@myrmidon/cadmus-core';
import { AppRepository } from '@myrmidon/cadmus-state';

import {
  EPI_FORMULA_PATTERNS_PART_TYPEID,
  EpiFormulaPattern,
  EpiFormulaPatternsPart,
} from '../epi-formula-patterns-part';
import { EpiFormulaPatternComponent } from '../epi-formula-pattern/epi-formula-pattern.component';
import { EpiFormulaPatternsPartComponent } from './epi-formula-patterns-part.component';

const THESAURI: ThesauriSet = {
  'epi-formula-pattern-languages': {
    id: 'epi-formula-pattern-languages@en',
    language: 'en',
    entries: [
      { id: 'lat', value: 'Latin' },
      { id: 'grc', value: 'Greek' },
    ],
  },
  'epi-formula-pattern-tags': {
    id: 'epi-formula-pattern-tags@en',
    language: 'en',
    entries: [{ id: 'funerary', value: 'funerary' }],
  },
  'epi-formula-token-tags': {
    id: 'epi-formula-token-tags@en',
    language: 'en',
    entries: [{ id: 'n', value: 'noun' }],
  },
};

function createPatterns(): EpiFormulaPattern[] {
  return [
    {
      eid: 'a',
      language: 'lat',
      tokens: [
        { tags: ['n'], values: ['dis'] },
        { tags: ['n'], values: ['manibus'], isOptional: true },
      ],
    },
    { eid: 'b', language: 'lat', tokens: [{ tags: [], values: ['hic'] }] },
    { eid: 'c', language: 'grc', tokens: [{ tags: [], values: ['x'] }] },
  ];
}

function createPart(): EpiFormulaPatternsPart {
  return {
    id: 'p1',
    itemId: 'i1',
    typeId: EPI_FORMULA_PATTERNS_PART_TYPEID,
    timeCreated: new Date(),
    creatorId: 'zeus',
    timeModified: new Date(),
    userId: 'zeus',
    patterns: createPatterns(),
  };
}

describe('EpiFormulaPatternsPartComponent', () => {
  let component: EpiFormulaPatternsPartComponent;
  let fixture: ComponentFixture<EpiFormulaPatternsPartComponent>;
  let dialogService: { confirm: ReturnType<typeof vi.fn> };
  let user$: BehaviorSubject<User | null>;

  function setData(data?: EditedObject<EpiFormulaPatternsPart>): void {
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
  }

  function getRows(): HTMLTableRowElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(':scope mat-card-content > table > tbody > tr'),
    );
  }

  function getChildEditor(): EpiFormulaPatternComponent | undefined {
    return fixture.debugElement.query(
      (de) => de.componentInstance instanceof EpiFormulaPatternComponent,
    )?.componentInstance;
  }

  function eids(): (string | undefined)[] {
    return component.patterns.value.map((p) => p.eid);
  }

  beforeEach(async () => {
    dialogService = { confirm: vi.fn().mockReturnValue(of(true)) };
    const user = { userName: 'zeus', roles: ['editor'] } as unknown as User;
    user$ = new BehaviorSubject<User | null>(user);

    await TestBed.configureTestingModule({
      imports: [EpiFormulaPatternsPartComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DialogService, useValue: dialogService },
        {
          provide: AuthJwtService,
          useValue: {
            currentUserValue: user,
            currentUser$: user$.asObservable(),
          },
        },
        {
          provide: AppRepository,
          useValue: {
            getTypeThesaurus: () => undefined,
            getSettingFor: () => Promise.resolve(undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EpiFormulaPatternsPartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('identity', {
      itemId: 'i1',
      typeId: EPI_FORMULA_PATTERNS_PART_TYPEID,
      partId: null,
      roleId: null,
    });
    fixture.detectChanges();
  });

  it('should create with an invalid empty form', () => {
    expect(component).toBeTruthy();
    expect(component.patterns.value).toEqual([]);
    expect(component.form.invalid).toBe(true);
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('should show the default title', () => {
    const title: HTMLElement =
      fixture.nativeElement.querySelector('mat-card-title');
    expect(title.textContent).toContain('Epigraphic Formula Patterns Part');
  });

  it('should load thesauri and part from data', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    expect(component.langEntries()?.length).toBe(2);
    expect(component.tagEntries()?.length).toBe(1);
    expect(component.tokTagEntries()?.length).toBe(1);
    expect(component.patterns.value).toEqual(createPatterns());
    expect(component.form.valid).toBe(true);
    expect(component.form.pristine).toBe(true);
  });

  it('should render patterns with their tokens', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const rows = getRows();
    expect(rows.length).toBe(3);
    const items = Array.from(rows[0].querySelectorAll('li')).map((li) =>
      li.textContent!.trim(),
    );
    expect(items).toEqual(['<n dis>', '[n manibus]']);
  });

  it('should clear thesauri entries when missing', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    setData({ value: createPart(), thesauri: {} });
    expect(component.langEntries()).toBeUndefined();
    expect(component.tagEntries()).toBeUndefined();
    expect(component.tokTagEntries()).toBeUndefined();
  });

  it('should reset form when data has no value', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    setData({ value: null, thesauri: THESAURI });
    expect(component.patterns.value).toEqual([]);
  });

  it('should default patterns to empty array when missing', () => {
    const part = createPart();
    part.patterns = undefined as unknown as EpiFormulaPattern[];
    setData({ value: part, thesauri: {} });
    expect(component.patterns.value).toEqual([]);
  });

  it('should add a new pattern', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.addPattern();
    fixture.detectChanges();
    expect(component.edited()).toEqual({ language: '', tokens: [] });
    expect(component.editedIndex()).toBe(-1);
    const editor = getChildEditor()!;
    expect(editor.langEntries()).toEqual(
      THESAURI['epi-formula-pattern-languages'].entries,
    );
    expect(editor.tagEntries()).toEqual(
      THESAURI['epi-formula-pattern-tags'].entries,
    );
    expect(editor.tokTagEntries()).toEqual(
      THESAURI['epi-formula-token-tags'].entries,
    );
    const header: HTMLElement = fixture.nativeElement.querySelector(
      'mat-expansion-panel-header',
    );
    expect(header.textContent).toContain('Pattern #0');
  });

  it('should edit a copy of a pattern', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editPattern(component.patterns.value[1], 1);
    fixture.detectChanges();
    expect(component.edited()).toEqual(createPatterns()[1]);
    expect(component.edited()).not.toBe(component.patterns.value[1]);
    expect(getRows()[1].classList.contains('selected')).toBe(true);
    expect(getChildEditor()!.eid.value).toBe('b');
    const header: HTMLElement = fixture.nativeElement.querySelector(
      'mat-expansion-panel-header',
    );
    expect(header.textContent).toContain('Pattern #2');
  });

  it('should close pattern editor on its close', () => {
    component.addPattern();
    fixture.detectChanges();
    getChildEditor()!.cancel();
    fixture.detectChanges();
    expect(component.edited()).toBeUndefined();
    expect(getChildEditor()).toBeUndefined();
  });

  it('should append a new pattern', () => {
    const spy = vi.fn();
    component.dirtyChange.subscribe(spy);
    component.addPattern();
    component.savePattern({ language: 'lat', tokens: [] });
    expect(component.patterns.value.length).toBe(1);
    expect(component.patterns.dirty).toBe(true);
    expect(component.form.valid).toBe(true);
    expect(component.edited()).toBeUndefined();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should replace an edited pattern', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editPattern(component.patterns.value[1], 1);
    component.savePattern({ eid: 'z', language: 'lat', tokens: [] });
    expect(eids()).toEqual(['a', 'z', 'c']);
  });

  it('should save pattern from child editor', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editPattern(component.patterns.value[2], 2);
    fixture.detectChanges();
    const editor = getChildEditor()!;
    editor.eid.setValue('c2');
    editor.save();
    fixture.detectChanges();
    expect(eids()).toEqual(['a', 'b', 'c2']);
    expect(getChildEditor()).toBeUndefined();
  });

  it('should delete a pattern after confirmation', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.deletePattern(1);
    expect(dialogService.confirm).toHaveBeenCalled();
    expect(eids()).toEqual(['a', 'c']);
    expect(component.patterns.dirty).toBe(true);
  });

  it('should not delete a pattern without confirmation', () => {
    dialogService.confirm.mockReturnValue(of(false));
    setData({ value: createPart(), thesauri: THESAURI });
    component.deletePattern(1);
    expect(eids()).toEqual(['a', 'b', 'c']);
  });

  it('should close the editor when deleting the edited pattern', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editPattern(component.patterns.value[1], 1);
    component.deletePattern(1);
    expect(component.edited()).toBeUndefined();
  });

  it('should keep edited pattern when deleting a previous pattern', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editPattern(component.patterns.value[2], 2);
    component.deletePattern(0);
    expect(component.editedIndex()).toBe(1);
    component.savePattern({ eid: 'c2', language: 'grc', tokens: [] });
    expect(eids()).toEqual(['b', 'c2']);
  });

  it('should move patterns up and down', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.movePatternUp(0);
    component.movePatternDown(2);
    expect(eids()).toEqual(['a', 'b', 'c']);
    expect(component.patterns.dirty).toBe(false);
    component.movePatternUp(2);
    expect(eids()).toEqual(['a', 'c', 'b']);
    component.movePatternDown(0);
    expect(eids()).toEqual(['c', 'a', 'b']);
    expect(component.patterns.dirty).toBe(true);
  });

  it('should keep edited pattern when moving patterns', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editPattern(component.patterns.value[2], 2);
    component.movePatternUp(2);
    expect(component.editedIndex()).toBe(1);
    component.movePatternDown(0);
    expect(component.editedIndex()).toBe(0);
    component.savePattern({ eid: 'c2', language: 'grc', tokens: [] });
    expect(eids()).toEqual(['c2', 'a', 'b']);
  });

  it('should invoke row actions from buttons', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const rows = getRows();
    expect(rows[0].querySelectorAll('button')[1].disabled).toBe(true);
    expect(rows[2].querySelectorAll('button')[2].disabled).toBe(true);
    rows[1].querySelectorAll('button')[0].click();
    expect(component.editedIndex()).toBe(1);
    rows[1].querySelectorAll('button')[1].click();
    expect(eids()).toEqual(['b', 'a', 'c']);
    fixture.detectChanges();
    getRows()[0].querySelectorAll('button')[2].click();
    expect(eids()).toEqual(['a', 'b', 'c']);
    fixture.detectChanges();
    getRows()[2].querySelectorAll('button')[3].click();
    expect(eids()).toEqual(['a', 'b']);
  });

  it('should save edited part', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.movePatternDown(0);
    component.save();
    const part = (spy.mock.calls[0][0] as EditedObject<EpiFormulaPatternsPart>)
      .value!;
    expect(part.id).toBe('p1');
    expect(part.patterns.map((p) => p.eid)).toEqual(['b', 'a', 'c']);
  });

  it('should save a new part using identity', () => {
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.savePattern({ language: 'lat', tokens: [] });
    component.save();
    const part = (spy.mock.calls[0][0] as EditedObject<EpiFormulaPatternsPart>)
      .value!;
    expect(part.itemId).toBe('i1');
    expect(part.typeId).toBe(EPI_FORMULA_PATTERNS_PART_TYPEID);
    expect(part.patterns.length).toBe(1);
  });

  it('should not save without patterns', () => {
    const spy = vi.fn();
    component.data.subscribe(spy);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    component.save();
    expect(spy).not.toHaveBeenCalled();
  });
});
