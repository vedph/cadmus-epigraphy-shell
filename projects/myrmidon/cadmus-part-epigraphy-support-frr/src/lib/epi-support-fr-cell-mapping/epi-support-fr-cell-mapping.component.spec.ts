import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiSupportFrCellMapping } from '../epi-support-frr-part';
import { EpiSupportFrCellMappingComponent } from './epi-support-fr-cell-mapping.component';

function createMapping(): EpiSupportFrCellMapping {
  return {
    location: 'A1',
    headText: 'dis',
    headTextLoc: '1.1',
    tailText: 'sacrum',
    tailTextLoc: '1.3',
  };
}

describe('EpiSupportFrCellMappingComponent', () => {
  let component: EpiSupportFrCellMappingComponent;
  let fixture: ComponentFixture<EpiSupportFrCellMappingComponent>;

  function getErrors(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(
        'mat-error',
      ) as NodeListOf<HTMLElement>,
    ).map((e) => e.textContent!.trim());
  }

  function setMapping(mapping?: EpiSupportFrCellMapping): void {
    fixture.componentRef.setInput('mapping', mapping);
    fixture.detectChanges();
  }

  // inputs: location, head loc., head text, tail loc., tail text
  function getInput(index: number): HTMLInputElement {
    return fixture.nativeElement.querySelectorAll('input')[index];
  }

  function getSaveButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector(
      'button[mattooltip="Save mapping"]',
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
      imports: [EpiSupportFrCellMappingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EpiSupportFrCellMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with an invalid empty form', () => {
    expect(component).toBeTruthy();
    expect(component.form().invalid()).toBe(true);
    expect(!!component.form.location().getError('required')).toBe(true);
  });

  it('should update form from mapping', () => {
    setMapping(createMapping());
    expect(component.form.location().value()).toBe('A1');
    expect(component.form.headText().value()).toBe('dis');
    expect(component.form.headTextLoc().value()).toBe('1.1');
    expect(component.form.tailText().value()).toBe('sacrum');
    expect(component.form.tailTextLoc().value()).toBe('1.3');
    expect(component.form().valid()).toBe(true);
    expect(component.form().dirty()).toBe(false);
  });

  it('should map missing optional values to empty strings', () => {
    setMapping({ location: 'B2' });
    expect(component.form.headText().value()).toBe('');
    expect(component.form.headTextLoc().value()).toBe('');
    expect(component.form.tailText().value()).toBe('');
    expect(component.form.tailTextLoc().value()).toBe('');
  });

  it('should reset form when mapping is cleared', () => {
    setMapping(createMapping());
    setMapping(undefined);
    expect(component.form.location().value()).toBe('');
    expect(component.form.headText().value()).toBe('');
  });

  it('should validate max lengths', () => {
    component.form.location().value.set('x'.repeat(301));
    component.form.headText().value.set('x'.repeat(501));
    component.form.headTextLoc().value.set('x'.repeat(101));
    component.form.tailText().value.set('x'.repeat(501));
    component.form.tailTextLoc().value.set('x'.repeat(101));
    expect(!!component.form.location().getError('maxLength')).toBe(true);
    expect(!!component.form.headText().getError('maxLength')).toBe(true);
    expect(!!component.form.headTextLoc().getError('maxLength')).toBe(true);
    expect(!!component.form.tailText().getError('maxLength')).toBe(true);
    expect(!!component.form.tailTextLoc().getError('maxLength')).toBe(true);
  });

  it('should show errors', () => {
    component.form.location().markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['location required']);

    for (const [field, len] of [
      [component.form.location, 301],
      [component.form.headTextLoc, 101],
      [component.form.headText, 501],
      [component.form.tailTextLoc, 101],
      [component.form.tailText, 501],
    ] as const) {
      field().value.set('x'.repeat(len));
      field().markAsTouched();
    }
    fixture.detectChanges();
    expect(getErrors()).toEqual([
      'location too long',
      'head loc. too long',
      'head text too long',
      'tail loc. too long',
      'tail text too long',
    ]);
  });

  it('should save trimmed mapping', () => {
    setMapping(createMapping());
    const spy = vi.fn();
    component.mapping.subscribe(spy);
    component.form.location().value.set(' B1 ');
    component.form.headText().value.set(' manibus ');
    component.save();
    expect(spy).toHaveBeenCalledWith({
      location: 'B1',
      headText: 'manibus',
      headTextLoc: '1.1',
      tailText: 'sacrum',
      tailTextLoc: '1.3',
    });
  });

  it('should save empty optional values as undefined', () => {
    setMapping(createMapping());
    const spy = vi.fn();
    component.mapping.subscribe(spy);
    component.form.headText().value.set(' ');
    component.form.headTextLoc().value.set('');
    component.form.tailText().value.set('');
    component.form.tailTextLoc().value.set('');
    component.save();
    expect(spy).toHaveBeenCalledWith({
      location: 'A1',
      headText: undefined,
      headTextLoc: undefined,
      tailText: undefined,
      tailTextLoc: undefined,
    });
  });

  it('should not save when invalid', () => {
    const spy = vi.fn();
    component.mapping.subscribe(spy);
    component.save();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should save on save button click', () => {
    const spy = vi.fn();
    component.mapping.subscribe(spy);
    typeInto(getInput(0), 'C3');
    const save = getSaveButton();
    expect(save.type).toBe('button');
    expect(save.disabled).toBe(false);
    save.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ location: 'C3' }),
    );
  });

  it('should disable save when pristine or invalid', () => {
    setMapping(createMapping());
    expect(getSaveButton().disabled).toBe(true);
    typeInto(getInput(0), '');
    expect(component.form().dirty()).toBe(true);
    expect(getSaveButton().disabled).toBe(true);
  });

  it('should mark as touched when saving an invalid form', () => {
    component.save();
    expect(component.form.location().touched()).toBe(true);
  });

  it('should keep an in-progress edit when its own save echoes back normalized', () => {
    setMapping(createMapping());
    const input = getInput(2);
    typeInto(input, 'abc ');
    component.save();
    fixture.detectChanges();

    expect(component.mapping()?.headText).toBe('abc');
    expect(component.form.headText().value()).toBe('abc ');
    typeInto(input, component.form.headText().value() + 'd');
    expect(component.form.headText().value()).toBe('abc d');
  });

  it('should rebuild the draft and clear dirty state on a new mapping', () => {
    setMapping(createMapping());
    typeInto(getInput(0), 'Z9');
    expect(component.form().dirty()).toBe(true);
    setMapping({ location: 'B2' });
    expect(component.form.location().value()).toBe('B2');
    expect(component.form().dirty()).toBe(false);
  });

  it('should save on Enter only when valid and dirty', () => {
    setMapping(createMapping());
    const spy = vi.fn();
    component.mapping.subscribe(spy);
    const input = getInput(0);

    // pristine
    let event = pressEnter(input);
    expect(event.defaultPrevented).toBe(true);
    expect(spy).not.toHaveBeenCalled();

    // invalid
    typeInto(input, '');
    pressEnter(input);
    expect(spy).not.toHaveBeenCalled();

    typeInto(input, 'C3');
    event = pressEnter(input);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ location: 'C3' }),
    );
  });

  it('should render no <form>', () => {
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('should emit mappingCancel on cancel', () => {
    const spy = vi.fn();
    component.mappingCancel.subscribe(spy);
    (
      fixture.nativeElement.querySelector(
        'button[mattooltip="Close mapping"]',
      ) as HTMLButtonElement
    ).click();
    expect(spy).toHaveBeenCalled();
  });
});
