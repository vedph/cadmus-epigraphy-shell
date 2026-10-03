import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';
import { EditedObject, ThesauriSet } from '@myrmidon/cadmus-core';
import { AppRepository } from '@myrmidon/cadmus-state';

import { EpiLigaturesFragment } from '../epi-ligatures-fragment';
import { EpiLigaturesFragmentComponent } from './epi-ligatures-fragment.component';

const THESAURI: ThesauriSet = {
  'epi-ligature-types': {
    id: 'epi-ligature-types@en',
    language: 'en',
    entries: [
      { id: 'lig', value: 'ligature' },
      { id: 'inl', value: 'inlay' },
    ],
  },
};

function createFragment(): EpiLigaturesFragment {
  return {
    location: '1.2',
    types: ['lig'],
    eid: 'e1',
    groupId: 'g1',
    note: 'a note',
  };
}

describe('EpiLigaturesFragmentComponent', () => {
  let component: EpiLigaturesFragmentComponent;
  let fixture: ComponentFixture<EpiLigaturesFragmentComponent>;
  let user$: BehaviorSubject<User | null>;

  function setData(data?: EditedObject<EpiLigaturesFragment>): void {
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
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
    const user = { userName: 'zeus', roles: ['admin'] } as unknown as User;
    user$ = new BehaviorSubject<User | null>(user);

    await TestBed.configureTestingModule({
      imports: [EpiLigaturesFragmentComponent],
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

    fixture = TestBed.createComponent(EpiLigaturesFragmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with an empty invalid form', () => {
    expect(component).toBeTruthy();
    expect(component.form().invalid()).toBe(true);
    expect(component.form.types().value()).toEqual([]);
    expect(component.typeFlags()).toEqual([]);
    expect(component.userLevel).toBe(4);
  });

  it('should show the default title', () => {
    const title: HTMLElement =
      fixture.nativeElement.querySelector('mat-card-title');
    expect(title.textContent).toContain('Epigraphic Ligatures Fragment');
  });

  it('should load thesauri and fragment from data', () => {
    setData({ value: createFragment(), thesauri: THESAURI });

    expect(component.typeEntries()?.length).toBe(2);
    expect(component.typeFlags()).toEqual([
      { id: 'lig', label: 'ligature' },
      { id: 'inl', label: 'inlay' },
    ]);
    expect(component.form.types().value()).toEqual(['lig']);
    expect(component.form.eid().value()).toBe('e1');
    expect(component.form.groupId().value()).toBe('g1');
    expect(component.form.note().value()).toBe('a note');
    expect(component.form().dirty()).toBe(false);
    expect(component.form().valid()).toBe(true);
  });

  it('should render a checkbox for each type flag', () => {
    setData({ value: createFragment(), thesauri: THESAURI });
    const boxes = fixture.nativeElement.querySelectorAll('mat-checkbox');
    expect(boxes.length).toBe(2);
  });

  it('should clear type entries when thesaurus is missing', () => {
    setData({ value: createFragment(), thesauri: THESAURI });
    setData({ value: createFragment(), thesauri: {} });
    expect(component.typeEntries()).toBeUndefined();
    expect(component.typeFlags()).toEqual([]);
  });

  it('should map missing optional fragment values to empty strings', () => {
    setData({
      value: { location: '1.1', types: undefined as unknown as string[] },
      thesauri: {},
    });
    expect(component.form.types().value()).toEqual([]);
    expect(component.form.eid().value()).toBe('');
    expect(component.form.groupId().value()).toBe('');
    expect(component.form.note().value()).toBe('');
  });

  it('should reset form when data has no value', () => {
    setData({ value: createFragment(), thesauri: THESAURI });
    setData({ value: null as unknown as EpiLigaturesFragment, thesauri: {} });
    expect(component.form.types().value()).toEqual([]);
    expect(component.form.eid().value()).toBe('');
    expect(component.form.note().value()).toBe('');
  });

  it('should update types on flag change, marking them dirty', () => {
    const dirtySpy = vi.fn();
    component.dirtyChange.subscribe(dirtySpy);

    component.onTypeIdsChange(['inl', 'lig']);

    expect(component.form.types().value()).toEqual(['inl', 'lig']);
    expect(component.form.types().dirty()).toBe(true);
    expect(component.form().valid()).toBe(true);
    expect(component.isDirty()).toBe(true);
    fixture.detectChanges();
    expect(dirtySpy).toHaveBeenCalledWith(true);
  });

  it('should update types when a flag checkbox is clicked', () => {
    setData({ value: createFragment(), thesauri: THESAURI });
    const inputs: NodeListOf<HTMLInputElement> =
      fixture.nativeElement.querySelectorAll('mat-checkbox input');
    inputs[1].click();
    fixture.detectChanges();
    expect(component.form.types().value()).toEqual(['lig', 'inl']);
    expect(component.form().dirty()).toBe(true);
  });

  it('should validate max lengths', () => {
    component.onTypeIdsChange(['lig']);
    component.form.eid().value.set('x'.repeat(501));
    expect(!!component.form.eid().getError('maxLength')).toBe(true);
    component.form.eid().value.set('x'.repeat(500));
    expect(component.form.eid().valid()).toBe(true);

    component.form.groupId().value.set('x'.repeat(101));
    expect(!!component.form.groupId().getError('maxLength')).toBe(true);

    component.form.note().value.set('x'.repeat(1001));
    expect(!!component.form.note().getError('maxLength')).toBe(true);
    expect(component.form().invalid()).toBe(true);
  });

  it('should show error messages for too long values', () => {
    component.form.eid().value.set('x'.repeat(501));
    component.form.eid().markAsDirty();
    component.form.eid().markAsTouched();
    component.form.groupId().value.set('x'.repeat(101));
    component.form.groupId().markAsDirty();
    component.form.groupId().markAsTouched();
    component.form.note().value.set('x'.repeat(1001));
    component.form.note().markAsDirty();
    component.form.note().markAsTouched();
    fixture.detectChanges();

    const errors: string[] = Array.from(
      fixture.nativeElement.querySelectorAll('mat-error') as NodeListOf<HTMLElement>,
    ).map((e) => e.textContent!.trim());
    expect(errors).toEqual([
      'EID too long',
      'group ID too long',
      'note too long',
    ]);
  });

  it('should not save when form is invalid', () => {
    const spy = vi.fn();
    component.data.subscribe(spy);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    component.save();

    expect(spy).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
  });

  it('should save edited fragment trimming values', () => {
    setData({ value: createFragment(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);

    component.onTypeIdsChange(['lig', 'inl']);
    component.form.eid().value.set('  e2 ');
    component.form.groupId().value.set(' g2 ');
    component.form.note().value.set(' new note ');
    component.save();

    expect(spy).toHaveBeenCalledTimes(1);
    const data = spy.mock.calls[0][0] as EditedObject<EpiLigaturesFragment>;
    expect(data.value).toEqual({
      location: '1.2',
      types: ['lig', 'inl'],
      eid: 'e2',
      groupId: 'g2',
      note: 'new note',
    });
    // thesauri are preserved
    expect(data.thesauri).toBe(THESAURI);
    expect(component.form().dirty()).toBe(false);
  });

  it('should not mutate the input fragment when saving', () => {
    const fr = createFragment();
    setData({ value: fr, thesauri: THESAURI });
    component.form.eid().value.set('changed');
    component.save();
    expect(fr.eid).toBe('e1');
  });

  it('should save a new fragment using identity location', () => {
    fixture.componentRef.setInput('identity', {
      itemId: 'i1',
      partId: 'p1',
      typeId: 'it.vedph.token-text-layer',
      roleId: 'fr.it.vedph.epigraphy.ligatures',
      loc: '2.3',
    });
    fixture.detectChanges();
    const spy = vi.fn();
    component.data.subscribe(spy);

    component.onTypeIdsChange(['lig']);
    component.save();

    const data = spy.mock.calls[0][0] as EditedObject<EpiLigaturesFragment>;
    expect(data.value!.location).toBe('2.3');
    expect(data.value!.types).toEqual(['lig']);
    expect(data.value!.eid).toBeUndefined();
  });

  it('should save from the save button', () => {
    setData({ value: createFragment(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);

    getSaveButton()!.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should disable the save button while the form is invalid', () => {
    expect(component.form().invalid()).toBe(true);
    expect(getSaveButton()!.disabled).toBe(true);
  });

  it('should render no <form>', () => {
    setData({ value: createFragment(), thesauri: THESAURI });
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('should become dirty when typing, and pristine on new data', () => {
    setData({ value: createFragment(), thesauri: THESAURI });
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[matInput]');
    input.value = 'typed';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.form.eid().value()).toBe('typed');
    expect(component.isDirty()).toBe(true);

    setData({ value: createFragment(), thesauri: THESAURI });
    expect(component.form.eid().value()).toBe('e1');
    expect(component.isDirty()).toBe(false);
  });

  it('should stay pristine when flags emit the bound ids', () => {
    setData({ value: createFragment(), thesauri: THESAURI });
    component.onTypeIdsChange(['lig']);
    expect(component.isDirty()).toBe(false);
  });

  it('should save empty optional strings as undefined', () => {
    setData({ value: createFragment(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.form.eid().value.set(' ');
    component.form.groupId().value.set('');
    component.form.note().value.set('  ');
    component.save();
    const fr = (spy.mock.calls[0][0] as EditedObject<EpiLigaturesFragment>)
      .value!;
    expect(fr.eid).toBeUndefined();
    expect(fr.groupId).toBeUndefined();
    expect(fr.note).toBeUndefined();
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
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    expect(!component.form().disabled()).toBe(true);
  });

  it('should update user level when user changes', () => {
    user$.next(null);
    expect(component.userLevel).toBe(0);
  });
});
