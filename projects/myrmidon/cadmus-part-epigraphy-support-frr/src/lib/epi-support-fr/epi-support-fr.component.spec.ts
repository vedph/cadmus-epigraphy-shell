import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { PhysicalGridLocationComponent } from '@myrmidon/cadmus-mat-physical-grid';

import { EpiSupportFr, EpiSupportFrCellMapping } from '../epi-support-frr-part';
import { EpiSupportFrCellMappingComponent } from '../epi-support-fr-cell-mapping/epi-support-fr-cell-mapping.component';
import { EpiSupportFrComponent } from './epi-support-fr.component';

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
    return component.mappings.value.map((m) => m.location);
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
    expect(component.form.invalid).toBe(true);
    expect(component.id.hasError('required')).toBe(true);
    expect(component.location.hasError('required')).toBe(true);
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
    expect(component.id.value).toBe('fr1');
    expect(component.shelfmark.value).toBe('inv. 123');
    expect(component.lost.value).toBe(true);
    expect(component.size.value).toEqual(createFragment().size);
    expect(component.location.value).toEqual({
      rows: 2,
      columns: 3,
      coords: [
        { row: 1, column: 1 },
        { row: 1, column: 2 },
      ],
    });
    expect(component.mappings.value).toEqual(createMappings());
    expect(component.note.value).toBe('a note');
    expect(component.form.valid).toBe(true);
    expect(component.form.pristine).toBe(true);
  });

  it('should map missing fragment values to defaults', () => {
    setFragment({ id: 'x' });
    expect(component.shelfmark.value).toBeNull();
    expect(component.lost.value).toBe(false);
    expect(component.size.value).toBeNull();
    expect(component.location.value).toEqual({
      rows: 0,
      columns: 0,
      coords: [],
    });
    expect(component.mappings.value).toEqual([]);
    expect(component.note.value).toBeNull();
  });

  it('should reset form when fragment is cleared', () => {
    setFragment(createFragment());
    setFragment(undefined);
    expect(component.id.value).toBe('');
    expect(component.lost.value).toBe(false);
    expect(component.location.value).toBeNull();
    expect(component.mappings.value).toEqual([]);
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
    expect(component.size.value).toEqual(size);
    expect(component.size.dirty).toBe(true);
  });

  it('should update location', () => {
    const location = {
      rows: 1,
      columns: 1,
      coords: [{ row: 1, column: 1 }],
    };
    component.onLocationChange(location);
    expect(component.location.value).toEqual(location);
    expect(component.location.dirty).toBe(true);
  });

  it('should validate max lengths', () => {
    component.id.setValue('x'.repeat(101));
    component.shelfmark.setValue('x'.repeat(101));
    component.note.setValue('x'.repeat(1001));
    expect(component.id.hasError('maxlength')).toBe(true);
    expect(component.shelfmark.hasError('maxlength')).toBe(true);
    expect(component.note.hasError('maxlength')).toBe(true);
  });

  it('should show errors', () => {
    component.id.markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['ID required']);

    component.id.setValue('x'.repeat(101));
    component.shelfmark.setValue('x'.repeat(101));
    component.shelfmark.markAsTouched();
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
    expect(component.editedMapping()).not.toBe(component.mappings.value[1]);
    expect(getMappingRows()[1].classList.contains('selected')).toBe(true);
    expect(getMappingEditor()!.location.value).toBe('B1');
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
    expect(component.mappings.dirty).toBe(true);
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
    editor.tailText.setValue('end');
    editor.save();
    fixture.detectChanges();
    expect(component.mappings.value[0]).toEqual({
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
    expect(component.mappings.dirty).toBe(true);
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
    component.id.setValue(' fr2 ');
    component.lost.setValue(false);
    component.onLocationChange({
      rows: 3,
      columns: 3,
      coords: [
        { row: 2, column: 2 },
        { row: 3, column: 3 },
      ],
    });
    component.note.setValue(' note ');
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
    component.shelfmark.setValue('  ');
    component.note.setValue(' ');
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
    component.id.setValue('x');
    component.save();
    // no location
    expect(spy).not.toHaveBeenCalled();
  });

  it('should save on submit', () => {
    setFragment(createFragment());
    const spy = vi.fn();
    component.fragment.subscribe(spy);
    component.id.setValue('fr3');
    component.id.markAsDirty();
    fixture.detectChanges();
    const submit: HTMLButtonElement = fixture.nativeElement.querySelector(
      '#toolbar button[type="submit"]',
    );
    expect(submit.disabled).toBe(false);
    submit.click();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: 'fr3' }));
  });

  it('should emit fragmentCancel on cancel', () => {
    const spy = vi.fn();
    component.fragmentCancel.subscribe(spy);
    (
      fixture.nativeElement.querySelector(
        '#toolbar button[type="button"]',
      ) as HTMLButtonElement
    ).click();
    expect(spy).toHaveBeenCalled();
  });
});
