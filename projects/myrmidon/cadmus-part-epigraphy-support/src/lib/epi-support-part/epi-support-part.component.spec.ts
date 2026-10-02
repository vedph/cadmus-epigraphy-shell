import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MatTabGroup } from '@angular/material/tabs';
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
  'epi-support-text-area-layouts': thesaurus(
    'epi-support-text-area-layouts',
    ['lines'],
  ),
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
    return component.areas.value.map((a) => a.eid);
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
    expect(component.form.invalid).toBe(true);
    expect(component.material.hasError('required')).toBe(true);
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
    expect(component.material.value).toBe('marble');
    expect(component.objectType.value).toBe('stele');
    expect(component.hasSize.value).toBe(true);
    expect(component.size.value).toEqual(createPart().size);
    expect(component.counts.value).toEqual([{ id: 'lines', value: 5 }]);
    expect(component.features.value).toEqual(['broken']);
    expect(component.areas.value).toEqual(createAreas());
    expect(component.note.value).toBe('a note');
    expect(component.form.valid).toBe(true);
    expect(component.form.pristine).toBe(true);
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
    expect(component.material.value).toBe('');
    expect(component.objectType.value).toBeNull();
    expect(component.hasSize.value).toBe(false);
    expect(component.size.value).toBeNull();
    expect(component.counts.value).toEqual([]);
    expect(component.features.value).toEqual([]);
    expect(component.areas.value).toEqual([]);
    expect(component.note.value).toBeNull();
  });

  it('should reset form when data has no value', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    setData({ value: null, thesauri: THESAURI });
    expect(component.material.value).toBe('');
    expect(component.hasSize.value).toBe(false);
    expect(component.areas.value).toEqual([]);
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
    component.hasSize.setValue(true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('cadmus-mat-physical-size'),
    ).toBeTruthy();
  });

  it('should validate max lengths', () => {
    component.material.setValue('x'.repeat(51));
    component.objectType.setValue('x'.repeat(51));
    component.note.setValue('x'.repeat(5001));
    expect(component.material.hasError('maxlength')).toBe(true);
    expect(component.objectType.hasError('maxlength')).toBe(true);
    expect(component.note.hasError('maxlength')).toBe(true);
  });

  it('should show material and object type errors', () => {
    const errors = () =>
      Array.from(
        fixture.nativeElement.querySelectorAll(
          'mat-error',
        ) as NodeListOf<HTMLElement>,
      ).map((e) => e.textContent!.trim());

    component.material.markAsTouched();
    fixture.detectChanges();
    expect(errors()).toEqual(['material required']);

    component.material.setValue('x'.repeat(51));
    component.objectType.setValue('x'.repeat(51));
    component.objectType.markAsTouched();
    fixture.detectChanges();
    expect(errors()).toEqual(['material too long', 'objectType too long']);
  });

  it('should update features, size and counts', () => {
    component.onFeatIdsChange(['reused']);
    expect(component.features.value).toEqual(['reused']);
    expect(component.features.dirty).toBe(true);

    const size = { d: { value: 2, unit: 'cm' } };
    component.onSupportSizeChange(size);
    expect(component.size.value).toEqual(size);
    expect(component.size.dirty).toBe(true);

    component.onCountsChange([{ id: 'lines', value: 3 }]);
    expect(component.counts.value).toEqual([{ id: 'lines', value: 3 }]);
    expect(component.counts.dirty).toBe(true);
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
    component.editArea(component.areas.value[1], 1);
    fixture.detectChanges();
    expect(component.editedArea()).toEqual(createAreas()[1]);
    expect(component.editedArea()).not.toBe(component.areas.value[1]);
    expect(getAreaRows()[1].classList.contains('selected')).toBe(true);
    expect(getAreaEditor()!.eid.value).toBe('b');
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
    expect(component.areas.value).toEqual([{ type: 'x' }]);
    expect(component.areas.dirty).toBe(true);
    expect(component.editedArea()).toBeUndefined();
  });

  it('should replace an edited area', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editArea(component.areas.value[1], 1);
    component.saveArea({ type: 'main', eid: 'z' });
    expect(eids()).toEqual(['a', 'z', 'c']);
  });

  it('should save area from area editor', async () => {
    setData({ value: createPart(), thesauri: THESAURI });
    await selectTab(1);
    component.editArea(component.areas.value[2], 2);
    fixture.detectChanges();
    const editor = getAreaEditor()!;
    editor.note.setValue('note');
    editor.save();
    fixture.detectChanges();
    expect(component.areas.value[2]).toEqual({
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
    expect(component.areas.dirty).toBe(true);
  });

  it('should not delete an area without confirmation', () => {
    dialogService.confirm.mockReturnValue(of(false));
    setData({ value: createPart(), thesauri: THESAURI });
    component.deleteArea(1);
    expect(eids()).toEqual(['a', 'b', 'c']);
  });

  it('should close the editor when deleting the edited area', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editArea(component.areas.value[1], 1);
    component.deleteArea(1);
    expect(component.editedArea()).toBeUndefined();
  });

  it('should keep edited area when deleting a previous area', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editArea(component.areas.value[2], 2);
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
    expect(component.areas.dirty).toBe(false);
    component.moveAreaUp(2);
    expect(eids()).toEqual(['a', 'c', 'b']);
    component.moveAreaDown(0);
    expect(eids()).toEqual(['c', 'a', 'b']);
    expect(component.areas.dirty).toBe(true);
  });

  it('should keep edited area when moving areas', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editArea(component.areas.value[1], 1);
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
    component.material.setValue(' stone ');
    component.objectType.setValue(' stele ');
    component.note.setValue(' note ');
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
    expect(component.form.pristine).toBe(true);
  });

  it('should save empty optional values as undefined', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.objectType.setValue('');
    component.hasSize.setValue(false);
    component.areas.setValue([]);
    component.note.setValue('  ');
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
    component.material.setValue('marble');
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
});
