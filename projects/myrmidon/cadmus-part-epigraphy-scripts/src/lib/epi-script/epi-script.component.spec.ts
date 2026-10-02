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
    expect(component.form.invalid).toBe(true);
    expect(component.scriptCtl.hasError('required')).toBe(true);
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

  it('should update form from script model', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();

    expect(component.system.value).toBe('lat');
    expect(component.scriptCtl.value).toBe('cap');
    expect(component.casing.value).toBe('upper');
    expect(component.features.value).toEqual(['serif']);
    expect(component.note.value).toBe('a note');
    expect(component.form.valid).toBe(true);
    expect(component.form.pristine).toBe(true);
  });

  it('should map missing script values to defaults', () => {
    fixture.componentRef.setInput('script', { script: '' });
    fixture.detectChanges();

    expect(component.system.value).toBeNull();
    expect(component.scriptCtl.value).toBe('');
    expect(component.casing.value).toBeNull();
    expect(component.features.value).toEqual([]);
    expect(component.note.value).toBeNull();
  });

  it('should reset form when script is cleared', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();
    fixture.componentRef.setInput('script', undefined);
    fixture.detectChanges();

    expect(component.system.value).toBeNull();
    expect(component.scriptCtl.value).toBe('');
    expect(component.features.value).toEqual([]);
  });

  it('should update features from flags', () => {
    component.onFeatIdsChange(['serif', 'ligature']);
    expect(component.features.value).toEqual(['serif', 'ligature']);
    expect(component.features.dirty).toBe(true);
  });

  it('should validate max lengths', () => {
    component.system.setValue('x'.repeat(51));
    component.scriptCtl.setValue('x'.repeat(51));
    component.casing.setValue('x'.repeat(51));
    component.note.setValue('x'.repeat(5001));
    expect(component.system.hasError('maxlength')).toBe(true);
    expect(component.scriptCtl.hasError('maxlength')).toBe(true);
    expect(component.casing.hasError('maxlength')).toBe(true);
    expect(component.note.hasError('maxlength')).toBe(true);
  });

  it('should show required script error', () => {
    component.scriptCtl.markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['script required']);
  });

  it('should show too long errors', () => {
    for (const ctl of [
      component.system,
      component.scriptCtl,
      component.casing,
    ]) {
      ctl.setValue('x'.repeat(51));
      ctl.markAsTouched();
    }
    component.note.setValue('x'.repeat(5001));
    component.note.markAsTouched();
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

    component.system.setValue('grc');
    component.scriptCtl.setValue('unc');
    component.casing.setValue('lower');
    component.onFeatIdsChange(['ligature']);
    component.note.setValue('new note');
    component.save();

    expect(spy).toHaveBeenCalledWith({
      system: 'grc',
      script: 'unc',
      casing: 'lower',
      features: ['ligature'],
      note: 'new note',
    });
  });

  it('should save empty optional values as undefined', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();
    const spy = vi.fn();
    component.script.subscribe(spy);

    component.system.setValue(null);
    component.casing.setValue('');
    component.onFeatIdsChange([]);
    component.note.setValue(null);
    component.save();

    expect(spy).toHaveBeenCalledWith({
      system: undefined,
      script: 'cap',
      casing: undefined,
      features: undefined,
      note: undefined,
    });
  });

  it('should not save when invalid', () => {
    const spy = vi.fn();
    component.script.subscribe(spy);
    component.save();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should save on submit button click', () => {
    const spy = vi.fn();
    component.script.subscribe(spy);
    const input: HTMLInputElement =
      fixture.nativeElement.querySelectorAll('input')[1];
    input.value = 'cap';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submit: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    );
    expect(submit.disabled).toBe(false);
    submit.click();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ script: 'cap' }),
    );
  });

  it('should disable submit when pristine', () => {
    fixture.componentRef.setInput('script', createScript());
    fixture.detectChanges();
    const submit: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    );
    expect(submit.disabled).toBe(true);
  });

  it('should emit scriptCancel on cancel', () => {
    const spy = vi.fn();
    component.scriptCancel.subscribe(spy);
    const cancel: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[type="button"]',
    );
    cancel.click();
    expect(spy).toHaveBeenCalled();
  });
});
