import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { PhysicalGridLocationComponent } from '@myrmidon/cadmus-mat-physical-grid';

import { EpiSupportFr, EpiSupportFrCellMapping } from '../epi-support-frr-part';
import { EpiSupportFrCellMappingComponent } from '../epi-support-fr-cell-mapping/epi-support-fr-cell-mapping.component';
import { EpiSupportFrComponent } from './epi-support-fr.component';

// the form tags the objects in its arrays with an identity Symbol:
// compare their plain data only
function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const PRESETS: ThesaurusEntry[] = [
  { id: 'small', value: 'small: 2x2' },
  { id: 'large', value: 'large: 4x3' },
];

function createMappings(): EpiSupportFrCellMapping[] {
  return [
    { location: 'A1', headText: 'dis' },
    { location: 'B1', headText: 'manibus' },
    { location: 'A2', tailText: 'sacrum' },
  ];
}

function createFragment(): EpiSupportFr {
  return {
    id: 'fr1',
    shelfmark: 'inv. 123',
    isLost: true,
    size: {
      w: { value: 20, unit: 'cm' },
      h: { value: 30, unit: 'cm' },
    },
    rowCount: 2,
    columnCount: 3,
    location: 'A1 B1',
    cellMappings: createMappings(),
    note: 'a note',
  };
}

