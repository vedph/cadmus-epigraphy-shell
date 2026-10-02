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
    return component.tokens.value.map((t) => t.values[0]);
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
    expect(component.form.invalid).toBe(true);
    expect(component.language.hasError('required')).toBe(true);
    expect(component.tokens.value).toEqual([]);
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
    expect(component.eid.value).toBe('dm');
    expect(component.language.value).toBe('lat');
    expect(component.tag.value).toBe('funerary');
    expect(component.tokens.value).toEqual(createTokens());
    expect(component.form.valid).toBe(true);
    expect(component.form.pristine).toBe(true);
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
    expect(component.eid.value).toBeNull();
    expect(component.tag.value).toBeNull();
    expect(component.tokens.value).toEqual([]);
  });

  it('should reset form when pattern is cleared', () => {
    setPattern(createPattern());
    setPattern(undefined);
    expect(component.eid.value).toBeNull();
    expect(component.language.value).toBe('');
    expect(component.tokens.value).toEqual([]);
  });

  it('should close edited token when pattern changes', () => {
    setPattern(createPattern());
    component.editToken(component.tokens.value[0], 0);
    setPattern(createPattern());
    expect(component.edited()).toBeUndefined();
    expect(component.editedIndex()).toBe(-1);
  });

  it('should validate max lengths', () => {
    component.eid.setValue('x'.repeat(501));
    component.language.setValue('x'.repeat(51));
    component.tag.setValue('x'.repeat(51));
    expect(component.eid.hasError('maxlength')).toBe(true);
    expect(component.language.hasError('maxlength')).toBe(true);
    expect(component.tag.hasError('maxlength')).toBe(true);
  });

  it('should show errors', () => {
    component.language.markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['language required']);

    for (const [ctl, len] of [
      [component.eid, 501],
      [component.language, 51],
      [component.tag, 51],
    ] as const) {
      ctl.setValue('x'.repeat(len));
      ctl.markAsTouched();
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
    component.language.markAsTouched();
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
    component.editToken(component.tokens.value[0], 0);
    fixture.detectChanges();
    expect(component.edited()).toEqual(createTokens()[0]);
    expect(component.edited()).not.toBe(component.tokens.value[0]);
    expect(getRows()[0].classList.contains('selected')).toBe(true);
    const editor = getTokenEditor()!;
    expect(editor.tags.value).toEqual([{ id: 'd', value: 'deity' }]);
    expect(editor.values.value).toBe('dis');
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
    expect(component.tokens.value).toEqual([{ tags: ['x'], values: ['y'] }]);
    expect(component.tokens.dirty).toBe(true);
    expect(component.edited()).toBeUndefined();
  });

  it('should replace an edited token', () => {
    setPattern(createPattern());
    component.editToken(component.tokens.value[1], 1);
    component.saveToken({ tags: ['x'], values: ['y'] });
    expect(values()).toEqual(['dis', 'y', 'sacrum']);
  });

  it('should save token from token editor', () => {
    setPattern(createPattern());
    component.editToken(component.tokens.value[1], 1);
    fixture.detectChanges();
    const editor = getTokenEditor()!;
    editor.values.setValue('manibus\nmanibusque');
    editor.save();
    fixture.detectChanges();
    expect(component.tokens.value[1].values).toEqual([
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
    expect(component.tokens.dirty).toBe(true);
  });

  it('should not delete a token without confirmation', () => {
    dialogService.confirm.mockReturnValue(of(false));
    setPattern(createPattern());
    component.deleteToken(0);
    expect(values()).toEqual(['dis', 'manibus', 'sacrum']);
  });

  it('should close the editor when deleting the edited token', () => {
    setPattern(createPattern());
    component.editToken(component.tokens.value[1], 1);
    component.deleteToken(1);
    expect(component.edited()).toBeUndefined();
  });

  it('should keep edited token when deleting a previous token', () => {
    setPattern(createPattern());
    component.editToken(component.tokens.value[2], 2);
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
    expect(component.tokens.dirty).toBe(false);

    component.moveTokenUp(2);
    expect(values()).toEqual(['dis', 'sacrum', 'manibus']);
    component.moveTokenDown(0);
    expect(values()).toEqual(['sacrum', 'dis', 'manibus']);
    expect(component.tokens.dirty).toBe(true);
  });

  it('should keep edited token when moving tokens', () => {
    setPattern(createPattern());
    component.editToken(component.tokens.value[0], 0);
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
    component.eid.setValue('');
    component.tag.setValue(null);
    component.language.setValue('grc');
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
    component.language.setValue('lat');
    component.save();
    // no tokens
    expect(spy).not.toHaveBeenCalled();
  });

  it('should save on submit', () => {
    setPattern(createPattern());
    const spy = vi.fn();
    component.pattern.subscribe(spy);
    component.moveTokenDown(0);
    fixture.detectChanges();
    const submit: HTMLButtonElement = fixture.nativeElement.querySelector(
      'form > div:last-child button[type="submit"]',
    );
    expect(submit.disabled).toBe(false);
    submit.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit editorClose on cancel', () => {
    const spy = vi.fn();
    component.editorClose.subscribe(spy);
    component.cancel();
    expect(spy).toHaveBeenCalled();
  });
});
