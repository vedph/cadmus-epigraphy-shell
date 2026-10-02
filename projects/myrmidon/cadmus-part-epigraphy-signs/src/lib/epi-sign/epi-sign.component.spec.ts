import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxMonacoEditorComponent } from '@jean-merelis/ngx-monaco-editor';
import {
  NgxMonacoEditorFakeComponent,
  provideMockMonacoEditor,
} from '@jean-merelis/ngx-monaco-editor/testing';
import { CADMUS_TEXT_ED_BINDINGS_TOKEN } from '@myrmidon/cadmus-text-ed';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { EpiSign } from '../epi-signs-part';
import { EpiSignComponent } from './epi-sign.component';

const FEATURES: ThesaurusEntry[] = [
  { id: 'serif', value: 'serif' },
  { id: 'hedera', value: 'hedera' },
];
const UNITS: ThesaurusEntry[] = [
  { id: 'cm', value: 'cm' },
  { id: 'mm', value: 'mm' },
];

function createSign(): EpiSign {
  return {
    id: 'a',
    features: ['serif'],
    description: 'A sign',
    measurements: [{ name: 'height', value: 3, unit: 'cm' }],
  };
}

const SELECTION = {
  startLineNumber: 1,
  startColumn: 1,
  endLineNumber: 1,
  endColumn: 4,
};

interface FakeEditor {
  focus: ReturnType<typeof vi.fn>;
  addCommand: ReturnType<typeof vi.fn>;
  getSelection: () => typeof SELECTION;
  getModel: () => { getValueInRange: () => string };
  executeEdits: ReturnType<typeof vi.fn>;
}

function createFakeEditor(): FakeEditor {
  return {
    focus: vi.fn(),
    addCommand: vi.fn(),
    getSelection: () => SELECTION,
    getModel: () => ({ getValueInRange: () => 'abc' }),
    executeEdits: vi.fn(),
  };
}

