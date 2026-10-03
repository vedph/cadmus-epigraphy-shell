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

  // own text inputs: type (without thesaurus), layout, eid
  function getOwnInputs(): HTMLInputElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(
        'input[matinput]',
      ) as NodeListOf<HTMLInputElement>,
    ).filter((e) => !e.closest('cadmus-mat-physical-size'));
  }

  function getTypeInput(): HTMLInputElement {
    return getOwnInputs()[0];
  }

  function getEidInput(): HTMLInputElement {
    return getOwnInputs()[2];
  }

  function getSaveButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector(
      'button[mattooltip="Accept changes"]',
    );
  }

  function typeInto(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function pressEnter(target: HTMLElement): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
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
    expect(component.form().invalid()).toBe(true);
    expect(!!component.form.type().getError('required')).toBe(true);
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
    expect(component.form.eid().value()).toBe('a1');
    expect(component.form.type().value()).toBe('main');
    expect(component.form.layout().value()).toBe('lines');
    expect(component.form.hasSize().value()).toBe(true);
    expect(component.form.size().value()).toEqual(createArea().size);
    expect(component.form.features().value()).toEqual(['ruling']);
    expect(component.form.hasFrame().value()).toBe(true);
    expect(component.form.frameType().value()).toBe('moulding');
    expect(component.form.frameDescription().value()).toBe('a frame');
    expect(component.form.note().value()).toBe('a note');
    expect(component.form().valid()).toBe(true);
    expect(component.form().dirty()).toBe(false);
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
    expect(component.form.eid().value()).toBe('');
    expect(component.form.type().value()).toBe('');
    expect(component.form.layout().value()).toBe('');
    expect(component.form.hasSize().value()).toBe(false);
    expect(component.form.size().value()).toBeNull();
    expect(component.form.features().value()).toEqual([]);
    expect(component.form.hasFrame().value()).toBe(false);
    expect(component.form.frameType().value()).toBe('');
    expect(component.form.frameDescription().value()).toBe('');
    expect(component.form.note().value()).toBe('');
    expect(
      fixture.nativeElement.querySelector('cadmus-mat-physical-size'),
    ).toBeNull();
  });

  it('should keep frame for an area with only a frame description', () => {
    setArea({ type: 'main', frameDescription: 'a frame' });
    expect(component.form.hasFrame().value()).toBe(true);
    expect(component.form.frameDescription().value()).toBe('a frame');
    // the frame type is now required
    expect(!!component.form.frameType().getError('required')).toBe(true);
    expect(component.form().invalid()).toBe(true);
  });

  it('should reset form when area is cleared', () => {
    setArea(createArea());
    setArea(undefined);
    expect(component.form.type().value()).toBe('');
    expect(component.form.hasSize().value()).toBe(false);
    expect(component.form.hasFrame().value()).toBe(false);
    expect(component.form.features().value()).toEqual([]);
  });

  it('should require frame type only when frame is checked', () => {
    setArea({ type: 'main' });
    expect(component.form().valid()).toBe(true);

    component.form.hasFrame().value.set(true);
    expect(!!component.form.frameType().getError('required')).toBe(true);
    expect(component.form().invalid()).toBe(true);

    component.form.frameType().value.set('moulding');
    expect(component.form().valid()).toBe(true);

    component.form.frameType().value.set('');
    expect(component.form().invalid()).toBe(true);
    component.form.hasFrame().value.set(false);
    expect(component.form.frameType().valid()).toBe(true);
    expect(component.form().valid()).toBe(true);
  });

  it('should update size and features', () => {
    const size = { h: { value: 3, unit: 'cm' } };
    component.onSizeChange(size);
    expect(component.form.size().value()).toEqual(size);
    expect(component.form.size().dirty()).toBe(true);

    component.onFeatCheckedIdsChange(['erasure']);
    expect(component.form.features().value()).toEqual(['erasure']);
    expect(component.form.features().dirty()).toBe(true);
  });

  it('should validate max lengths', () => {
    component.form.eid().value.set('x'.repeat(101));
    component.form.layout().value.set('x'.repeat(51));
    component.form.frameType().value.set('x'.repeat(51));
    component.form.frameDescription().value.set('x'.repeat(5001));
    component.form.note().value.set('x'.repeat(5001));
    expect(!!component.form.eid().getError('maxLength')).toBe(true);
    expect(!!component.form.layout().getError('maxLength')).toBe(true);
    expect(!!component.form.frameType().getError('maxLength')).toBe(true);
    expect(!!component.form.frameDescription().getError('maxLength')).toBe(true);
    expect(!!component.form.note().getError('maxLength')).toBe(true);
  });

  it('should show errors', () => {
    component.form.type().markAsTouched();
    component.form.hasFrame().value.set(true);
    component.form.frameType().markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['type required', 'frame type required']);

    for (const [field, len] of [
      [component.form.layout, 51],
      [component.form.eid, 101],
      [component.form.frameType, 51],
      [component.form.frameDescription, 5001],
      [component.form.note, 5001],
    ] as const) {
      field().value.set('x'.repeat(len));
      field().markAsTouched();
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
    component.form.hasFrame().value.set(true);
    component.form.frameType().markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toContain('frame type required');
  });

  it('should save edited area', () => {
    setArea(createArea());
    const spy = vi.fn();
    component.area.subscribe(spy);
    component.form.eid().value.set('a2');
    component.form.type().value.set(' side ');
    component.form.layout().value.set(' cols ');
    component.form.frameDescription().value.set(' frame ');
    component.form.note().value.set(' note ');
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
    component.form.hasSize().value.set(false);
    component.form.hasFrame().value.set(false);
    component.onFeatCheckedIdsChange([]);
    component.form.eid().value.set('');
    component.form.layout().value.set(' ');
    component.form.note().value.set('');
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

    component.form.type().value.set('main');
    component.form.hasFrame().value.set(true);
    component.save();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should save on save button click', () => {
    const spy = vi.fn();
    component.area.subscribe(spy);
    typeInto(getTypeInput(), 'main');
    const save = getSaveButton();
    expect(save.type).toBe('button');
    expect(save.disabled).toBe(false);
    save.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'main' }),
    );
  });

  it('should disable save when pristine or invalid', () => {
    setArea(createArea());
    expect(getSaveButton().disabled).toBe(true);
    typeInto(getTypeInput(), '');
    expect(component.form().dirty()).toBe(true);
    expect(getSaveButton().disabled).toBe(true);
  });

  it('should mark as touched when saving an invalid form', () => {
    component.save();
    expect(component.form.type().touched()).toBe(true);
  });

  it('should require frame type when the frame box is checked by the user', () => {
    setArea({ type: 'main' });
    const frameBox: HTMLInputElement = Array.from(
      fixture.nativeElement.querySelectorAll(
        'mat-checkbox input',
      ) as NodeListOf<HTMLInputElement>,
    )[1];
    frameBox.click();
    fixture.detectChanges();
    expect(component.form.hasFrame().value()).toBe(true);
    expect(component.form().invalid()).toBe(true);
    expect(getSaveButton().disabled).toBe(true);
  });

  it('should stay pristine when children emit the bound values', () => {
    setArea(createArea());
    component.onFeatCheckedIdsChange(['ruling']);
    // a normalized copy, as the autosaving size editor emits
    component.onSizeChange({
      w: { value: 10, unit: 'cm', tag: undefined },
      tag: undefined,
    });
    expect(component.form().dirty()).toBe(false);
  });

  it('should not adopt the size of the bound area', () => {
    const area = createArea();
    setArea(area);
    expect(component.form.size().value()).not.toBe(area.size);
    component.onSizeChange({ w: { value: 20, unit: 'cm' } });
    component.save();
    expect(area.size).toEqual({ w: { value: 10, unit: 'cm' } });
  });

  it('should keep an in-progress edit when its own save echoes back normalized', () => {
    setArea(createArea());
    const input = getEidInput();
    typeInto(input, 'abc ');
    component.save();
    fixture.detectChanges();

    expect(component.area()?.eid).toBe('abc');
    expect(component.form.eid().value()).toBe('abc ');
    typeInto(input, component.form.eid().value() + 'd');
    expect(component.form.eid().value()).toBe('abc d');
  });

  it('should rebuild the draft and clear dirty state on a new area', () => {
    setArea(createArea());
    typeInto(getEidInput(), 'xyz');
    expect(component.form().dirty()).toBe(true);
    setArea({ type: 'side' });
    expect(component.form.eid().value()).toBe('');
    expect(component.form.type().value()).toBe('side');
    expect(component.form().dirty()).toBe(false);
  });

  it('should save on Enter in a text input only when valid and dirty', () => {
    setArea(createArea());
    const spy = vi.fn();
    component.area.subscribe(spy);
    const input = getEidInput();

    pressEnter(input);
    expect(spy).not.toHaveBeenCalled();

    typeInto(input, 'a9');
    const event = pressEnter(input);
    expect(event.defaultPrevented).toBe(true);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ eid: 'a9' }));
  });

  it('should not save on Enter in the note textarea', () => {
    setArea(createArea());
    typeInto(getEidInput(), 'a9');
    const spy = vi.fn();
    component.area.subscribe(spy);
    const textarea: HTMLTextAreaElement = Array.from(
      fixture.nativeElement.querySelectorAll(
        'textarea',
      ) as NodeListOf<HTMLTextAreaElement>,
    ).pop()!;
    const event = pressEnter(textarea);
    expect(event.defaultPrevented).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should render no <form>', () => {
    setArea(createArea());
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('should emit cancel on dismiss', () => {
    const spy = vi.fn();
    component.cancel.subscribe(spy);
    (
      fixture.nativeElement.querySelector(
        'button[mattooltip="Discard changes"]',
      ) as HTMLButtonElement
    ).click();
    expect(spy).toHaveBeenCalled();
  });
});
