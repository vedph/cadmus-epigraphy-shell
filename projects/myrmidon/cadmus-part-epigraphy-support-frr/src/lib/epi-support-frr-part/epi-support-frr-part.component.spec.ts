import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject, of } from 'rxjs';

import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { EditedObject, ThesauriSet } from '@myrmidon/cadmus-core';
import { AppRepository } from '@myrmidon/cadmus-state';

import {
  EPI_SUPPORT_FRR_PART_TYPEID,
  EpiSupportFr,
  EpiSupportFrrPart,
} from '../epi-support-frr-part';
import { EpiSupportFrComponent } from '../epi-support-fr/epi-support-fr.component';
import { EpiSupportFrrPartComponent } from './epi-support-frr-part.component';

const THESAURI: ThesauriSet = {
  'physical-size-units': {
    id: 'physical-size-units@en',
    language: 'en',
    entries: [{ id: 'cm', value: 'cm' }],
  },
  'physical-size-tags': {
    id: 'physical-size-tags@en',
    language: 'en',
    entries: [{ id: 'max', value: 'max' }],
  },
  'physical-size-dim-tags': {
    id: 'physical-size-dim-tags@en',
    language: 'en',
    entries: [{ id: 'approx', value: 'approx' }],
  },
  'physical-grid-presets': {
    id: 'physical-grid-presets@en',
    language: 'en',
    entries: [{ id: 'small', value: 'small: 2x2' }],
  },
};

function createFragments(): EpiSupportFr[] {
  return [
    {
      id: 'a',
      size: { w: { value: 20, unit: 'cm' }, h: { value: 10, unit: 'cm' } },
      rowCount: 2,
      columnCount: 2,
      location: 'A1',
    },
    { id: 'b', rowCount: 2, columnCount: 2, location: 'B1' },
    { id: 'c', rowCount: 2, columnCount: 2, location: 'A2 B2' },
  ];
}

function createPart(): EpiSupportFrrPart {
  return {
    id: 'p1',
    itemId: 'i1',
    typeId: EPI_SUPPORT_FRR_PART_TYPEID,
    timeCreated: new Date(),
    creatorId: 'zeus',
    timeModified: new Date(),
    userId: 'zeus',
    fragments: createFragments(),
  };
}