describe('EpiSupportFrComponent', () => {
  let component: EpiSupportFrComponent;
  let fixture: ComponentFixture<EpiSupportFrComponent>;

  function getErrors(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(
        'mat-error',
      ) as NodeListOf<HTMLElement>,
    ).map((e) => e.textContent!.trim());
  }

  function setFragment(fr?: EpiSupportFr): void {
    fixture.componentRef.setInput('fragment', fr);
    fixture.detectChanges();
  }

  function getMappingRows(): HTMLTableRowElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
  }

  function getMappingEditor(): EpiSupportFrCellMappingComponent | undefined {
    return fixture.debugElement.query(
      (de) => de.componentInstance instanceof EpiSupportFrCellMappingComponent,
    )?.componentInstance;
  }

  function locations(): string[] {
    return component.form.mappings().value().map((m) => m.location);
  }

  beforeEach(async () => {
    // the grid location component logs its state
    vi.spyOn(console, 'log').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [EpiSupportFrComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EpiSupportFrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with an invalid empty form', () => {
    expect(component).toBeTruthy();
    expect(component.form().invalid()).toBe(true);
    expect(!!component.form.id().getError('required')).toBe(true);
    expect(!!component.form.location().getError('required')).toBe(true);
    expect(component.gridPresets()).toBeUndefined();
  });

  it('should map grid preset entries to their values', () => {
    fixture.componentRef.setInput('gridPresetEntries', PRESETS);
    fixture.detectChanges();
    expect(component.gridPresets()).toEqual(['small: 2x2', 'large: 4x3']);
    const grid = fixture.debugElement.query(
      (de) => de.componentInstance instanceof PhysicalGridLocationComponent,
    ).componentInstance as PhysicalGridLocationComponent;
    expect(grid.presets()).toEqual(['small: 2x2', 'large: 4x3']);
  });

  it('should update form from fragment', () => {
    setFragment(createFragment());
    expect(component.form.id().value()).toBe('fr1');
    expect(component.form.shelfmark().value()).toBe('inv. 123');
    expect(component.form.lost().value()).toBe(true);
    expect(plain(component.form.size().value())).toEqual(createFragment().size);
    expect(plain(component.form.location().value())).toEqual({
      rows: 2,
      columns: 3,
      coords: [
        { row: 1, column: 1 },
        { row: 1, column: 2 },
      ],
    });
    expect(plain(component.form.mappings().value())).toEqual(createMappings());
    expect(component.form.note().value()).toBe('a note');
    expect(component.form().valid()).toBe(true);
    expect(component.form().dirty()).toBe(false);
  });

  it('should map missing fragment values to defaults', () => {
    setFragment({ id: 'x' });
    expect(component.form.shelfmark().value()).toBe('');
    expect(component.form.lost().value()).toBe(false);
    expect(component.form.size().value()).toBeNull();
    expect(plain(component.form.location().value())).toEqual({
      rows: 0,
      columns: 0,
      coords: [],
    });
    expect(plain(component.form.mappings().value())).toEqual([]);
    expect(component.form.note().value()).toBe('');
  });

  it('should reset form when fragment is cleared', () => {
    setFragment(createFragment());
    setFragment(undefined);
    expect(component.form.id().value()).toBe('');
    expect(component.form.lost().value()).toBe(false);
    expect(component.form.location().value()).toBeNull();
    expect(plain(component.form.mappings().value())).toEqual([]);
  });

  it('should render mappings', () => {
    setFragment(createFragment());
    const rows = getMappingRows();
    expect(rows.length).toBe(3);
    const cells = Array.from(rows[0].querySelectorAll('td')).map((c) =>
      c.textContent!.trim(),
    );
    expect(cells.slice(1)).toEqual(['A1', 'dis', '']);
  });

  it('should update size', () => {
    const size = { w: { value: 1, unit: 'mm' } };
    component.onSizeChange(size);
    expect(plain(component.form.size().value())).toEqual(size);
    expect(component.form.size().dirty()).toBe(true);
  });

  it('should update location', () => {
    const location = {
      rows: 1,
      columns: 1,
      coords: [{ row: 1, column: 1 }],
    };
    component.onLocationChange(location);
    expect(plain(component.form.location().value())).toEqual(location);
    expect(component.form.location().dirty()).toBe(true);
  });

  it('should validate max lengths', () => {
    component.form.id().value.set('x'.repeat(101));
    component.form.shelfmark().value.set('x'.repeat(101));
    component.form.note().value.set('x'.repeat(1001));
    expect(!!component.form.id().getError('maxLength')).toBe(true);
    expect(!!component.form.shelfmark().getError('maxLength')).toBe(true);
    expect(!!component.form.note().getError('maxLength')).toBe(true);
  });

  it('should show errors', () => {
    component.form.id().markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['ID required']);

    component.form.id().value.set('x'.repeat(101));
    component.form.shelfmark().value.set('x'.repeat(101));
    component.form.shelfmark().markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['ID too long', 'shelfmark too long']);
  });

  it('should add a new mapping', () => {
    component.addMapping();
    fixture.detectChanges();
    expect(component.editedMapping()).toEqual({ location: '' });
    expect(component.editedIndex()).toBe(-1);
    expect(getMappingEditor()).toBeTruthy();
  });

  it('should edit a copy of a mapping', () => {
    setFragment(createFragment());
    component.editMapping(1);
    fixture.detectChanges();
    expect(component.editedIndex()).toBe(1);
    expect(component.editedMapping()).toEqual(createMappings()[1]);
    expect(component.editedMapping()).not.toBe(component.form.mappings().value()[1]);
    expect(getMappingRows()[1].classList.contains('selected')).toBe(true);
    expect(getMappingEditor()!.form.location().value()).toBe('B1');
  });

  it('should close mapping editor on its cancel', () => {
    component.addMapping();
    fixture.detectChanges();
    getMappingEditor()!.cancel();
    fixture.detectChanges();
    expect(component.editedMapping()).toBeUndefined();
    expect(getMappingEditor()).toBeUndefined();
  });

  it('should append a new mapping', () => {
    setFragment(createFragment());
    component.addMapping();
    component.onMappingChange({ location: 'C2' });
    expect(locations()).toEqual(['A1', 'B1', 'A2', 'C2']);
    expect(component.form.mappings().dirty()).toBe(true);
    expect(component.editedMapping()).toBeUndefined();
  });

  it('should replace an edited mapping', () => {
    setFragment(createFragment());
    component.editMapping(1);
    component.onMappingChange({ location: 'C1' });
    expect(locations()).toEqual(['A1', 'C1', 'A2']);
    expect(component.editedIndex()).toBe(-1);
  });

  it('should save mapping from mapping editor', () => {
    setFragment(createFragment());
    component.editMapping(0);
    fixture.detectChanges();
    const editor = getMappingEditor()!;
    editor.form.tailText().value.set('end');
    editor.save();
    fixture.detectChanges();
    expect(plain(component.form.mappings().value()[0])).toEqual({
      location: 'A1',
      headText: 'dis',
      headTextLoc: undefined,
      tailText: 'end',
      tailTextLoc: undefined,
    });
    expect(getMappingEditor()).toBeUndefined();
  });

  it('should delete a mapping', () => {
    setFragment(createFragment());
    component.deleteMapping(1);
    expect(locations()).toEqual(['A1', 'A2']);
    expect(component.form.mappings().dirty()).toBe(true);
  });

  it('should close mapping editor when deleting the edited mapping', () => {
    setFragment(createFragment());
    component.editMapping(1);
    component.deleteMapping(1);
    expect(component.editedMapping()).toBeUndefined();
  });

  it('should keep edited mapping when deleting a previous mapping', () => {
    setFragment(createFragment());
    component.editMapping(2);
    component.deleteMapping(0);
    expect(component.editedIndex()).toBe(1);
    component.onMappingChange({ location: 'A3' });
    expect(locations()).toEqual(['B1', 'A3']);
  });

  it('should invoke mapping actions from buttons', () => {
    setFragment(createFragment());
    const buttons = getMappingRows()[1].querySelectorAll('button');
    buttons[1].click();
    expect(component.editedIndex()).toBe(1);
    buttons[0].click();
    expect(locations()).toEqual(['A1', 'A2']);
    expect(component.editedMapping()).toBeUndefined();
  });

  it('should save edited fragment', () => {
    setFragment(createFragment());
    const spy = vi.fn();
    component.fragment.subscribe(spy);
    component.form.id().value.set(' fr2 ');
    component.form.lost().value.set(false);
    component.onLocationChange({
      rows: 3,
      columns: 3,
      coords: [
        { row: 2, column: 2 },
        { row: 3, column: 3 },
      ],
    });
    component.form.note().value.set(' note ');
    component.save();
    expect(spy).toHaveBeenCalledWith({
      id: 'fr2',
      shelfmark: 'inv. 123',
      isLost: undefined,
      size: createFragment().size,
      rowCount: 3,
      columnCount: 3,
      location: 'B2 C3',
      cellMappings: createMappings(),
      note: 'note',
    });
  });

  it('should save empty optional values as undefined', () => {
    setFragment({ id: 'x', rowCount: 1, columnCount: 1, location: 'A1' });
    const spy = vi.fn();
    component.fragment.subscribe(spy);
    component.form.shelfmark().value.set('  ');
    component.form.note().value.set(' ');
    component.save();
    expect(spy).toHaveBeenCalledWith({
      id: 'x',
      shelfmark: undefined,
      isLost: undefined,
      size: undefined,
      rowCount: 1,
      columnCount: 1,
      location: 'A1',
      cellMappings: undefined,
      note: undefined,
    });
  });

  it('should not save when invalid', () => {
    const spy = vi.fn();
    component.fragment.subscribe(spy);
    component.form.id().value.set('x');
    component.save();
    // no location
    expect(spy).not.toHaveBeenCalled();
  });

  it('should save on submit', () => {
    setFragment(createFragment());
    const spy = vi.fn();
    component.fragment.subscribe(spy);
    component.form.id().value.set('fr3');
    component.form.id().markAsDirty();
    fixture.detectChanges();
    const submit: HTMLButtonElement = fixture.nativeElement.querySelector(
      '#toolbar button[mattooltip="Save fragment"]',
    );
    expect(submit.disabled).toBe(false);
    submit.click();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: 'fr3' }));
  });

  it('should use a plain save button disabled when pristine', () => {
    setFragment(createFragment());
    const save: HTMLButtonElement = fixture.nativeElement.querySelector(
      '#toolbar button[mattooltip="Save fragment"]',
    );
    expect(save.type).toBe('button');
    expect(save.disabled).toBe(true);
  });

  it('should mark as touched when saving an invalid form', () => {
    component.save();
    expect(component.form.id().touched()).toBe(true);
  });

  it('should stay pristine when children emit the bound values', () => {
    setFragment(createFragment());
    // normalized copies, as the autosaving size editor emits
    component.onSizeChange({
      w: { value: 20, unit: 'cm', tag: undefined },
      h: { value: 30, unit: 'cm', tag: undefined },
      tag: undefined,
    });
    component.onLocationChange({
      rows: 2,
      columns: 3,
      coords: [
        { row: 1, column: 1 },
        { row: 1, column: 2 },
      ],
    });
    expect(component.form().dirty()).toBe(false);
  });

  it('should not tag or change the bound fragment', () => {
    const fr = createFragment();
    setFragment(fr);
    component.editMapping(0);
    expect(Object.getOwnPropertySymbols(component.editedMapping()!)).toEqual(
      [],
    );
    component.onMappingChange({ location: 'Z1' });
    component.save();
    expect(fr.cellMappings).toEqual(createMappings());
    for (const m of fr.cellMappings!) {
      expect(Object.getOwnPropertySymbols(m)).toEqual([]);
    }
  });

  it('should save a fragment whose mappings carry no Symbol tags', () => {
    setFragment(createFragment());
    const spy = vi.fn();
    component.fragment.subscribe(spy);
    component.deleteMapping(0);
    component.save();
    const saved = spy.mock.calls[0][0] as EpiSupportFr;
    for (const m of saved.cellMappings!) {
      expect(Object.getOwnPropertySymbols(m)).toEqual([]);
    }
  });

  it('should keep an in-progress edit when its own save echoes back normalized', () => {
    setFragment(createFragment());
    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      '#general input[matInput]',
    );
    input.value = 'abc ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    component.save();
    fixture.detectChanges();

    expect(component.fragment()?.id).toBe('abc');
    expect(component.form.id().value()).toBe('abc ');
    input.value = component.form.id().value() + 'd';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.form.id().value()).toBe('abc d');
  });

  it('should save on Enter in its own text input when valid and dirty', () => {
    setFragment(createFragment());
    const spy = vi.fn();
    component.fragment.subscribe(spy);
    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      '#general input[matInput]',
    );
    input.value = 'fr9';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: 'fr9' }));
  });

  it('should save only the mapping on Enter in the mapping editor', () => {
    setFragment(createFragment());
    // make the fragment itself dirty and valid, so that it could be saved
    component.form.note().value.set('changed');
    component.form.note().markAsDirty();
    const spy = vi.fn();
    component.fragment.subscribe(spy);
    component.editMapping(0);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      'cadmus-epi-support-fr-cell-mapping input',
    );
    input.value = 'C9';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();

    expect(locations()[0]).toBe('C9');
    expect(getMappingEditor()).toBeUndefined();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should not save the fragment on Enter in a pristine mapping editor', () => {
    setFragment(createFragment());
    component.form.note().value.set('changed');
    component.form.note().markAsDirty();
    const spy = vi.fn();
    component.fragment.subscribe(spy);
    component.editMapping(0);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      'cadmus-epi-support-fr-cell-mapping input',
    );
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(spy).not.toHaveBeenCalled();
    expect(getMappingEditor()).toBeTruthy();
  });

  it('should render no <form>, also with the mapping editor open', () => {
    setFragment(createFragment());
    component.editMapping(0);
    fixture.detectChanges();
    expect(getMappingEditor()).toBeTruthy();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('should emit fragmentCancel on cancel', () => {
    const spy = vi.fn();
    component.fragmentCancel.subscribe(spy);
    (
      fixture.nativeElement.querySelector(
        '#toolbar button[mattooltip="Discard fragment"]',
      ) as HTMLButtonElement
    ).click();
    expect(spy).toHaveBeenCalled();
  });
});
