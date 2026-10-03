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

  function getSaveButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector(
      'button[mattooltip="Accept changes"]',
    );
  }

  function tagIds(): string[] {
    return component.form.tags().value();
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
    expect(component.form().invalid()).toBe(true);
    expect(component.form.tags().value()).toEqual([]);
    expect(!!component.form.values().getError('required')).toBe(true);
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

    expect(component.form.optional().value()).toBe(true);
    expect(component.form.placeholder().value()).toBe(false);
    expect(component.form.tags().value()).toEqual(['n', 'x']);
    // unknown tags are labeled with their ID
    expect(component.tagLabels()).toEqual(['noun', 'x']);
    expect(component.form.values().value()).toBe('dis\ndeis');
    expect(component.form.note().value()).toBe('a note');
    expect(component.form().valid()).toBe(true);
    expect(component.form().dirty()).toBe(false);
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
    expect(component.form.optional().value()).toBe(false);
    expect(component.form.placeholder().value()).toBe(false);
    expect(component.form.values().value()).toBe('');
    expect(component.form.note().value()).toBe('');
  });

  it('should reset form when token is cleared', () => {
    fixture.componentRef.setInput('token', createToken());
    fixture.detectChanges();
    fixture.componentRef.setInput('token', undefined);
    fixture.detectChanges();
    expect(component.form.optional().value()).toBe(false);
    expect(component.form.tags().value()).toEqual([]);
    expect(component.form.values().value()).toBe('');
    expect(component.form.note().value()).toBe('');
  });

  it('should append a picked tag only once', () => {
    component.onEntryChange(TAGS[0]);
    component.onEntryChange(TAGS[2]);
    component.onEntryChange(TAGS[0]);
    expect(tagIds()).toEqual(['n', 'v']);
    expect(component.form.tags().dirty()).toBe(true);
  });

  it('should remove a tag', () => {
    fixture.componentRef.setInput('token', createToken());
    fixture.detectChanges();
    component.removeTag(0);
    expect(tagIds()).toEqual(['x']);
    expect(component.form.tags().dirty()).toBe(true);
    component.removeTag(0);
    expect(component.form.tags().invalid()).toBe(true);
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
    component.form.values().value.set('x'.repeat(501));
    expect(!!component.form.values().getError('maxLength')).toBe(true);
    component.form.note().value.set('x'.repeat(1001));
    expect(!!component.form.note().getError('maxLength')).toBe(true);
  });

  it('should show values and note errors', () => {
    component.form.values().markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['value(s) required']);

    component.form.values().value.set('x'.repeat(501));
    component.form.note().value.set('x'.repeat(1001));
    component.form.note().markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['value(s) too long', 'note too long']);
  });

  it('should save edited token', () => {
    fixture.componentRef.setInput('token', createToken());
    fixture.detectChanges();
    const spy = vi.fn();
    component.token.subscribe(spy);

    component.form.optional().value.set(false);
    component.form.placeholder().value.set(true);
    component.form.values().value.set(' a \n\n b \n');
    component.form.note().value.set(' note ');
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
    component.form.note().value.set('  ');
    component.save();
    expect(spy.mock.calls[0][0].note).toBeUndefined();
    expect(spy.mock.calls[0][0].isOptional).toBe(true);
  });

  it('should not save when invalid', () => {
    const spy = vi.fn();
    component.token.subscribe(spy);
    component.form.values().value.set('x');
    component.save();
    // no tags
    expect(spy).not.toHaveBeenCalled();
  });

  it('should save on save button click', () => {
    fixture.componentRef.setInput('token', createToken());
    fixture.detectChanges();
    const spy = vi.fn();
    component.token.subscribe(spy);
    component.onEntryChange(TAGS[2]);
    fixture.detectChanges();
    const save = getSaveButton();
    expect(save.type).toBe('button');
    expect(save.disabled).toBe(false);
    save.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ['n', 'x', 'v'] }),
    );
  });

  it('should relabel tags when their entries change, keeping edits', () => {
    fixture.componentRef.setInput('token', createToken());
    fixture.detectChanges();
    component.onEntryChange(TAGS[2]);
    fixture.componentRef.setInput('tagEntries', [
      ...TAGS,
      { id: 'x', value: 'other' },
    ]);
    fixture.detectChanges();
    expect(component.tagLabels()).toEqual(['noun', 'other', 'verb']);
    expect(tagIds()).toEqual(['n', 'x', 'v']);
    expect(component.form().dirty()).toBe(true);
  });

  it('should disable save when pristine', () => {
    fixture.componentRef.setInput('token', createToken());
    fixture.detectChanges();
    expect(getSaveButton().disabled).toBe(true);
  });

  it('should mark as touched when saving an invalid form', () => {
    component.save();
    expect(component.form.values().touched()).toBe(true);
  });

  it('should keep an in-progress edit when its own save echoes back normalized', () => {
    fixture.componentRef.setInput('token', createToken());
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement =
      fixture.nativeElement.querySelector('textarea');
    textarea.value = 'dis\nabc ';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    component.save();
    fixture.detectChanges();

    expect(component.token()?.values).toEqual(['dis', 'abc']);
    expect(component.form.values().value()).toBe('dis\nabc ');
    textarea.value = component.form.values().value() + 'd';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.form.values().value()).toBe('dis\nabc d');
  });

  it('should rebuild the draft and clear dirty state on a new token', () => {
    fixture.componentRef.setInput('token', createToken());
    fixture.detectChanges();
    component.onEntryChange(TAGS[2]);
    expect(component.form().dirty()).toBe(true);
    fixture.componentRef.setInput('token', { tags: ['v'], values: ['x'] });
    fixture.detectChanges();
    expect(tagIds()).toEqual(['v']);
    expect(component.form().dirty()).toBe(false);
  });

  it('should not adopt the tags of the bound token', () => {
    const token = createToken();
    fixture.componentRef.setInput('token', token);
    fixture.detectChanges();
    component.onEntryChange(TAGS[2]);
    component.save();
    expect(token.tags).toEqual(['n', 'x']);
  });

  it('should render no <form> of its own', () => {
    // the thesaurus tree renders its own filter form
    const forms = Array.from(
      fixture.nativeElement.querySelectorAll('form') as NodeListOf<HTMLElement>,
    );
    expect(forms.every((f) => f.closest('cadmus-thesaurus-tree'))).toBe(true);
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
