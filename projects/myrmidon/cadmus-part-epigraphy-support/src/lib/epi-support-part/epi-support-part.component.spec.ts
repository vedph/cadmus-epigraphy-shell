import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MatTabGroup } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, of } from 'rxjs';

import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { EditedObject, ThesauriSet } from '@myrmidon/cadmus-core';
import { AppRepository } from '@myrmidon/cadmus-state';

import {
  EPI_SUPPORT_PART_TYPEID,
  EpiSupportPart,
  EpiTextArea,
} from '../epi-support-part';
import { EpiTextAreaComponent } from '../epi-text-area/epi-text-area.component';
import { EpiSupportPartComponent } from './epi-support-part.component';

function thesaurus(key: string, ids: string[]) {
  return {
    id: key + '@en',
    language: 'en',
    entries: ids.map((id) => ({ id, value: id.toUpperCase() })),
  };
}

// the form tags the objects in its arrays with an identity Symbol:
// compare their plain data only
function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const THESAURI: ThesauriSet = {
  'epi-support-materials': thesaurus('epi-support-materials', [
    'marble',
    'stone',
  ]),
  'epi-support-object-types': thesaurus('epi-support-object-types', ['stele']),
  'epi-support-count-types': thesaurus('epi-support-count-types', ['lines']),
  'epi-support-count-tags': thesaurus('epi-support-count-tags', ['approx']),
  'epi-support-features': thesaurus('epi-support-features', [
    'broken',
    'reused',
  ]),
  'physical-size-units': thesaurus('physical-size-units', ['cm']),
  'physical-size-tags': thesaurus('physical-size-tags', ['max']),
  'physical-size-dim-tags': thesaurus('physical-size-dim-tags', ['approx']),
  'epi-support-text-area-types': thesaurus('epi-support-text-area-types', [
    'main',
    'side',
  ]),
  'epi-support-text-area-layouts': thesaurus('epi-support-text-area-layouts', [
    'lines',
  ]),
  'epi-support-text-area-features': thesaurus(
    'epi-support-text-area-features',
    ['ruling'],
  ),
  'epi-support-text-area-frame-types': thesaurus(
    'epi-support-text-area-frame-types',
    ['moulding'],
  ),
};

/**
 * Count the mat-select elements of this editor, excluding those of
 * the physical size editor.
 */
function countOwnSelects(root: HTMLElement): number {
  return Array.from(root.querySelectorAll('mat-select')).filter(
    (e) => !e.closest('cadmus-mat-physical-size'),
  ).length;
}

function createAreas(): EpiTextArea[] {
  return [
    { type: 'main', eid: 'a', frameType: 'moulding' },
    { type: 'side', eid: 'b', size: { w: { value: 5, unit: 'cm' } } },
    { type: 'side', eid: 'c' },
  ];
}

function createPart(): EpiSupportPart {
  return {
    id: 'p1',
    itemId: 'i1',
    typeId: EPI_SUPPORT_PART_TYPEID,
    timeCreated: new Date(),
    creatorId: 'zeus',
    timeModified: new Date(),
    userId: 'zeus',
    material: 'marble',
    objectType: 'stele',
    features: ['broken'],
    size: { w: { value: 50, unit: 'cm' }, h: { value: 100, unit: 'cm' } },
    textAreas: createAreas(),
    counts: [{ id: 'lines', value: 5 }],
    note: 'a note',
  };
}

