import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { EpiTextArea } from '../epi-support-part';
import { EpiTextAreaComponent } from './epi-text-area.component';

const TYPES: ThesaurusEntry[] = [
  { id: 'main', value: 'main' },
  { id: 'side', value: 'side' },
];
const LAYOUTS: ThesaurusEntry[] = [{ id: 'lines', value: 'lines' }];
const FEATURES: ThesaurusEntry[] = [
  { id: 'ruling', value: 'ruling' },
  { id: 'erasure', value: 'erasure' },
];
const FRAMES: ThesaurusEntry[] = [{ id: 'moulding', value: 'moulding' }];

/**
 * Count the mat-select elements of this editor, excluding those of
 * the physical size editor.
 */
function countOwnSelects(root: HTMLElement): number {
  return Array.from(root.querySelectorAll('mat-select')).filter(
    (e) => !e.closest('cadmus-mat-physical-size'),
  ).length;
}

function createArea(): EpiTextArea {
  return {
    eid: 'a1',
    type: 'main',
    layout: 'lines',
    size: { w: { value: 10, unit: 'cm' } },
    features: ['ruling'],
    frameType: 'moulding',
    frameDescription: 'a frame',
    note: 'a note',
  };
}

describe('EpiTextAreaComponent', () => {
  let component: EpiTextAreaComponent;
  let fixture: ComponentFixture<EpiTextAreaComponent>;

  function getErrors(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(
        'mat-error',
      ) as NodeListOf<HTMLElement>,
    ).map((e) => e.textContent!.trim());
  }

  function setArea(area?: EpiTextArea): void {
    fixture.componentRef.setInput('area', area);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiTextAreaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EpiTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with an invalid empty form', () => {
    expect(component).toBeTruthy();
    expect(component.form.invalid).toBe(true);
    expect(component.type.hasError('required')).toBe(true);
    expect(component.featFlags()).toEqual([]);
  });

  it('should use free inputs without thesauri', () => {
    expect(countOwnSelects(fixture.nativeElement)).toBe(0);
    // type, layout, eid
    expect(fixture.nativeElement.querySelectorAll('input[matinput]').length).toBe(
      3,
    );
    expect(fixture.nativeElement.querySelector('cadmus-ui-flag-set')).toBeNull();
  });

  it('should use selects and flags with thesauri', () => {
    fixture.componentRef.setInput('typeEntries', TYPES);
    fixture.componentRef.setInput('layoutEntries', LAYOUTS);
    fixture.componentRef.setInput('featEntries', FEATURES);
    fixture.componentRef.setInput('frameEntries', FRAMES);
    setArea(createArea());
    // type, layout, frame type
    expect(countOwnSelects(fixture.nativeElement)).toBe(3);
    expect(
      fixture.nativeElement.querySelector('cadmus-ui-flag-set'),
    ).toBeTruthy();
    expect(component.featFlags()).toEqual([
      { id: 'ruling', label: 'ruling' },
      { id: 'erasure', label: 'erasure' },
    ]);
  });

  it('should update form from area', () => {
    setArea(createArea());
    expect(component.eid.value).toBe('a1');
    expect(component.type.value).toBe('main');
    expect(component.layout.value).toBe('lines');
    expect(component.hasSize.value).toBe(true);
    expect(component.size.value).toEqual(createArea().size);
    expect(component.features.value).toEqual(['ruling']);
    expect(component.hasFrame.value).toBe(true);
    expect(component.frameType.value).toBe('moulding');
    expect(component.frameDescription.value).toBe('a frame');
    expect(component.note.value).toBe('a note');
    expect(component.form.valid).toBe(true);
    expect(component.form.pristine).toBe(true);
  });

  it('should show size and frame sections when set', () => {
    setArea(createArea());
    expect(
      fixture.nativeElement.querySelector('cadmus-mat-physical-size'),
    ).toBeTruthy();
    expect(fixture.nativeElement.querySelector('fieldset legend')).toBeTruthy();
  });

  it('should map missing area values to defaults', () => {
    setArea({ type: '' });
    expect(component.eid.value).toBeNull();
    expect(component.type.value).toBe('');
    expect(component.layout.value).toBeNull();
    expect(component.hasSize.value).toBe(false);
    expect(component.size.value).toBeNull();
    expect(component.features.value).toEqual([]);
    expect(component.hasFrame.value).toBe(false);
    expect(component.frameType.value).toBeNull();
    expect(component.frameDescription.value).toBeNull();
    expect(component.note.value).toBeNull();
    expect(
      fixture.nativeElement.querySelector('cadmus-mat-physical-size'),
    ).toBeNull();
  });

  it('should keep frame for an area with only a frame description', () => {
    setArea({ type: 'main', frameDescription: 'a frame' });
    expect(component.hasFrame.value).toBe(true);
    expect(component.frameDescription.value).toBe('a frame');
    // the frame type is now required
    expect(component.frameType.hasError('required')).toBe(true);
    expect(component.form.invalid).toBe(true);
  });

  it('should reset form when area is cleared', () => {
    setArea(createArea());
    setArea(undefined);
    expect(component.type.value).toBe('');
    expect(component.hasSize.value).toBe(false);
    expect(component.hasFrame.value).toBe(false);
    expect(component.features.value).toEqual([]);
  });

  it('should require frame type only when frame is checked', () => {
    setArea({ type: 'main' });
    expect(component.form.valid).toBe(true);

    component.hasFrame.setValue(true);
    expect(component.frameType.hasError('required')).toBe(true);
    expect(component.form.invalid).toBe(true);

    component.frameType.setValue('moulding');
    expect(component.form.valid).toBe(true);

    component.frameType.setValue(null);
    expect(component.form.invalid).toBe(true);
    component.hasFrame.setValue(false);
    expect(component.frameType.valid).toBe(true);
    expect(component.form.valid).toBe(true);
  });

  it('should update size and features', () => {
    const size = { h: { value: 3, unit: 'cm' } };
    component.onSizeChange(size);
    expect(component.size.value).toEqual(size);
    expect(component.size.dirty).toBe(true);

    component.onFeatCheckedIdsChange(['erasure']);
    expect(component.features.value).toEqual(['erasure']);
    expect(component.features.dirty).toBe(true);
  });

  it('should validate max lengths', () => {
    component.eid.setValue('x'.repeat(101));
    component.layout.setValue('x'.repeat(51));
    component.frameType.setValue('x'.repeat(51));
    component.frameDescription.setValue('x'.repeat(5001));
    component.note.setValue('x'.repeat(5001));
    expect(component.eid.hasError('maxlength')).toBe(true);
    expect(component.layout.hasError('maxlength')).toBe(true);
    expect(component.frameType.hasError('maxlength')).toBe(true);
    expect(component.frameDescription.hasError('maxlength')).toBe(true);
    expect(component.note.hasError('maxlength')).toBe(true);
  });

  it('should show errors', () => {
    component.type.markAsTouched();
    component.hasFrame.setValue(true);
    component.frameType.markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['type required', 'frame type required']);

    for (const [ctl, len] of [
      [component.layout, 51],
      [component.eid, 101],
      [component.frameType, 51],
      [component.frameDescription, 5001],
      [component.note, 5001],
    ] as const) {
      ctl.setValue('x'.repeat(len));
      ctl.markAsTouched();
    }
    fixture.detectChanges();
    expect(getErrors()).toEqual([
      'type required',
      'layout too long',
      'eid too long',
      'frame type too long',
      'description too long',
      'note too long',
    ]);
  });

  it('should show frame type required error with select', () => {
    fixture.componentRef.setInput('frameEntries', FRAMES);
    component.hasFrame.setValue(true);
    component.frameType.markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toContain('frame type required');
  });

  it('should save edited area', () => {
    setArea(createArea());
    const spy = vi.fn();
    component.area.subscribe(spy);
    component.eid.setValue('a2');
    component.type.setValue(' side ');
    component.layout.setValue(' cols ');
    component.frameDescription.setValue(' frame ');
    component.note.setValue(' note ');
    component.save();
    expect(spy).toHaveBeenCalledWith({
      eid: 'a2',
      type: 'side',
      layout: 'cols',
      size: createArea().size,
      features: ['ruling'],
      frameType: 'moulding',
      frameDescription: 'frame',
      note: 'note',
    });
  });

  it('should drop size and frame when unchecked', () => {
    setArea(createArea());
    const spy = vi.fn();
    component.area.subscribe(spy);
    component.hasSize.setValue(false);
    component.hasFrame.setValue(false);
    component.onFeatCheckedIdsChange([]);
    component.eid.setValue('');
    component.layout.setValue(' ');
    component.note.setValue('');
    component.save();
    expect(spy).toHaveBeenCalledWith({
      eid: undefined,
      type: 'main',
      layout: undefined,
      size: undefined,
      features: undefined,
      frameType: undefined,
      frameDescription: undefined,
      note: undefined,
    });
  });

  it('should not save when invalid', () => {
    const spy = vi.fn();
    component.area.subscribe(spy);
    component.save();
    expect(spy).not.toHaveBeenCalled();

    component.type.setValue('main');
    component.hasFrame.setValue(true);
    component.save();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should save on submit', () => {
    const spy = vi.fn();
    component.area.subscribe(spy);
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'main';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const submit: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    );
    expect(submit.disabled).toBe(false);
    submit.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'main' }),
    );
  });

  it('should emit cancel on dismiss', () => {
    const spy = vi.fn();
    component.cancel.subscribe(spy);
    (
      fixture.nativeElement.querySelector(
        'button[type="button"]',
      ) as HTMLButtonElement
    ).click();
    expect(spy).toHaveBeenCalled();
  });
});
