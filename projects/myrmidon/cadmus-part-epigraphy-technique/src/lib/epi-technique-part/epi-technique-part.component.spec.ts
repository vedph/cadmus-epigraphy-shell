import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';
import { EditedObject, ThesauriSet } from '@myrmidon/cadmus-core';
import { AppRepository } from '@myrmidon/cadmus-state';

import {
  EPI_TECHNIQUE_PART_TYPEID,
  EpiTechniquePart,
} from '../epi-technique-part';
import { EpiTechniquePartComponent } from './epi-technique-part.component';

const THESAURI: ThesauriSet = {
  'epi-technique-groove-types': {
    id: 'epi-technique-groove-types@en',
    language: 'en',
    entries: [
      { id: 'v', value: 'V-shaped' },
      { id: 'u', value: 'U-shaped' },
    ],
  },
  'epi-technique-types': {
    id: 'epi-technique-types@en',
    language: 'en',
    entries: [
      { id: 'incision', value: 'incision' },
      { id: 'relief', value: 'relief' },
      { id: 'paint', value: 'paint' },
    ],
  },
  'epi-technique-tools': {
    id: 'epi-technique-tools@en',
    language: 'en',
    entries: [
      { id: 'chisel', value: 'chisel' },
      { id: 'brush', value: 'brush' },
    ],
  },
};

function createPart(): EpiTechniquePart {
  return {
    id: 'p1',
    itemId: 'i1',
    typeId: EPI_TECHNIQUE_PART_TYPEID,
    roleId: undefined,
    timeCreated: new Date(),
    creatorId: 'zeus',
    timeModified: new Date(),
    userId: 'zeus',
    grooveType: 'v',
    techniques: ['incision'],
    tools: ['chisel'],
    note: 'a note',
  };
}

