import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DialogService } from '@myrmidon/ngx-mat-tools';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  EpiFormulaPattern,
  EpiFormulaToken,
} from '../epi-formula-patterns-part';
import { EpiFormulaTokenComponent } from '../epi-formula-token/epi-formula-token.component';
import { EpiFormulaPatternComponent } from './epi-formula-pattern.component';

// the form tags the objects in its arrays with an identity Symbol:
// compare their plain data only
function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const LANGS: ThesaurusEntry[] = [
  { id: 'lat', value: 'Latin' },
  { id: 'grc', value: 'Greek' },
];
const TAGS: ThesaurusEntry[] = [
  { id: 'funerary', value: 'funerary' },
  { id: 'votive', value: 'votive' },
];

function createTokens(): EpiFormulaToken[] {
  return [
    { tags: ['d'], values: ['dis'] },
    { tags: ['m'], values: ['manibus'] },
    { tags: ['s'], values: ['sacrum'], isOptional: true },
  ];
}

function createPattern(): EpiFormulaPattern {
  return {
    eid: 'dm',
    language: 'lat',
    tag: 'funerary',
    tokens: createTokens(),
  };
}

describe('EpiFormulaPatternComponent', () => {
  let component: EpiFormulaPatternComponent;
  let fixture: ComponentFixture<EpiFormulaPatternComponent>;
  let dialogService: { confirm: ReturnType<typeof vi.fn> };

  function getErrors(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(
        'mat-error',
      ) as NodeListOf<HTMLElement>,
    ).map((e) => e.textContent!.trim());
  }

  function getRows(): HTMLTableRowElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
  }

  function getTokenEditor(): EpiFormulaTokenComponent | undefined {
    return fixture.debugElement.query(
      (de) => de.componentInstance instanceof EpiFormulaTokenComponent,
    )?.componentInstance;
  }

  function values(): string[] {
    return component.form.tokens().value().map((t) => t.values[0]);
  }

  function setPattern(pattern?: EpiFormulaPattern): void {
    fixture.componentRef.setInput('pattern', pattern);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    dialogService = { confirm: vi.fn().mockReturnValue(of(true)) };
    await TestBed.configureTestingModule({
      imports: [EpiFormulaPatternComponent],
      providers: [{ provide: DialogService, useValue: dialogService }],
    }).compileComponents();

    fixture = TestBed.createComponent(EpiFormulaPatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with an invalid empty form', () => {
    expect(component).toBeTruthy();
    expect(component.form().invalid()).toBe(true);
    expect(!!component.form.language().getError('required')).toBe(true);
    expect(plain(component.form.tokens().value())).toEqual([]);
  });

  it('should use free inputs without thesauri', () => {
    expect(fixture.nativeElement.querySelectorAll('mat-select').length).toBe(0);
    // eid, language, tag
    expect(fixture.nativeElement.querySelectorAll('input').length).toBe(3);
  });

  it('should use selects with thesauri', () => {
    fixture.componentRef.setInput('langEntries', LANGS);
    fixture.componentRef.setInput('tagEntries', TAGS);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('mat-select').length).toBe(2);
    // eid only
    expect(fixture.nativeElement.querySelectorAll('input').length).toBe(1);
  });

  it('should update form from pattern', () => {
    setPattern(createPattern());
    expect(component.form.eid().value()).toBe('dm');
    expect(component.form.language().value()).toBe('lat');
    expect(component.form.tag().value()).toBe('funerary');
    expect(plain(component.form.tokens().value())).toEqual(createTokens());
    expect(component.form().valid()).toBe(true);
    expect(component.form().dirty()).toBe(false);
  });

  it('should render tokens', () => {
    setPattern(createPattern());
    const cells = getRows().map((r) =>
      r.querySelectorAll('td')[1].textContent!.trim(),
    );
    expect(cells).toEqual(['<d dis>', '<m manibus>', '[s sacrum]']);
  });

  it('should map missing pattern values to defaults', () => {
    setPattern({
      language: 'lat',
      tokens: undefined as unknown as EpiFormulaToken[],
    });
    expect(component.form.eid().value()).toBe('');
    expect(component.form.tag().value()).toBe('');
    expect(plain(component.form.tokens().value())).toEqual([]);
  });

  it('should reset form when pattern is cleared', () => {
    setPattern(createPattern());
    setPattern(undefined);
    expect(component.form.eid().value()).toBe('');
    expect(component.form.language().value()).toBe('');
    expect(plain(component.form.tokens().value())).toEqual([]);
  });

  it('should close edited token when pattern changes', () => {
    setPattern(createPattern());
    component.editToken(component.form.tokens().value()[0], 0);
    setPattern(createPattern());
    expect(component.edited()).toBeUndefined();
    expect(component.editedIndex()).toBe(-1);
  });

  it('should validate max lengths', () => {
    component.form.eid().value.set('x'.repeat(501));
    component.form.language().value.set('x'.repeat(51));
    component.form.tag().value.set('x'.repeat(51));
    expect(!!component.form.eid().getError('maxLength')).toBe(true);
    expect(!!component.form.language().getError('maxLength')).toBe(true);
    expect(!!component.form.tag().getError('maxLength')).toBe(true);
  });

  it('should show errors', () => {
    component.form.language().markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['language required']);

    for (const [field, len] of [
      [component.form.eid, 501],
      [component.form.language, 51],
      [component.form.tag, 51],
    ] as const) {
      field().value.set('x'.repeat(len));
      field().markAsTouched();
    }
    fixture.detectChanges();
    expect(getErrors()).toEqual([
      'EID too long',
      'language too long',
      'tag too long',
    ]);
  });

  it('should show language required error with select', () => {
    fixture.componentRef.setInput('langEntries', LANGS);
    component.form.language().markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['language required']);
  });

  it('should add a new token', () => {
    component.addToken();
    fixture.detectChanges();
    expect(component.edited()).toEqual({ tags: [], values: [] });
    expect(component.editedIndex()).toBe(-1);
    expect(getTokenEditor()).toBeTruthy();
    const header: HTMLElement = fixture.nativeElement.querySelector(
      'mat-expansion-panel-header',
    );
    expect(header.textContent).toContain('Token #0');
  });

  it('should edit a copy of a token', () => {
    fixture.componentRef.setInput('tokTagEntries', [
      { id: 'd', value: 'deity' },
    ]);
    setPattern(createPattern());
    component.editToken(component.form.tokens().value()[0], 0);
    fixture.detectChanges();
    expect(component.edited()).toEqual(createTokens()[0]);
    expect(component.edited()).not.toBe(component.form.tokens().value()[0]);
    expect(getRows()[0].classList.contains('selected')).toBe(true);
    const editor = getTokenEditor()!;
    expect(editor.form.tags().value()).toEqual(['d']);
    expect(editor.tagLabels()).toEqual(['deity']);
    expect(editor.form.values().value()).toBe('dis');
  });

  it('should close token editor on its close', () => {
    component.addToken();
    fixture.detectChanges();
    getTokenEditor()!.cancel();
    fixture.detectChanges();
    expect(component.edited()).toBeUndefined();
    expect(getTokenEditor()).toBeUndefined();
  });

  it('should append a new token', () => {
    component.addToken();
    component.saveToken({ tags: ['x'], values: ['y'] });
    expect(plain(component.form.tokens().value())).toEqual([{ tags: ['x'], values: ['y'] }]);
    expect(component.form.tokens().dirty()).toBe(true);
    expect(component.edited()).toBeUndefined();
  });

  it('should replace an edited token', () => {
    setPattern(createPattern());
    component.editToken(component.form.tokens().value()[1], 1);
    component.saveToken({ tags: ['x'], values: ['y'] });
    expect(values()).toEqual(['dis', 'y', 'sacrum']);
  });

  it('should save token from token editor', () => {
    setPattern(createPattern());
    component.editToken(component.form.tokens().value()[1], 1);
    fixture.detectChanges();
    const editor = getTokenEditor()!;
    editor.form.values().value.set('manibus\nmanibusque');
    editor.save();
    fixture.detectChanges();
    expect(component.form.tokens().value()[1].values).toEqual([
      'manibus',
      'manibusque',
    ]);
    expect(getTokenEditor()).toBeUndefined();
  });

  it('should delete a token after confirmation', () => {
    setPattern(createPattern());
    component.deleteToken(0);
    expect(dialogService.confirm).toHaveBeenCalled();
    expect(values()).toEqual(['manibus', 'sacrum']);
    expect(component.form.tokens().dirty()).toBe(true);
  });

  it('should not delete a token without confirmation', () => {
    dialogService.confirm.mockReturnValue(of(false));
    setPattern(createPattern());
    component.deleteToken(0);
    expect(values()).toEqual(['dis', 'manibus', 'sacrum']);
  });

  it('should close the editor when deleting the edited token', () => {
    setPattern(createPattern());
    component.editToken(component.form.tokens().value()[1], 1);
    component.deleteToken(1);
    expect(component.edited()).toBeUndefined();
  });

  it('should keep edited token when deleting a previous token', () => {
    setPattern(createPattern());
    component.editToken(component.form.tokens().value()[2], 2);
    component.deleteToken(0);
    expect(component.editedIndex()).toBe(1);
    component.saveToken({ tags: [], values: ['z'] });
    expect(values()).toEqual(['manibus', 'z']);
  });

  it('should move tokens up and down', () => {
    setPattern(createPattern());
    component.moveTokenUp(0);
    component.moveTokenDown(2);
    expect(values()).toEqual(['dis', 'manibus', 'sacrum']);
    expect(component.form.tokens().dirty()).toBe(false);

    component.moveTokenUp(2);
    expect(values()).toEqual(['dis', 'sacrum', 'manibus']);
    component.moveTokenDown(0);
    expect(values()).toEqual(['sacrum', 'dis', 'manibus']);
    expect(component.form.tokens().dirty()).toBe(true);
  });

  it('should keep edited token when moving tokens', () => {
    setPattern(createPattern());
    component.editToken(component.form.tokens().value()[0], 0);
    component.moveTokenDown(0);
    expect(component.editedIndex()).toBe(1);
    component.moveTokenUp(2);
    expect(component.editedIndex()).toBe(2);
    component.saveToken({ tags: [], values: ['z'] });
    expect(values()).toEqual(['manibus', 'sacrum', 'z']);
  });

  it('should invoke row actions from buttons', () => {
    setPattern(createPattern());
    const rows = getRows();
    expect(rows[0].querySelectorAll('button')[1].disabled).toBe(true);
    expect(rows[2].querySelectorAll('button')[2].disabled).toBe(true);
    rows[1].querySelectorAll('button')[0].click();
    expect(component.editedIndex()).toBe(1);
    rows[1].querySelectorAll('button')[1].click();
    expect(values()).toEqual(['manibus', 'dis', 'sacrum']);
    fixture.detectChanges();
    getRows()[0].querySelectorAll('button')[2].click();
    expect(values()).toEqual(['dis', 'manibus', 'sacrum']);
    fixture.detectChanges();
    getRows()[2].querySelectorAll('button')[3].click();
    expect(values()).toEqual(['dis', 'manibus']);
  });

  it('should save edited pattern', () => {
    setPattern(createPattern());
    const spy = vi.fn();
    component.pattern.subscribe(spy);
    component.form.eid().value.set('');
    component.form.tag().value.set('');
    component.form.language().value.set('grc');
    component.save();
    expect(spy).toHaveBeenCalledWith({
      eid: undefined,
      language: 'grc',
      tag: undefined,
      tokens: createTokens(),
    });
  });

  it('should not save when invalid', () => {
    const spy = vi.fn();
    component.pattern.subscribe(spy);
    component.form.language().value.set('lat');
    component.save();
    // no tokens
    expect(spy).not.toHaveBeenCalled();
  });

  it('should save on save button click', () => {
    setPattern(createPattern());
    const spy = vi.fn();
    component.pattern.subscribe(spy);
    component.moveTokenDown(0);
    fixture.detectChanges();
    const submit: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[mattooltip="Accept changes"]',
    );
    expect(submit.disabled).toBe(false);
    submit.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should disable save when pristine', () => {
    setPattern(createPattern());
    const save: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[mattooltip="Accept changes"]',
    );
    expect(save.type).toBe('button');
    expect(save.disabled).toBe(true);
  });

  it('should mark as touched when saving an invalid form', () => {
    component.save();
    expect(component.form.language().touched()).toBe(true);
  });

  it('should close the token editor when a new pattern is set', () => {
    setPattern(createPattern());
    component.editToken(component.form.tokens().value()[0], 0);
    setPattern({ language: 'grc', tokens: createTokens() });
    expect(component.edited()).toBeUndefined();
    expect(component.editedIndex()).toBe(-1);
  });

  it('should not tag or change the tokens of the bound pattern', () => {
    const pattern = createPattern();
    setPattern(pattern);
    component.editToken(component.form.tokens().value()[0], 0);
    expect(Object.getOwnPropertySymbols(component.edited()!)).toEqual([]);
    component.saveToken({ tags: ['x'], values: ['y'] });
    component.save();
    expect(pattern.tokens).toEqual(createTokens());
    for (const t of pattern.tokens) {
      expect(Object.getOwnPropertySymbols(t)).toEqual([]);
    }
  });

  it('should save a pattern whose tokens carry no Symbol tags', () => {
    setPattern(createPattern());
    const spy = vi.fn();
    component.pattern.subscribe(spy);
    component.moveTokenDown(0);
    component.save();
    const saved = spy.mock.calls[0][0] as EpiFormulaPattern;
    for (const t of saved.tokens) {
      expect(Object.getOwnPropertySymbols(t)).toEqual([]);
    }
  });

  it('should keep an in-progress edit when its own save echoes back normalized', () => {
    setPattern(createPattern());
    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[matInput]',
    );
    input.value = 'abc ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    component.save();
    fixture.detectChanges();

    expect(component.pattern()?.eid).toBe('abc');
    expect(component.form.eid().value()).toBe('abc ');
    input.value = component.form.eid().value() + 'd';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.form.eid().value()).toBe('abc d');
  });

  it('should save on Enter in its own text input when valid and dirty', () => {
    setPattern(createPattern());
    const spy = vi.fn();
    component.pattern.subscribe(spy);
    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[matInput]',
    );
    input.value = 'e9';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ eid: 'e9' }));
  });

  it('should not save on Enter in the token editor tags filter, which has its own form', () => {
    setPattern(createPattern());
    // make the pattern dirty and valid, so that it could be saved
    component.moveTokenDown(0);
    const spy = vi.fn();
    component.pattern.subscribe(spy);
    component.editToken(component.form.tokens().value()[0], 0);
    fixture.detectChanges();
    const input: HTMLInputElement | null = fixture.nativeElement.querySelector(
      'cadmus-epi-formula-token cadmus-thesaurus-tree form input',
    );
    expect(input).toBeTruthy();
    input!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it('should render no <form> of its own, also with the token editor open', () => {
    setPattern(createPattern());
    component.editToken(component.form.tokens().value()[0], 0);
    fixture.detectChanges();
    const forms = Array.from(
      fixture.nativeElement.querySelectorAll('form') as NodeListOf<HTMLElement>,
    );
    // only the thesaurus tree's own filter form
    expect(forms.every((f) => f.closest('cadmus-thesaurus-tree'))).toBe(true);
  });

  it('should emit editorClose on cancel', () => {
    const spy = vi.fn();
    component.editorClose.subscribe(spy);
    component.cancel();
    expect(spy).toHaveBeenCalled();
  });
});