describe('EpiSupportPartComponent', () => {
  let component: EpiSupportPartComponent;
  let fixture: ComponentFixture<EpiSupportPartComponent>;
  let dialogService: { confirm: ReturnType<typeof vi.fn> };

  function setData(data?: EditedObject<EpiSupportPart>): void {
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
  }

  async function selectTab(index: number): Promise<void> {
    const group = fixture.debugElement.query(
      (de) => de.componentInstance instanceof MatTabGroup,
    ).componentInstance as MatTabGroup;
    group.selectedIndex = index;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function getAreaRows(): HTMLTableRowElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
  }

  function getAreaEditor(): EpiTextAreaComponent | undefined {
    return fixture.debugElement.query(
      (de) => de.componentInstance instanceof EpiTextAreaComponent,
    )?.componentInstance;
  }

  function eids(): (string | undefined)[] {
    return component.form
      .areas()
      .value()
      .map((a) => a.eid);
  }

  beforeEach(async () => {
    dialogService = { confirm: vi.fn().mockReturnValue(of(true)) };
    const user = { userName: 'zeus', roles: ['editor'] } as unknown as User;

    await TestBed.configureTestingModule({
      imports: [EpiSupportPartComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // switch tabs immediately (jsdom has no transition events)
        {
          provide: MATERIAL_ANIMATIONS,
          useValue: { animationsDisabled: true },
        },
        { provide: DialogService, useValue: dialogService },
        {
          provide: AuthJwtService,
          useValue: {
            currentUserValue: user,
            currentUser$: new BehaviorSubject<User | null>(user),
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

    fixture = TestBed.createComponent(EpiSupportPartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('identity', {
      itemId: 'i1',
      typeId: EPI_SUPPORT_PART_TYPEID,
      partId: null,
      roleId: null,
    });
    fixture.detectChanges();
  });

  it('should create with an invalid empty form', () => {
    expect(component).toBeTruthy();
    expect(component.form().invalid()).toBe(true);
    expect(!!component.form.material().getError('required')).toBe(true);
    expect(component.featFlags()).toEqual([]);
  });

  it('should show the default title', () => {
    const title: HTMLElement =
      fixture.nativeElement.querySelector('mat-card-title');
    expect(title.textContent).toContain('Epigraphic Support Part');
  });

  it('should hide features tab without counts and features thesauri', () => {
    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('[role="tab"]'),
    ).map((t) => (t as HTMLElement).textContent!.trim());
    expect(labels).toEqual(['general', 'layout']);
  });

  it('should show features tab with thesauri', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('[role="tab"]'),
    ).map((t) => (t as HTMLElement).textContent!.trim());
    expect(labels).toEqual(['general', 'layout', 'features']);
  });

  it('should load all thesauri', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    expect(component.matEntries()?.length).toBe(2);
    expect(component.objTypeEntries()?.length).toBe(1);
    expect(component.countTypeEntries()?.length).toBe(1);
    expect(component.countTagEntries()?.length).toBe(1);
    expect(component.featEntries()?.length).toBe(2);
    expect(component.szUnitEntries()?.length).toBe(1);
    expect(component.szTagEntries()?.length).toBe(1);
    expect(component.szDimTagEntries()?.length).toBe(1);
    expect(component.textAreaTypeEntries()?.length).toBe(2);
    expect(component.textAreaLayoutEntries()?.length).toBe(1);
    expect(component.textAreaFeatEntries()?.length).toBe(1);
    expect(component.textAreaFrameEntries()?.length).toBe(1);
    expect(component.featFlags()).toEqual([
      { id: 'broken', label: 'BROKEN' },
      { id: 'reused', label: 'REUSED' },
    ]);
  });

  it('should clear thesauri when missing', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    setData({ value: createPart(), thesauri: {} });
    expect(component.matEntries()).toBeUndefined();
    expect(component.objTypeEntries()).toBeUndefined();
    expect(component.countTypeEntries()).toBeUndefined();
    expect(component.countTagEntries()).toBeUndefined();
    expect(component.featEntries()).toBeUndefined();
    expect(component.szUnitEntries()).toBeUndefined();
    expect(component.szTagEntries()).toBeUndefined();
    expect(component.szDimTagEntries()).toBeUndefined();
    expect(component.textAreaTypeEntries()).toBeUndefined();
    expect(component.textAreaLayoutEntries()).toBeUndefined();
    expect(component.textAreaFeatEntries()).toBeUndefined();
    expect(component.textAreaFrameEntries()).toBeUndefined();
  });

  it('should update form from part', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    expect(component.form.material().value()).toBe('marble');
    expect(component.form.objectType().value()).toBe('stele');
    expect(component.form.hasSize().value()).toBe(true);
    expect(component.form.size().value()).toEqual(createPart().size);
    expect(plain(component.form.counts().value())).toEqual([
      { id: 'lines', value: 5 },
    ]);
    expect(component.form.features().value()).toEqual(['broken']);
    expect(plain(component.form.areas().value())).toEqual(createAreas());
    expect(component.form.note().value()).toBe('a note');
    expect(component.form().valid()).toBe(true);
    expect(component.form().dirty()).toBe(false);
  });

  it('should map missing part values to defaults', () => {
    setData({
      value: {
        ...createPart(),
        material: undefined as unknown as string,
        objectType: undefined,
        size: undefined,
        counts: undefined,
        features: undefined,
        textAreas: undefined,
        note: undefined,
      },
      thesauri: {},
    });
    expect(component.form.material().value()).toBe('');
    expect(component.form.objectType().value()).toBe('');
    expect(component.form.hasSize().value()).toBe(false);
    expect(component.form.size().value()).toBeNull();
    expect(plain(component.form.counts().value())).toEqual([]);
    expect(component.form.features().value()).toEqual([]);
    expect(plain(component.form.areas().value())).toEqual([]);
    expect(component.form.note().value()).toBe('');
  });

  it('should reset form when data has no value', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    setData({ value: null, thesauri: THESAURI });
    expect(component.form.material().value()).toBe('');
    expect(component.form.hasSize().value()).toBe(false);
    expect(plain(component.form.areas().value())).toEqual([]);
  });

  it('should use free inputs for material and object type without thesauri', () => {
    expect(countOwnSelects(fixture.nativeElement)).toBe(0);
    setData({ value: createPart(), thesauri: THESAURI });
    expect(countOwnSelects(fixture.nativeElement)).toBe(2);
  });

  it('should show size editor only when size is checked', () => {
    expect(
      fixture.nativeElement.querySelector('cadmus-mat-physical-size'),
    ).toBeNull();
    component.form.hasSize().value.set(true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('cadmus-mat-physical-size'),
    ).toBeTruthy();
  });

  it('should validate max lengths', () => {
    component.form.material().value.set('x'.repeat(51));
    component.form.objectType().value.set('x'.repeat(51));
    component.form.note().value.set('x'.repeat(5001));
    expect(!!component.form.material().getError('maxLength')).toBe(true);
    expect(!!component.form.objectType().getError('maxLength')).toBe(true);
    expect(!!component.form.note().getError('maxLength')).toBe(true);
  });

  it('should show material and object type errors', () => {
    const errors = () =>
      Array.from(
        fixture.nativeElement.querySelectorAll(
          'mat-error',
        ) as NodeListOf<HTMLElement>,
      ).map((e) => e.textContent!.trim());

    component.form.material().markAsTouched();
    fixture.detectChanges();
    expect(errors()).toEqual(['material required']);

    component.form.material().value.set('x'.repeat(51));
    component.form.objectType().value.set('x'.repeat(51));
    component.form.objectType().markAsTouched();
    fixture.detectChanges();
    expect(errors()).toEqual(['material too long', 'objectType too long']);
  });

  it('should update features, size and counts', () => {
    component.onFeatIdsChange(['reused']);
    expect(component.form.features().value()).toEqual(['reused']);
    expect(component.form.features().dirty()).toBe(true);

    const size = { d: { value: 2, unit: 'cm' } };
    component.onSupportSizeChange(size);
    expect(component.form.size().value()).toEqual(size);
    expect(component.form.size().dirty()).toBe(true);

    component.onCountsChange([{ id: 'lines', value: 3 }]);
    expect(plain(component.form.counts().value())).toEqual([
      { id: 'lines', value: 3 },
    ]);
    expect(component.form.counts().dirty()).toBe(true);
  });

  it('should render features and counts in features tab', async () => {
    setData({ value: createPart(), thesauri: THESAURI });
    await selectTab(2);
    expect(
      fixture.nativeElement.querySelector('cadmus-refs-decorated-counts'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('cadmus-ui-flag-set'),
    ).toBeTruthy();
  });

  it('should render areas in layout tab', async () => {
    setData({ value: createPart(), thesauri: THESAURI });
    await selectTab(1);
    const rows = getAreaRows();
    expect(rows.length).toBe(3);
    const cells = Array.from(rows[0].querySelectorAll('td')).map((c) =>
      c.textContent!.trim(),
    );
    expect(cells.slice(1)).toEqual(['MAIN', '', 'MOULDING', 'a']);
  });

  it('should add a new area defaulting to first type', async () => {
    setData({ value: createPart(), thesauri: THESAURI });
    await selectTab(1);
    component.addArea();
    fixture.detectChanges();
    expect(component.editedArea()).toEqual({ type: 'main' });
    expect(component.editedAreaIndex()).toBe(-1);
    const editor = getAreaEditor()!;
    expect(editor.typeEntries()?.length).toBe(2);
    expect(editor.layoutEntries()?.length).toBe(1);
    expect(editor.featEntries()?.length).toBe(1);
    expect(editor.frameEntries()?.length).toBe(1);
    expect(editor.szUnitEntries()?.length).toBe(1);
    expect(editor.szTagEntries()?.length).toBe(1);
    expect(editor.szDimTagEntries()?.length).toBe(1);
  });

  it('should add a new area with empty type without thesaurus', () => {
    component.addArea();
    expect(component.editedArea()).toEqual({ type: '' });
  });

  it('should edit a copy of an area', async () => {
    setData({ value: createPart(), thesauri: THESAURI });
    await selectTab(1);
    component.editArea(component.form.areas().value()[1], 1);
    fixture.detectChanges();
    expect(component.editedArea()).toEqual(createAreas()[1]);
    expect(component.editedArea()).not.toBe(component.form.areas().value()[1]);
    expect(getAreaRows()[1].classList.contains('selected')).toBe(true);
    expect(getAreaEditor()!.form.eid().value()).toBe('b');
  });

  it('should close area editor on its cancel', async () => {
    await selectTab(1);
    component.addArea();
    fixture.detectChanges();
    getAreaEditor()!.dismiss();
    fixture.detectChanges();
    expect(component.editedArea()).toBeUndefined();
    expect(getAreaEditor()).toBeUndefined();
  });

  it('should append a new area', () => {
    component.addArea();
    component.saveArea({ type: 'x' });
    expect(plain(component.form.areas().value())).toEqual([{ type: 'x' }]);
    expect(component.form.areas().dirty()).toBe(true);
    expect(component.editedArea()).toBeUndefined();
  });

  it('should replace an edited area', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editArea(component.form.areas().value()[1], 1);
    component.saveArea({ type: 'main', eid: 'z' });
    expect(eids()).toEqual(['a', 'z', 'c']);
  });

  it('should save area from area editor', async () => {
    setData({ value: createPart(), thesauri: THESAURI });
    await selectTab(1);
    component.editArea(component.form.areas().value()[2], 2);
    fixture.detectChanges();
    const editor = getAreaEditor()!;
    editor.form.note().value.set('note');
    editor.save();
    fixture.detectChanges();
    expect(plain(component.form.areas().value()[2])).toEqual({
      eid: 'c',
      type: 'side',
      layout: undefined,
      size: undefined,
      features: undefined,
      frameType: undefined,
      frameDescription: undefined,
      note: 'note',
    });
    expect(getAreaEditor()).toBeUndefined();
  });

  it('should delete an area after confirmation', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.deleteArea(1);
    expect(dialogService.confirm).toHaveBeenCalled();
    expect(eids()).toEqual(['a', 'c']);
    expect(component.form.areas().dirty()).toBe(true);
  });

  it('should not delete an area without confirmation', () => {
    dialogService.confirm.mockReturnValue(of(false));
    setData({ value: createPart(), thesauri: THESAURI });
    component.deleteArea(1);
    expect(eids()).toEqual(['a', 'b', 'c']);
  });

  it('should close the editor when deleting the edited area', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editArea(component.form.areas().value()[1], 1);
    component.deleteArea(1);
    expect(component.editedArea()).toBeUndefined();
  });

  it('should keep edited area when deleting a previous area', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editArea(component.form.areas().value()[2], 2);
    component.deleteArea(0);
    expect(component.editedAreaIndex()).toBe(1);
    component.saveArea({ type: 'side', eid: 'c2' });
    expect(eids()).toEqual(['b', 'c2']);
  });

  it('should move areas up and down', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.moveAreaUp(0);
    component.moveAreaDown(2);
    expect(eids()).toEqual(['a', 'b', 'c']);
    expect(component.form.areas().dirty()).toBe(false);
    component.moveAreaUp(2);
    expect(eids()).toEqual(['a', 'c', 'b']);
    component.moveAreaDown(0);
    expect(eids()).toEqual(['c', 'a', 'b']);
    expect(component.form.areas().dirty()).toBe(true);
  });

  it('should keep edited area when moving areas', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editArea(component.form.areas().value()[1], 1);
    component.moveAreaDown(1);
    expect(component.editedAreaIndex()).toBe(2);
    component.moveAreaUp(2);
    expect(component.editedAreaIndex()).toBe(1);
    component.moveAreaUp(1);
    expect(component.editedAreaIndex()).toBe(0);
    component.saveArea({ type: 'side', eid: 'b2' });
    expect(eids()).toEqual(['b2', 'a', 'c']);
  });

  it('should invoke area row actions from buttons', async () => {
    setData({ value: createPart(), thesauri: THESAURI });
    await selectTab(1);
    const rows = getAreaRows();
    expect(rows[0].querySelectorAll('button')[1].disabled).toBe(true);
    expect(rows[2].querySelectorAll('button')[2].disabled).toBe(true);
    rows[1].querySelectorAll('button')[0].click();
    expect(component.editedAreaIndex()).toBe(1);
    rows[1].querySelectorAll('button')[1].click();
    expect(eids()).toEqual(['b', 'a', 'c']);
    fixture.detectChanges();
    getAreaRows()[0].querySelectorAll('button')[2].click();
    expect(eids()).toEqual(['a', 'b', 'c']);
    fixture.detectChanges();
    getAreaRows()[2].querySelectorAll('button')[3].click();
    expect(eids()).toEqual(['a', 'b']);
  });

  it('should save edited part', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.form.material().value.set(' stone ');
    component.form.objectType().value.set(' stele ');
    component.form.note().value.set(' note ');
    component.save();
    const part = (spy.mock.calls[0][0] as EditedObject<EpiSupportPart>).value!;
    expect(part.id).toBe('p1');
    expect(part.material).toBe('stone');
    expect(part.objectType).toBe('stele');
    expect(part.size).toEqual(createPart().size);
    expect(part.counts).toEqual([{ id: 'lines', value: 5 }]);
    expect(part.features).toEqual(['broken']);
    expect(part.textAreas).toEqual(createAreas());
    expect(part.note).toBe('note');
    expect(component.form().dirty()).toBe(false);
  });

  it('should save empty optional values as undefined', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.form.objectType().value.set('');
    component.form.hasSize().value.set(false);
    component.form.areas().value.set([]);
    component.form.note().value.set('  ');
    component.save();
    const part = (spy.mock.calls[0][0] as EditedObject<EpiSupportPart>).value!;
    expect(part.objectType).toBeUndefined();
    expect(part.size).toBeUndefined();
    expect(part.textAreas).toBeUndefined();
    expect(part.note).toBeUndefined();
  });

  it('should save a new part using identity', () => {
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.form.material().value.set('marble');
    component.save();
    const part = (spy.mock.calls[0][0] as EditedObject<EpiSupportPart>).value!;
    expect(part.itemId).toBe('i1');
    expect(part.typeId).toBe(EPI_SUPPORT_PART_TYPEID);
    expect(part.material).toBe('marble');
  });

  it('should not save without material', () => {
    const spy = vi.fn();
    component.data.subscribe(spy);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    component.save();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should save a model whose arrays carry no Symbol tags', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);
    expect(
      Object.getOwnPropertySymbols(component.form.areas().value()[0]).length,
    ).toBeGreaterThan(0);

    component.moveAreaDown(0);
    component.save();

    const part = (spy.mock.calls[0][0] as EditedObject<EpiSupportPart>).value!;
    for (const item of [...part.textAreas!, ...part.counts!]) {
      expect(Object.getOwnPropertySymbols(item)).toEqual([]);
    }
  });

  it('should not tag or change the bound part', () => {
    const part = createPart();
    setData({ value: part, thesauri: THESAURI });
    component.editArea(component.form.areas().value()[0], 0);
    expect(Object.getOwnPropertySymbols(component.editedArea()!)).toEqual([]);
    component.saveArea({ type: 'main', eid: 'changed' });
    component.onCountsChange([{ id: 'lines', value: 9 }]);
    component.save();
    expect(part.textAreas).toEqual(createAreas());
    expect(part.counts).toEqual([{ id: 'lines', value: 5 }]);
    for (const item of [...part.textAreas!, ...part.counts!]) {
      expect(Object.getOwnPropertySymbols(item)).toEqual([]);
    }
  });

  it('should stay pristine when children emit the bound values', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.onFeatIdsChange(['broken']);
    component.onCountsChange([
      { id: 'lines', value: 5, tag: undefined, note: undefined },
    ]);
    // a normalized copy, as the autosaving size editor emits
    component.onSupportSizeChange({
      w: { value: 50, unit: 'cm', tag: undefined },
      h: { value: 100, unit: 'cm', tag: undefined },
      tag: undefined,
      note: undefined,
    });
    expect(component.isDirty()).toBe(false);
  });

  it('should stay pristine when data is bound, and when it is bound again', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    expect(component.isDirty()).toBe(false);
    component.moveAreaDown(0);
    expect(component.isDirty()).toBe(true);
    setData({ value: createPart(), thesauri: THESAURI });
    expect(component.isDirty()).toBe(false);
  });

  it('should save empty arrays and strings as missing', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.onFeatIdsChange([]);
    component.onCountsChange([]);
    component.form.objectType().value.set(' ');
    component.form.note().value.set('');
    component.form.hasSize().value.set(false);
    component.save();
    const part = (spy.mock.calls[0][0] as EditedObject<EpiSupportPart>).value!;
    expect(part.features).toBeUndefined();
    expect(part.counts).toBeUndefined();
    expect(part.objectType).toBeUndefined();
    expect(part.note).toBeUndefined();
    expect(part.size).toBeUndefined();
  });

  it('should attach a tooltip to each area action button', async () => {
    setData({ value: createPart(), thesauri: THESAURI });
    await selectTab(1);
    const buttons = fixture.debugElement.queryAll(
      By.css('tbody tr button[mattooltip]'),
    );
    expect(buttons.length).toBe(4 * getAreaRows().length);
    for (const button of buttons) {
      expect(button.injector.get(MatTooltip, null)).toBeTruthy();
    }
  });

  it('should render no <form>, also with the area editor open', async () => {
    setData({ value: createPart(), thesauri: THESAURI });
    await selectTab(1);
    component.editArea(component.form.areas().value()[0], 0);
    fixture.detectChanges();
    expect(getAreaEditor()).toBeTruthy();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });
});