describe('EpiSignComponent', () => {
  let component: EpiSignComponent;
  let fixture: ComponentFixture<EpiSignComponent>;
  let editor: FakeEditor;

  async function setup(bindings?: { [key: string]: string }): Promise<void> {
    editor = createFakeEditor();
    await TestBed.configureTestingModule({
      imports: [EpiSignComponent],
      providers: [
        provideMockMonacoEditor({
          initializedEvent: { editor: editor as any, monaco: {} as any },
        }),
        ...(bindings
          ? [{ provide: CADMUS_TEXT_ED_BINDINGS_TOKEN, useValue: bindings }]
          : []),
      ],
    })
      .overrideComponent(EpiSignComponent, {
        remove: { imports: [NgxMonacoEditorComponent] },
        add: { imports: [NgxMonacoEditorFakeComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EpiSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function getErrors(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(
        'mat-error',
      ) as NodeListOf<HTMLElement>,
    ).map((e) => e.textContent!.trim());
  }

  describe('without bindings', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should create with an invalid empty form', () => {
      expect(component).toBeTruthy();
      expect(component.form.invalid).toBe(true);
      expect(component.id.hasError('required')).toBe(true);
      expect(component.featFlags()).toEqual([]);
    });

    it('should focus editor on init without adding commands', () => {
      expect(editor.focus).toHaveBeenCalled();
      expect(editor.addCommand).not.toHaveBeenCalled();
    });

    it('should map feature entries to flags', () => {
      fixture.componentRef.setInput('featEntries', FEATURES);
      fixture.detectChanges();
      expect(component.featFlags()).toEqual([
        { id: 'serif', label: 'serif' },
        { id: 'hedera', label: 'hedera' },
      ]);
      expect(fixture.nativeElement.querySelectorAll('mat-checkbox').length).toBe(
        2,
      );
    });

    it('should update form from sign model', () => {
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();

      expect(component.id.value).toBe('a');
      expect(component.features.value).toEqual(['serif']);
      expect(component.description.value).toBe('A sign');
      expect(component.measurements.value).toEqual(createSign().measurements);
      expect(component.form.valid).toBe(true);
      expect(component.form.pristine).toBe(true);
    });

    it('should show description in the editor', async () => {
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();
      await fixture.whenStable();
      const textarea: HTMLTextAreaElement =
        fixture.nativeElement.querySelector('ngx-monaco-editor textarea');
      expect(textarea.value).toBe('A sign');
    });

    it('should map missing sign values to defaults', () => {
      fixture.componentRef.setInput('sign', { id: '' });
      fixture.detectChanges();
      expect(component.id.value).toBe('');
      expect(component.features.value).toEqual([]);
      expect(component.description.value).toBeNull();
      expect(component.measurements.value).toEqual([]);
    });

    it('should reset form when sign is cleared', () => {
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();
      fixture.componentRef.setInput('sign', undefined);
      fixture.detectChanges();
      expect(component.id.value).toBe('');
      expect(component.features.value).toEqual([]);
      expect(component.description.value).toBeNull();
      expect(component.measurements.value).toEqual([]);
    });

    it('should update features from flags', () => {
      component.onFeatIdsChange(['hedera']);
      expect(component.features.value).toEqual(['hedera']);
      expect(component.features.dirty).toBe(true);
    });

    it('should update measurements', () => {
      const measurements = [{ name: 'width', value: 2, unit: 'mm' }];
      component.onMeasurementsChange(measurements);
      expect(component.measurements.value).toEqual(measurements);
      expect(component.measurements.dirty).toBe(true);
    });

    it('should pass inputs to measurements set', () => {
      fixture.componentRef.setInput('measUnitEntries', UNITS);
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();
      const set = fixture.nativeElement.querySelector(
        'cadmus-mat-physical-measurement-set',
      );
      expect(set).toBeTruthy();
    });

    it('should validate max lengths', () => {
      component.id.setValue('x'.repeat(101));
      expect(component.id.hasError('maxlength')).toBe(true);
      component.description.setValue('x'.repeat(10001));
      expect(component.description.hasError('maxlength')).toBe(true);
    });

    it('should show ID errors', () => {
      component.id.markAsTouched();
      fixture.detectChanges();
      expect(getErrors()).toEqual(['ID required']);

      component.id.setValue('x'.repeat(101));
      fixture.detectChanges();
      expect(getErrors()).toEqual(['ID too long']);
    });

    it('should save edited sign', () => {
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();
      const spy = vi.fn();
      component.sign.subscribe(spy);

      component.id.setValue(' b ');
      component.onFeatIdsChange(['hedera']);
      component.description.setValue(' desc ');
      component.save();

      expect(spy).toHaveBeenCalledWith({
        id: 'b',
        features: ['hedera'],
        description: 'desc',
        measurements: createSign().measurements,
      });
    });

    it('should save empty optional values as undefined', () => {
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();
      const spy = vi.fn();
      component.sign.subscribe(spy);

      component.onFeatIdsChange([]);
      component.onMeasurementsChange([]);
      component.description.setValue('  ');
      component.save();

      expect(spy).toHaveBeenCalledWith({
        id: 'a',
        features: undefined,
        description: undefined,
        measurements: undefined,
      });
    });

    it('should not save when invalid', () => {
      const spy = vi.fn();
      component.sign.subscribe(spy);
      component.save();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should save on submit', () => {
      const spy = vi.fn();
      component.sign.subscribe(spy);
      const input: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      input.value = 'z';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const submit: HTMLButtonElement = fixture.nativeElement.querySelector(
        'button[type="submit"]',
      );
      expect(submit.disabled).toBe(false);
      submit.click();
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: 'z' }));
    });

    it('should emit signCancel on cancel', () => {
      const spy = vi.fn();
      component.signCancel.subscribe(spy);
      component.cancel();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('with bindings', () => {
    beforeEach(async () => {
      await setup({ '2080': 'md.bold' });
    });

    it('should add a command for each binding', () => {
      expect(editor.addCommand).toHaveBeenCalledTimes(1);
      expect(editor.addCommand.mock.calls[0][0]).toBe(2080);
    });

    it('should apply edit to selected text when command is run', async () => {
      // no plugin is registered, so the text is returned unchanged
      const command = editor.addCommand.mock.calls[0][1] as () => void;
      command();
      await vi.waitFor(() => expect(editor.executeEdits).toHaveBeenCalled());
      expect(editor.executeEdits).toHaveBeenCalledWith('my-source', [
        {
          range: SELECTION,
          text: 'abc',
          forceMoveMarkers: true,
        },
      ]);
    });
  });
});
