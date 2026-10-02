import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { EpiFormulaToken } from '../epi-formula-patterns-part';
import { EpiFormulaTokenComponent } from './epi-formula-token.component';

const TAGS: ThesaurusEntry[] = [
  { id: 'n', value: 'noun' },
  { id: 'n.gen', value: 'noun: genitive' },
  { id: 'v', value: 'verb' },
];

function createToken(): EpiFormulaToken {
  return {
    tags: ['n', 'x'],
    values: ['dis', 'deis'],
    isOptional: true,
    isPlaceholder: false,
    note: 'a note',
  };
}

describe('EpiFormulaTokenComponent', () => {
  let component: EpiFormulaTokenComponent;
  let fixture: ComponentFixture<EpiFormulaTokenComponent>;

  function getErrors(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(
        'mat-error',
      ) as NodeListOf<HTMLElement>,
    ).map((e) => e.textContent!.trim());
  }

  function tagIds(): string[] {
    return component.tags.value.map((t) => t.id);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiFormulaTokenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EpiFormulaTokenComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tagEntries', TAGS);
    fixture.detectChanges();
  });

  it('should create with an invalid empty form', () => {
    expect(component).toBeTruthy();
    expect(component.form.invalid).toBe(true);
    expect(component.tags.value).toEqual([]);
    expect(component.values.hasError('required')).toBe(true);
    expect(fixture.nativeElement.querySelector('.error').textContent).toBe(
      'no tags',
    );
  });

  it('should render tags thesaurus tree', () => {
    expect(
      fixture.nativeElement.querySelector('cadmus-thesaurus-tree'),
    ).toBeTruthy();
  });

  it('should update form from token resolving tag entries', () => {
    fixture.componentRef.setInput('token', createToken());
    fixture.detectChanges();

    expect(component.optional.value).toBe(true);
    expect(component.placeholder.value).toBe(false);
    // unknown tags get an entry with their ID as value
    expect(component.tags.value).toEqual([
      { id: 'n', value: 'noun' },
      { id: 'x', value: 'x' },
    ]);
    expect(component.values.value).toBe('dis\ndeis');
    expect(component.note.value).toBe('a note');
    expect(component.form.valid).toBe(true);
    expect(component.form.pristine).toBe(true);
  });

  it('should render tags list', () => {
    fixture.componentRef.setInput('token', createToken());
    fixture.detectChanges();
    const cells = Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr td:last-child'),
    ).map((c) => (c as HTMLElement).textContent!.trim());
    expect(cells).toEqual(['noun', 'x']);
    expect(fixture.nativeElement.querySelector('.error')).toBeNull();
  });

  it('should map missing token values to defaults', () => {
    fixture.componentRef.setInput('token', { tags: [], values: [] });
    fixture.detectChanges();
    expect(component.optional.value).toBe(false);
    expect(component.placeholder.value).toBe(false);
    expect(component.values.value).toBe('');
    expect(component.note.value).toBeNull();
  });

  it('should reset form when token is cleared', () => {
    fixture.componentRef.setInput('token', createToken());
    fixture.detectChanges();
    fixture.componentRef.setInput('token', undefined);
    fixture.detectChanges();
    expect(component.optional.value).toBe(false);
    expect(component.tags.value).toEqual([]);
    expect(component.values.value).toBe('');
    expect(component.note.value).toBeNull();
  });

  it('should append a picked tag only once', () => {
    component.onEntryChange(TAGS[0]);
    component.onEntryChange(TAGS[2]);
    component.onEntryChange(TAGS[0]);
    expect(tagIds()).toEqual(['n', 'v']);
    expect(component.tags.dirty).toBe(true);
  });

  it('should remove a tag', () => {
    fixture.componentRef.setInput('token', createToken());
    fixture.detectChanges();
    component.removeTag(0);
    expect(tagIds()).toEqual(['x']);
    expect(component.tags.dirty).toBe(true);
    component.removeTag(0);
    expect(component.tags.invalid).toBe(true);
  });

  it('should move tags up and down', () => {
    component.onEntryChange(TAGS[0]);
    component.onEntryChange(TAGS[1]);
    component.onEntryChange(TAGS[2]);

    component.moveTagUp(0);
    expect(tagIds()).toEqual(['n', 'n.gen', 'v']);
    component.moveTagDown(2);
    expect(tagIds()).toEqual(['n', 'n.gen', 'v']);

    component.moveTagUp(2);
    expect(tagIds()).toEqual(['n', 'v', 'n.gen']);
    component.moveTagDown(0);
    expect(tagIds()).toEqual(['v', 'n', 'n.gen']);
  });

  it('should invoke tag actions from buttons', () => {
    fixture.componentRef.setInput('token', createToken());
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    const first = rows[0].querySelectorAll('button');
    const last = rows[1].querySelectorAll('button');
    expect(first[0].disabled).toBe(true);
    expect(last[1].disabled).toBe(true);

    first[1].click();
    expect(tagIds()).toEqual(['x', 'n']);
    fixture.detectChanges();
    fixture.nativeElement
      .querySelectorAll('tbody tr')[1]
      .querySelectorAll('button')[0]
      .click();
    expect(tagIds()).toEqual(['n', 'x']);
    fixture.detectChanges();
    fixture.nativeElement
      .querySelectorAll('tbody tr')[0]
      .querySelectorAll('button')[2]
      .click();
    expect(tagIds()).toEqual(['x']);
  });

  it('should validate max lengths', () => {
    component.values.setValue('x'.repeat(501));
    expect(component.values.hasError('maxlength')).toBe(true);
    component.note.setValue('x'.repeat(1001));
    expect(component.note.hasError('maxlength')).toBe(true);
  });

  it('should show values and note errors', () => {
    component.values.markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['value(s) required']);

    component.values.setValue('x'.repeat(501));
    component.note.setValue('x'.repeat(1001));
    component.note.markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['value(s) too long', 'note too long']);
  });

  it('should save edited token', () => {
    fixture.componentRef.setInput('token', createToken());
    fixture.detectChanges();
    const spy = vi.fn();
    component.token.subscribe(spy);

    component.optional.setValue(false);
    component.placeholder.setValue(true);
    component.values.setValue(' a \n\n b \n');
    component.note.setValue(' note ');
    component.save();

    expect(spy).toHaveBeenCalledWith({
      tags: ['n', 'x'],
      values: ['a', 'b'],
      isOptional: undefined,
      isPlaceholder: true,
      note: 'note',
    });
  });

  it('should save empty note as undefined', () => {
    fixture.componentRef.setInput('token', createToken());
    fixture.detectChanges();
    const spy = vi.fn();
    component.token.subscribe(spy);
    component.note.setValue('  ');
    component.save();
    expect(spy.mock.calls[0][0].note).toBeUndefined();
    expect(spy.mock.calls[0][0].isOptional).toBe(true);
  });

  it('should not save when invalid', () => {
    const spy = vi.fn();
    component.token.subscribe(spy);
    component.values.setValue('x');
    component.save();
    // no tags
    expect(spy).not.toHaveBeenCalled();
  });

  it('should save on submit', () => {
    fixture.componentRef.setInput('token', createToken());
    fixture.detectChanges();
    const spy = vi.fn();
    component.token.subscribe(spy);
    component.onEntryChange(TAGS[2]);
    fixture.detectChanges();
    const submit: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    );
    expect(submit.disabled).toBe(false);
    submit.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ['n', 'x', 'v'] }),
    );
  });

  it('should emit editorClose on cancel', () => {
    const spy = vi.fn();
    component.editorClose.subscribe(spy);
    component.cancel();
    expect(spy).toHaveBeenCalled();
  });

  it('should render labels from last colon', () => {
    expect(component.renderLabel('noun: genitive')).toBe('genitive');
  });
});