describe('EpiTechniquePartComponent', () => {
  let component: EpiTechniquePartComponent;
  let fixture: ComponentFixture<EpiTechniquePartComponent>;
  let user$: BehaviorSubject<User | null>;

  function setData(data?: EditedObject<EpiTechniquePart>): void {
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
  }

  function getErrors(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(
        'mat-error',
      ) as NodeListOf<HTMLElement>,
    ).map((e) => e.textContent!.trim());
  }

  function getSaveButton(): HTMLButtonElement | undefined {
    const buttons: HTMLElement = fixture.nativeElement.querySelector(
      'cadmus-close-save-buttons',
    );
    return Array.from(buttons.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('save'),
    );
  }

  beforeEach(async () => {
    const user = { userName: 'zeus', roles: ['operator'] } as unknown as User;
    user$ = new BehaviorSubject<User | null>(user);

    await TestBed.configureTestingModule({
      imports: [EpiTechniquePartComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthJwtService,
          useValue: {
            currentUserValue: user,
            currentUser$: user$.asObservable(),
          },
        },
        {
          provide: AppRepository,
          useValue: {
            getTypeThesaurus: () => undefined,
            getSettingFor: () => Promise.resolve(undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EpiTechniquePartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('identity', {
      itemId: 'i1',
      typeId: EPI_TECHNIQUE_PART_TYPEID,
      partId: null,
      roleId: null,
    });
    fixture.detectChanges();
  });

  it('should create with an empty valid form', () => {
    expect(component).toBeTruthy();
    expect(component.form().valid()).toBe(true);
    expect(component.form.grooveType().value()).toBe('');
    expect(component.form.techniques().value()).toEqual([]);
    expect(component.form.tools().value()).toEqual([]);
    expect(component.userLevel).toBe(2);
  });

  it('should show the default title', () => {
    const title: HTMLElement =
      fixture.nativeElement.querySelector('mat-card-title');
    expect(title.textContent).toContain('Epigraphic Technique Part');
  });

  it('should use free text groove and hide flags without thesauri', () => {
    expect(fixture.nativeElement.querySelector('mat-select')).toBeNull();
    // groove and note
    expect(fixture.nativeElement.querySelectorAll('input').length).toBe(2);
    expect(
      fixture.nativeElement.querySelectorAll('cadmus-ui-flag-set').length,
    ).toBe(0);
  });

  it('should load thesauri and part from data, staying pristine', () => {
    setData({ value: createPart(), thesauri: THESAURI });

    expect(component.grooveTypeEntries()?.length).toBe(2);
    expect(component.techEntries()?.length).toBe(3);
    expect(component.toolEntries()?.length).toBe(2);
    expect(component.techFlags()).toEqual([
      { id: 'incision', label: 'incision' },
      { id: 'relief', label: 'relief' },
      { id: 'paint', label: 'paint' },
    ]);
    expect(component.toolFlags()).toEqual([
      { id: 'chisel', label: 'chisel' },
      { id: 'brush', label: 'brush' },
    ]);
    expect(component.form.grooveType().value()).toBe('v');
    expect(component.form.techniques().value()).toEqual(['incision']);
    expect(component.form.tools().value()).toEqual(['chisel']);
    expect(component.form.note().value()).toBe('a note');
    expect(component.isDirty()).toBe(false);
  });

  it('should not change the arrays of the bound part', () => {
    const part = createPart();
    setData({ value: part, thesauri: THESAURI });
    component.onTechIdsChange(['relief']);
    component.save();
    expect(part.techniques).toEqual(['incision']);
  });

  it('should render select and flag sets with thesauri', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    expect(fixture.nativeElement.querySelector('mat-select')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelectorAll('cadmus-ui-flag-set').length,
    ).toBe(2);
    // 3 techniques + 2 tools
    expect(fixture.nativeElement.querySelectorAll('mat-checkbox').length).toBe(
      5,
    );
  });

  it('should clear entries when thesauri are missing', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    setData({ value: createPart(), thesauri: {} });
    expect(component.grooveTypeEntries()).toBeUndefined();
    expect(component.techEntries()).toBeUndefined();
    expect(component.toolEntries()).toBeUndefined();
    expect(component.techFlags()).toEqual([]);
    expect(component.toolFlags()).toEqual([]);
  });

  it('should map missing part values to defaults', () => {
    const part = createPart();
    delete part.grooveType;
    delete part.techniques;
    delete part.tools;
    delete part.note;
    setData({ value: part, thesauri: {} });
    expect(component.form.grooveType().value()).toBe('');
    expect(component.form.techniques().value()).toEqual([]);
    expect(component.form.tools().value()).toEqual([]);
    expect(component.form.note().value()).toBe('');
  });

  it('should reset form when data has no value', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    setData({ value: null, thesauri: THESAURI });
    expect(component.form.grooveType().value()).toBe('');
    expect(component.form.techniques().value()).toEqual([]);
    expect(component.form.tools().value()).toEqual([]);
    expect(component.form.note().value()).toBe('');
  });

  it('should become dirty when typing, and pristine on new data', () => {
    setData({ value: createPart(), thesauri: {} });
    const dirtySpy = vi.fn();
    component.dirtyChange.subscribe(dirtySpy);

    // groove, note
    const input: HTMLInputElement =
      fixture.nativeElement.querySelectorAll('input')[1];
    input.value = 'typed';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.form.note().value()).toBe('typed');
    expect(component.isDirty()).toBe(true);

    setData({ value: createPart(), thesauri: {} });
    expect(component.form.note().value()).toBe('a note');
    expect(component.isDirty()).toBe(false);
    expect(dirtySpy.mock.calls.map((c) => c[0])).toEqual([true, false]);
  });

  it('should update techniques and tools from flags', () => {
    const dirtySpy = vi.fn();
    component.dirtyChange.subscribe(dirtySpy);

    component.onTechIdsChange(['relief']);
    expect(component.form.techniques().value()).toEqual(['relief']);
    expect(component.form.techniques().dirty()).toBe(true);
    fixture.detectChanges();
    expect(dirtySpy).toHaveBeenCalledWith(true);

    component.onToolIdsChange(['brush', 'chisel']);
    expect(component.form.tools().value()).toEqual(['brush', 'chisel']);
    expect(component.form.tools().dirty()).toBe(true);
  });

  it('should stay pristine when flags emit the bound ids', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.onTechIdsChange(['incision']);
    component.onToolIdsChange(['chisel']);
    expect(component.isDirty()).toBe(false);
  });

  it('should update techniques when a checkbox is clicked', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const inputs: NodeListOf<HTMLInputElement> =
      fixture.nativeElement.querySelectorAll('mat-checkbox input');
    // second technique (relief)
    inputs[1].click();
    // second tool (brush)
    inputs[4].click();
    fixture.detectChanges();
    expect(component.form.techniques().value()).toEqual([
      'incision',
      'relief',
    ]);
    expect(component.form.tools().value()).toEqual(['chisel', 'brush']);
    expect(component.isDirty()).toBe(true);
  });

  it('should validate max lengths', () => {
    component.form.grooveType().value.set('x'.repeat(51));
    expect(component.form.grooveType().getError('maxLength')).toBeTruthy();
    component.form.grooveType().value.set('x'.repeat(50));
    expect(component.form.grooveType().valid()).toBe(true);
    component.form.note().value.set('x'.repeat(5001));
    expect(component.form.note().getError('maxLength')).toBeTruthy();
    expect(component.form().invalid()).toBe(true);
  });

  it('should show error messages for too long values', () => {
    component.form.grooveType().value.set('x'.repeat(51));
    component.form.grooveType().markAsTouched();
    component.form.note().value.set('x'.repeat(5001));
    component.form.note().markAsTouched();
    fixture.detectChanges();
    expect(getErrors()).toEqual(['groove too long', 'note too long']);
  });

  it('should save edited part', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);

    component.form.grooveType().value.set('u');
    component.onTechIdsChange(['incision', 'paint']);
    component.onToolIdsChange(['brush']);
    component.form.note().value.set('  new note  ');
    component.save();

    expect(spy).toHaveBeenCalledTimes(1);
    const part = (spy.mock.calls[0][0] as EditedObject<EpiTechniquePart>)
      .value!;
    expect(part.id).toBe('p1');
    expect(part.itemId).toBe('i1');
    expect(part.grooveType).toBe('u');
    expect(part.techniques).toEqual(['incision', 'paint']);
    expect(part.tools).toEqual(['brush']);
    expect(part.note).toBe('new note');
    expect(component.isDirty()).toBe(false);
  });

  it('should save empty values as undefined', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);

    component.form.grooveType().value.set('  ');
    component.onTechIdsChange([]);
    component.onToolIdsChange([]);
    component.form.note().value.set(' ');
    component.save();

    const part = (spy.mock.calls[0][0] as EditedObject<EpiTechniquePart>)
      .value!;
    expect(part.grooveType).toBeUndefined();
    expect(part.techniques).toBeUndefined();
    expect(part.tools).toBeUndefined();
    expect(part.note).toBeUndefined();
  });

  it('should save a new part using identity', () => {
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.form.grooveType().value.set('v');
    component.save();

    const part = (spy.mock.calls[0][0] as EditedObject<EpiTechniquePart>)
      .value!;
    expect(part.itemId).toBe('i1');
    expect(part.typeId).toBe(EPI_TECHNIQUE_PART_TYPEID);
    expect(part.id).toBe('');
    expect(part.grooveType).toBe('v');
  });

  it('should not save an invalid form, and mark it as touched', () => {
    const spy = vi.fn();
    component.data.subscribe(spy);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    component.form.note().value.set('x'.repeat(5001));
    component.save();
    expect(spy).not.toHaveBeenCalled();
    expect(component.form.note().touched()).toBe(true);
  });

  it('should save from the save button', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.onTechIdsChange(['relief']);
    fixture.detectChanges();

    getSaveButton()!.click();

    expect(spy).toHaveBeenCalledTimes(1);
    const part = (spy.mock.calls[0][0] as EditedObject<EpiTechniquePart>)
      .value!;
    expect(part.techniques).toEqual(['relief']);
  });

  it('should disable the save button while the form is invalid', () => {
    component.form.note().value.set('x'.repeat(5001));
    fixture.detectChanges();
    expect(getSaveButton()!.disabled).toBe(true);
  });

  it('should render no <form>', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('should emit editorClose on close', () => {
    const spy = vi.fn();
    component.editorClose.subscribe(spy);
    component.close();
    expect(spy).toHaveBeenCalled();
  });

  it('should disable form when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(component.form().disabled()).toBe(true);
    expect(component.form.note().disabled()).toBe(true);
  });

  it('should reset user level on logout', () => {
    user$.next(null);
    expect(component.userLevel).toBe(0);
  });
});
