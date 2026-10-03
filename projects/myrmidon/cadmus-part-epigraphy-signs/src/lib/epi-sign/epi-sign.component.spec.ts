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

// the form tags the objects in its arrays with an identity Symbol:
// compare their plain data only
function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

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

  function getIdInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[matInput]');
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

  describe('without bindings', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should create with an invalid empty form', () => {
      expect(component).toBeTruthy();
      expect(component.form().invalid()).toBe(true);
      expect(!!component.form.id().getError('required')).toBe(true);
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

      expect(component.form.id().value()).toBe('a');
      expect(component.form.features().value()).toEqual(['serif']);
      expect(component.form.description().value()).toBe('A sign');
      expect(plain(component.form.measurements().value())).toEqual(createSign().measurements);
      expect(component.form().valid()).toBe(true);
      expect(component.form().dirty()).toBe(false);
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
      expect(component.form.id().value()).toBe('');
      expect(component.form.features().value()).toEqual([]);
      expect(component.form.description().value()).toBe('');
      expect(plain(component.form.measurements().value())).toEqual([]);
    });

    it('should reset form when sign is cleared', () => {
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();
      fixture.componentRef.setInput('sign', undefined);
      fixture.detectChanges();
      expect(component.form.id().value()).toBe('');
      expect(component.form.features().value()).toEqual([]);
      expect(component.form.description().value()).toBe('');
      expect(plain(component.form.measurements().value())).toEqual([]);
    });

    it('should update features from flags', () => {
      component.onFeatIdsChange(['hedera']);
      expect(component.form.features().value()).toEqual(['hedera']);
      expect(component.form.features().dirty()).toBe(true);
    });

    it('should update measurements', () => {
      const measurements = [{ name: 'width', value: 2, unit: 'mm' }];
      component.onMeasurementsChange(measurements);
      expect(plain(component.form.measurements().value())).toEqual(measurements);
      expect(component.form.measurements().dirty()).toBe(true);
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
      component.form.id().value.set('x'.repeat(101));
      expect(!!component.form.id().getError('maxLength')).toBe(true);
      component.form.description().value.set('x'.repeat(10001));
      expect(!!component.form.description().getError('maxLength')).toBe(true);
    });

    it('should show ID errors', () => {
      component.form.id().markAsTouched();
      fixture.detectChanges();
      expect(getErrors()).toEqual(['ID required']);

      component.form.id().value.set('x'.repeat(101));
      fixture.detectChanges();
      expect(getErrors()).toEqual(['ID too long']);
    });

    it('should save edited sign', () => {
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();
      const spy = vi.fn();
      component.sign.subscribe(spy);

      component.form.id().value.set(' b ');
      component.onFeatIdsChange(['hedera']);
      component.form.description().value.set(' desc ');
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
      component.form.description().value.set('  ');
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

    it('should save on save button click', () => {
      const spy = vi.fn();
      component.sign.subscribe(spy);
      typeInto(getIdInput(), 'z');

      const save = getSaveButton();
      expect(save.type).toBe('button');
      expect(save.disabled).toBe(false);
      save.click();
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: 'z' }));
    });

    it('should disable save when pristine', () => {
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();
      expect(getSaveButton().disabled).toBe(true);
    });

    it('should mark as touched when saving an invalid form', () => {
      component.save();
      expect(component.form.id().touched()).toBe(true);
    });

    it('should become dirty when typing in the description editor', () => {
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();
      const textarea: HTMLTextAreaElement =
        fixture.nativeElement.querySelector('ngx-monaco-editor textarea');
      textarea.value = 'B sign';
      textarea.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.form.description().value()).toBe('B sign');
      expect(component.form().dirty()).toBe(true);
    });

    it('should stay pristine when the description editor echoes its value', () => {
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();
      // the real Monaco editor reports programmatic writes as changes
      component.setFieldFromEditor(component.form.description, 'A sign');
      expect(component.form().dirty()).toBe(false);
    });

    it('should stay pristine when children emit the bound values', () => {
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();
      component.onFeatIdsChange(['serif']);
      // a normalized copy, as autosaving children emit
      component.onMeasurementsChange([
        { name: 'height', value: 3, unit: 'cm', tag: undefined },
      ]);
      expect(component.form().dirty()).toBe(false);
    });

    it('should not adopt or tag the measurements of the bound sign', () => {
      const sign = createSign();
      fixture.componentRef.setInput('sign', sign);
      fixture.detectChanges();
      typeInto(getIdInput(), 'b');
      component.save();
      expect(Object.getOwnPropertySymbols(sign.measurements![0])).toEqual([]);
      expect(sign.id).toBe('a');
    });

    it('should save a sign whose measurements carry no Symbol tags', () => {
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();
      const spy = vi.fn();
      component.sign.subscribe(spy);
      typeInto(getIdInput(), 'b');
      component.save();
      const saved = spy.mock.calls[0][0] as EpiSign;
      expect(Object.getOwnPropertySymbols(saved.measurements![0])).toEqual([]);
    });

    it('should keep an in-progress edit when its own save echoes back normalized', () => {
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();
      const input = getIdInput();
      typeInto(input, 'abc ');
      component.save();
      fixture.detectChanges();

      expect(component.sign()?.id).toBe('abc');
      expect(component.form.id().value()).toBe('abc ');
      typeInto(input, component.form.id().value() + 'd');
      expect(component.form.id().value()).toBe('abc d');
    });

    it('should rebuild the draft and clear dirty state on a new sign', () => {
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();
      typeInto(getIdInput(), 'xyz');
      expect(component.form().dirty()).toBe(true);

      fixture.componentRef.setInput('sign', { id: 'q' });
      fixture.detectChanges();
      expect(component.form.id().value()).toBe('q');
      expect(component.form().dirty()).toBe(false);
    });

    it('should save on Enter in the ID input only when valid and dirty', () => {
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();
      const spy = vi.fn();
      component.sign.subscribe(spy);
      const input = getIdInput();

      // pristine: no save
      pressEnter(input);
      expect(spy).not.toHaveBeenCalled();

      typeInto(input, 'b');
      const event = pressEnter(input);
      expect(event.defaultPrevented).toBe(true);
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }));
    });

    it('should not save on Enter in the description editor', () => {
      fixture.componentRef.setInput('sign', createSign());
      fixture.detectChanges();
      typeInto(getIdInput(), 'b');
      const spy = vi.fn();
      component.sign.subscribe(spy);
      const textarea: HTMLTextAreaElement =
        fixture.nativeElement.querySelector('ngx-monaco-editor textarea');
      pressEnter(textarea);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should render no <form>', () => {
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
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
