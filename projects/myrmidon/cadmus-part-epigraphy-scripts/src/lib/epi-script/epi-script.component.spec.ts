import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { EpiScript } from '../epi-scripts-part';
import { EpiScriptComponent } from './epi-script.component';

const SYSTEMS: ThesaurusEntry[] = [
  { id: 'lat', value: 'Latin' },
  { id: 'grc', value: 'Greek' },
];
const SCRIPTS: ThesaurusEntry[] = [
  { id: 'cap', value: 'capitalis' },
  { id: 'unc', value: 'uncialis' },
];
const CASINGS: ThesaurusEntry[] = [
  { id: 'upper', value: 'upper' },
  { id: 'lower', value: 'lower' },
];
const FEATURES: ThesaurusEntry[] = [
  { id: 'serif', value: 'serif' },
  { id: 'ligature', value: 'ligature' },
];

function createScript(): EpiScript {
  return {
    system: 'lat',
    script: 'cap',
    casing: 'upper',
    features: ['serif'],
    note: 'a note',
  };
}

describe('EpiScriptComponent', () => {
  let component: EpiScriptComponent;
  let fixture: ComponentFixture<EpiScriptComponent>;

  function getErrors(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(
        'mat-error',
      ) as NodeListOf<HTMLElement>,
    ).map((e) => e.textContent!.trim());
  }

  function setThesauri(): void {
    fixture.componentRef.setInput('systemEntries', SYSTEMS);
    fixture.componentRef.setInput('scriptEntries', SCRIPTS);
    fixture.componentRef.setInput('casingEntries', CASINGS);
    fixture.componentRef.setInput('featEntries', FEATURES);
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
      imports: [EpiScriptComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EpiScriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with an invalid empty form', () => {
    expect(component).toBeTruthy();
    expect(component.form().invalid()).toBe(true);
    expect(component.form.script().getError('required')).toBeTruthy();
    expect(component.featFlags()).toEqual([]);
  });

  it('should use free text inputs without thesauri', () => {
    expect(fixture.nativeElement.querySelectorAll('mat-select').length).toBe(0);
    // system, script, casing
    expect(fixture.nativeElement.querySelectorAll('input').length).toBe(3);
    expect(fixture.nativeElement.querySelector('cadmus-ui-flag-set')).toBeNull();
  });

  it('should use selects and flags with thesauri', () => {
    setThesauri();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('mat-select').length).toBe(3);
    expect(
      fixture.nativeElement.querySelector('cadmus-ui-flag-set'),
    ).toBeTruthy();
    expect(component.featFlags()).toEqual([
      { id: 'serif', label: 'serif' },
      { id: 'ligature', label: 'ligature' },
    ]);
  });

  it('should update form from script model, staying pristine', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();

    expect(component.form.system().value()).toBe('lat');
    expect(component.form.script().value()).toBe('cap');
    expect(component.form.casing().value()).toBe('upper');
    expect(component.form.features().value()).toEqual(['serif']);
    expect(component.form.note().value()).toBe('a note');
    expect(component.form().valid()).toBe(true);
    expect(component.form().dirty()).toBe(false);
  });

  it('should map missing script values to defaults', () => {
    fixture.componentRef.setInput('script', { script: '' });
    fixture.detectChanges();

    expect(component.form.system().value()).toBe('');
    expect(component.form.script().value()).toBe('');
    expect(component.form.casing().value()).toBe('');
    expect(component.form.features().value()).toEqual([]);
    expect(component.form.note().value()).toBe('');
  });

  it('should reset form when script is cleared', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();
    fixture.componentRef.setInput('script', undefined);
    fixture.detectChanges();

    expect(component.form.system().value()).toBe('');
    expect(component.form.script().value()).toBe('');
    expect(component.form.features().value()).toEqual([]);
  });

  it('should rebuild the draft and clear dirty state on a new script', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();
    typeInto(fixture.nativeElement.querySelectorAll('input')[0], 'xyz');
    expect(component.form().dirty()).toBe(true);

    fixture.componentRef.setInput('script', { script: 'unc' });
    fixture.detectChanges();

    expect(component.form.system().value()).toBe('');
    expect(component.form.script().value()).toBe('unc');
    expect(component.form().dirty()).toBe(false);
  });

  it('should stay dirty while typing', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelectorAll('input')[0];
    typeInto(input, 'l');
    typeInto(input, 'la');
    fixture.detectChanges();
    expect(component.form().dirty()).toBe(true);
    expect(getSaveButton().disabled).toBe(false);
  });

  it('should not adopt the features array of the bound script', () => {
    const script = createScript();
    fixture.componentRef.setInput('script', script);
    fixture.detectChanges();
    component.onFeatIdsChange(['ligature']);
    component.save();
    expect(script.features).toEqual(['serif']);
  });

  it('should update features from flags', () => {
    component.onFeatIdsChange(['serif', 'ligature']);
    expect(component.form.features().value()).toEqual(['serif', 'ligature']);
    expect(component.form.features().dirty()).toBe(true);
  });

  it('should stay pristine when flags emit the bound features', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();
    component.onFeatIdsChange(['serif']);
    expect(component.form().dirty()).toBe(false);
  });

  it('should validate max lengths', () => {
    component.form.system().value.set('x'.repeat(51));
    component.form.script().value.set('x'.repeat(51));
    component.form.casing().value.set('x'.repeat(51));
    component.form.note().value.set('x'.repeat(5001));
    expect(component.form.system().getError('maxLength')).toBeTruthy();
    expect(component.form.script().getError('maxLength')).toBeTruthy();
    expect(component.form.casing().getError('maxLength')).toBeTruthy();
    expect(component.form.note().getError('maxLength')).toBeTruthy();
  });

  it('should show required script error', () => {
    component.form.script().markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['script required']);
  });

  it('should show too long errors', () => {
    for (const field of [
      component.form.system,
      component.form.script,
      component.form.casing,
    ]) {
      field().value.set('x'.repeat(51));
      field().markAsTouched();
    }
    component.form.note().value.set('x'.repeat(5001));
    component.form.note().markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual([
      'system too long',
      'script too long',
      'casing too long',
      'note too long',
    ]);
  });

  it('should save edited script', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();
    const spy = vi.fn();
    component.script.subscribe(spy);

    component.form.system().value.set('grc');
    component.form.script().value.set('unc');
    component.form.casing().value.set('lower');
    component.onFeatIdsChange(['ligature']);
    component.form.note().value.set('new note');
    component.save();

    expect(spy).toHaveBeenCalledWith({
      system: 'grc',
      script: 'unc',
      casing: 'lower',
      features: ['ligature'],
      note: 'new note',
    });
    expect(component.form().dirty()).toBe(false);
  });

  it('should save trimmed values, and empty optional values as undefined', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();
    const spy = vi.fn();
    component.script.subscribe(spy);

    component.form.system().value.set('');
    component.form.script().value.set(' cap ');
    component.form.casing().value.set('  ');
    component.onFeatIdsChange([]);
    component.form.note().value.set('');
    component.save();

    expect(spy).toHaveBeenCalledWith({
      system: undefined,
      script: 'cap',
      casing: undefined,
      features: undefined,
      note: undefined,
    });
  });

  it('should keep an in-progress edit when its own save echoes back normalized', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelectorAll('input')[0];
    typeInto(input, 'abc ');
    component.save();
    fixture.detectChanges();

    // the model got the trimmed value...
    expect(component.script()?.system).toBe('abc');
    // ...but the draft still holds what the user typed
    expect(component.form.system().value()).toBe('abc ');

    // so continuing to type yields "abc d", not "abcd"
    typeInto(input, component.form.system().value() + 'd');
    expect(component.form.system().value()).toBe('abc d');
  });

  it('should not save when invalid, and mark it as touched', () => {
    const spy = vi.fn();
    component.script.subscribe(spy);
    component.save();
    expect(spy).not.toHaveBeenCalled();
    expect(component.form.script().touched()).toBe(true);
  });

  it('should save on save button click', () => {
    const spy = vi.fn();
    component.script.subscribe(spy);
    typeInto(fixture.nativeElement.querySelectorAll('input')[1], 'cap');

    const save = getSaveButton();
    expect(save.type).toBe('button');
    expect(save.disabled).toBe(false);
    save.click();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ script: 'cap' }),
    );
  });

  it('should disable save when pristine', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();
    expect(getSaveButton().disabled).toBe(true);
  });

  it('should disable save when invalid', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();
    typeInto(fixture.nativeElement.querySelectorAll('input')[1], '');
    expect(component.form().dirty()).toBe(true);
    expect(getSaveButton().disabled).toBe(true);
  });

  it('should save on Enter in a text input when valid and dirty', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();
    const spy = vi.fn();
    component.script.subscribe(spy);
    const input: HTMLInputElement =
      fixture.nativeElement.querySelectorAll('input')[0];
    typeInto(input, 'grc');

    const event = pressEnter(input);

    expect(event.defaultPrevented).toBe(true);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ system: 'grc' }),
    );
  });

  it('should not save on Enter when pristine or invalid', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();
    const spy = vi.fn();
    component.script.subscribe(spy);
    const inputs: NodeListOf<HTMLInputElement> =
      fixture.nativeElement.querySelectorAll('input');

    // pristine
    pressEnter(inputs[0]);
    // invalid
    typeInto(inputs[1], '');
    pressEnter(inputs[1]);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not save on Enter in the note textarea', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();
    const spy = vi.fn();
    component.script.subscribe(spy);
    const textarea: HTMLTextAreaElement =
      fixture.nativeElement.querySelector('textarea');
    textarea.value = 'line';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const event = pressEnter(textarea);

    expect(event.defaultPrevented).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should render no <form>', () => {
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('should emit scriptCancel on cancel', () => {
    const spy = vi.fn();
    component.scriptCancel.subscribe(spy);
    const cancel: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[mattooltip="Discard changes"]',
    );
    cancel.click();
    expect(spy).toHaveBeenCalled();
  });
});