describe('EpiSupportFrrPartComponent', () => {
  let component: EpiSupportFrrPartComponent;
  let fixture: ComponentFixture<EpiSupportFrrPartComponent>;
  let dialogService: { confirm: ReturnType<typeof vi.fn> };

  function setData(data?: EditedObject<EpiSupportFrrPart>): void {
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
  }

  function getRows(): HTMLTableRowElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('mat-card-content > table > tbody > tr'),
    );
  }

  function getChildEditor(): EpiSupportFrComponent | undefined {
    return fixture.debugElement.query(
      (de) => de.componentInstance instanceof EpiSupportFrComponent,
    )?.componentInstance;
  }

  function ids(): string[] {
    return component.fragments.value.map((f) => f.id);
  }

  beforeEach(async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    dialogService = { confirm: vi.fn().mockReturnValue(of(true)) };
    const user = { userName: 'zeus', roles: ['editor'] } as unknown as User;

    await TestBed.configureTestingModule({
      imports: [EpiSupportFrrPartComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
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

    fixture = TestBed.createComponent(EpiSupportFrrPartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('identity', {
      itemId: 'i1',
      typeId: EPI_SUPPORT_FRR_PART_TYPEID,
      partId: null,
      roleId: null,
    });
    fixture.detectChanges();
  });

  it('should create with an invalid empty form', () => {
    expect(component).toBeTruthy();
    expect(component.fragments.value).toEqual([]);
    expect(component.form.invalid).toBe(true);
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('should show the default title', () => {
    const title: HTMLElement =
      fixture.nativeElement.querySelector('mat-card-title');
    expect(title.textContent).toContain('Epigraphic Support Fragments Part');
  });

  it('should load thesauri and part from data', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    expect(component.unitEntries()?.length).toBe(1);
    expect(component.tagEntries()?.length).toBe(1);
    expect(component.dimTagEntries()?.length).toBe(1);
    expect(component.gridPresetEntries()?.length).toBe(1);
    expect(component.fragments.value).toEqual(createFragments());
    expect(component.form.valid).toBe(true);
    expect(component.form.pristine).toBe(true);
  });

  it('should render fragments', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const rows = getRows();
    expect(rows.length).toBe(3);
    const cells = Array.from(rows[0].querySelectorAll('td')).map((c) =>
      c.textContent!.trim(),
    );
    expect(cells[1]).toBe('a');
    expect(cells[2]).toContain('20');
    expect(cells[3]).toBe('A1');
  });

  it('should clear thesauri entries when missing', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    setData({ value: createPart(), thesauri: {} });
    expect(component.unitEntries()).toBeUndefined();
    expect(component.tagEntries()).toBeUndefined();
    expect(component.dimTagEntries()).toBeUndefined();
    expect(component.gridPresetEntries()).toBeUndefined();
  });

  it('should reset form when data has no value', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    setData({ value: null, thesauri: THESAURI });
    expect(component.fragments.value).toEqual([]);
  });

  it('should default fragments to empty array when missing', () => {
    const part = createPart();
    part.fragments = undefined as unknown as EpiSupportFr[];
    setData({ value: part, thesauri: {} });
    expect(component.fragments.value).toEqual([]);
  });

  it('should add a new fragment passing thesauri to editor', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.addFr();
    fixture.detectChanges();
    expect(component.edited()).toEqual({ id: '' });
    expect(component.editedIndex()).toBe(-1);
    const editor = getChildEditor()!;
    expect(editor.unitEntries()).toEqual(
      THESAURI['physical-size-units'].entries,
    );
    expect(editor.tagEntries()).toEqual(THESAURI['physical-size-tags'].entries);
    expect(editor.dimTagEntries()).toEqual(
      THESAURI['physical-size-dim-tags'].entries,
    );
    expect(editor.gridPresets()).toEqual(['small: 2x2']);
  });

  it('should edit a copy of a fragment', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editFr(component.fragments.value[1], 1);
    fixture.detectChanges();
    expect(component.edited()).toEqual(createFragments()[1]);
    expect(component.edited()).not.toBe(component.fragments.value[1]);
    expect(getRows()[1].classList.contains('selected')).toBe(true);
    expect(getChildEditor()!.id.value).toBe('b');
  });

  it('should close edited fragment on child cancel', () => {
    component.addFr();
    fixture.detectChanges();
    getChildEditor()!.cancel();
    fixture.detectChanges();
    expect(component.edited()).toBeUndefined();
    expect(component.editedIndex()).toBe(-1);
    expect(getChildEditor()).toBeUndefined();
  });

  it('should append a new fragment', () => {
    const spy = vi.fn();
    component.dirtyChange.subscribe(spy);
    component.addFr();
    component.saveFr({ id: 'x' });
    expect(component.fragments.value).toEqual([{ id: 'x' }]);
    expect(component.fragments.dirty).toBe(true);
    expect(component.form.valid).toBe(true);
    expect(component.edited()).toBeUndefined();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should replace an existing fragment with the same ID when adding', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.addFr();
    component.saveFr({ id: 'b', note: 'new b' });
    expect(ids()).toEqual(['a', 'b', 'c']);
    expect(component.fragments.value[1].note).toBe('new b');
  });

  it('should replace an edited fragment', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editFr(component.fragments.value[1], 1);
    component.saveFr({ id: 'z' });
    expect(ids()).toEqual(['a', 'z', 'c']);
  });

  it('should save fragment from child editor', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editFr(component.fragments.value[2], 2);
    fixture.detectChanges();
    const editor = getChildEditor()!;
    editor.note.setValue('gamma');
    editor.save();
    fixture.detectChanges();
    expect(component.fragments.value[2]).toEqual({
      id: 'c',
      shelfmark: undefined,
      isLost: undefined,
      size: undefined,
      rowCount: 2,
      columnCount: 2,
      location: 'A2 B2',
      cellMappings: undefined,
      note: 'gamma',
    });
    expect(getChildEditor()).toBeUndefined();
  });

  it('should delete a fragment after confirmation', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.deleteFr(1);
    expect(dialogService.confirm).toHaveBeenCalled();
    expect(ids()).toEqual(['a', 'c']);
    expect(component.fragments.dirty).toBe(true);
  });

  it('should not delete a fragment without confirmation', () => {
    dialogService.confirm.mockReturnValue(of(false));
    setData({ value: createPart(), thesauri: THESAURI });
    component.deleteFr(1);
    expect(ids()).toEqual(['a', 'b', 'c']);
  });

  it('should close the editor when deleting the edited fragment', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editFr(component.fragments.value[1], 1);
    component.deleteFr(1);
    expect(component.edited()).toBeUndefined();
  });

  it('should keep edited fragment when deleting a previous fragment', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editFr(component.fragments.value[2], 2);
    component.deleteFr(0);
    expect(component.editedIndex()).toBe(1);
    component.saveFr({ id: 'c2' });
    expect(ids()).toEqual(['b', 'c2']);
  });

  it('should move fragments up and down', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.moveFrUp(0);
    component.moveFrDown(2);
    expect(ids()).toEqual(['a', 'b', 'c']);
    expect(component.fragments.dirty).toBe(false);
    component.moveFrUp(2);
    expect(ids()).toEqual(['a', 'c', 'b']);
    component.moveFrDown(0);
    expect(ids()).toEqual(['c', 'a', 'b']);
    expect(component.fragments.dirty).toBe(true);
  });

  it('should keep edited fragment when moving fragments', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editFr(component.fragments.value[0], 0);
    component.moveFrDown(0);
    expect(component.editedIndex()).toBe(1);
    component.moveFrUp(1);
    expect(component.editedIndex()).toBe(0);
    component.moveFrDown(1);
    expect(component.editedIndex()).toBe(0);
    component.saveFr({ id: 'a2' });
    expect(ids()).toEqual(['a2', 'c', 'b']);
  });

  it('should invoke row actions from buttons', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const rows = getRows();
    expect(rows[0].querySelectorAll('button')[1].disabled).toBe(true);
    expect(rows[2].querySelectorAll('button')[2].disabled).toBe(true);
    rows[1].querySelectorAll('button')[0].click();
    expect(component.editedIndex()).toBe(1);
    rows[1].querySelectorAll('button')[1].click();
    expect(ids()).toEqual(['b', 'a', 'c']);
    fixture.detectChanges();
    getRows()[0].querySelectorAll('button')[2].click();
    expect(ids()).toEqual(['a', 'b', 'c']);
    fixture.detectChanges();
    getRows()[2].querySelectorAll('button')[3].click();
    expect(ids()).toEqual(['a', 'b']);
  });

  it('should save edited part', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.moveFrDown(0);
    component.save();
    const part = (spy.mock.calls[0][0] as EditedObject<EpiSupportFrrPart>)
      .value!;
    expect(part.id).toBe('p1');
    expect(part.fragments.map((f) => f.id)).toEqual(['b', 'a', 'c']);
  });

  it('should save a new part using identity', () => {
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.saveFr({ id: 'x' });
    component.save();
    const part = (spy.mock.calls[0][0] as EditedObject<EpiSupportFrrPart>)
      .value!;
    expect(part.itemId).toBe('i1');
    expect(part.typeId).toBe(EPI_SUPPORT_FRR_PART_TYPEID);
    expect(part.fragments).toEqual([{ id: 'x' }]);
  });

  it('should not save without fragments', () => {
    const spy = vi.fn();
    component.data.subscribe(spy);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    component.save();
    expect(spy).not.toHaveBeenCalled();
  });
});
