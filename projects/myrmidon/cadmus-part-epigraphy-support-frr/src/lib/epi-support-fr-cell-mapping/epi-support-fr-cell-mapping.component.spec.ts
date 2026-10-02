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
    expect(component.form.invalid).toBe(true);
    expect(component.location.hasError('required')).toBe(true);
  });

  it('should update form from mapping', () => {
    setMapping(createMapping());
    expect(component.location.value).toBe('A1');
    expect(component.headText.value).toBe('dis');
    expect(component.headTextLoc.value).toBe('1.1');
    expect(component.tailText.value).toBe('sacrum');
    expect(component.tailTextLoc.value).toBe('1.3');
    expect(component.form.valid).toBe(true);
    expect(component.form.pristine).toBe(true);
  });

  it('should map missing optional values to null', () => {
    setMapping({ location: 'B2' });
    expect(component.headText.value).toBeNull();
    expect(component.headTextLoc.value).toBeNull();
    expect(component.tailText.value).toBeNull();
    expect(component.tailTextLoc.value).toBeNull();
  });

  it('should reset form when mapping is cleared', () => {
    setMapping(createMapping());
    setMapping(undefined);
    expect(component.location.value).toBe('');
    expect(component.headText.value).toBeNull();
  });

  it('should validate max lengths', () => {
    component.location.setValue('x'.repeat(301));
    component.headText.setValue('x'.repeat(501));
    component.headTextLoc.setValue('x'.repeat(101));
    component.tailText.setValue('x'.repeat(501));
    component.tailTextLoc.setValue('x'.repeat(101));
    expect(component.location.hasError('maxlength')).toBe(true);
    expect(component.headText.hasError('maxlength')).toBe(true);
    expect(component.headTextLoc.hasError('maxlength')).toBe(true);
    expect(component.tailText.hasError('maxlength')).toBe(true);
    expect(component.tailTextLoc.hasError('maxlength')).toBe(true);
  });

  it('should show errors', () => {
    component.location.markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['location required']);

    for (const [ctl, len] of [
      [component.location, 301],
      [component.headTextLoc, 101],
      [component.headText, 501],
      [component.tailTextLoc, 101],
      [component.tailText, 501],
    ] as const) {
      ctl.setValue('x'.repeat(len));
      ctl.markAsTouched();
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
    component.location.setValue(' B1 ');
    component.headText.setValue(' manibus ');
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
    component.headText.setValue(' ');
    component.headTextLoc.setValue(null);
    component.tailText.setValue('');
    component.tailTextLoc.setValue(null);
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

  it('should save on submit', () => {
    const spy = vi.fn();
    component.mapping.subscribe(spy);
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'C3';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const submit: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    );
    expect(submit.disabled).toBe(false);
    submit.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ location: 'C3' }),
    );
  });

  it('should emit mappingCancel on cancel', () => {
    const spy = vi.fn();
    component.mappingCancel.subscribe(spy);
    (
      fixture.nativeElement.querySelector(
        'button[type="button"]',
      ) as HTMLButtonElement
    ).click();
    expect(spy).toHaveBeenCalled();
  });
});
