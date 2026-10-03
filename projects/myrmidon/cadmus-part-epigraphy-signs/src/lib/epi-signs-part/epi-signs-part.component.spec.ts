import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  MatSnackBar,
  MatSnackBarRef,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';
import { BehaviorSubject, of } from 'rxjs';

import { NgxMonacoEditorComponent } from '@jean-merelis/ngx-monaco-editor';
import {
  NgxMonacoEditorFakeComponent,
  provideMockMonacoEditor,
} from '@jean-merelis/ngx-monaco-editor/testing';
import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { EditedObject, ThesauriSet } from '@myrmidon/cadmus-core';
import { AppRepository } from '@myrmidon/cadmus-state';

import {
  EPI_SIGNS_PART_TYPEID,
  EpiSign,
  EpiSignsPart,
} from '../epi-signs-part';
import { EpiSignComponent } from '../epi-sign/epi-sign.component';
import { EpiSignsPartComponent } from './epi-signs-part.component';

// the form tags the objects in its arrays with an identity Symbol:
// compare their plain data only
function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const THESAURI: ThesauriSet = {
  'epi-signs-measure-names': {
    id: 'epi-signs-measure-names@en',
    language: 'en',
    entries: [{ id: 'height', value: 'height' }],
  },
  'physical-size-units': {
    id: 'physical-size-units@en',
    language: 'en',
    entries: [{ id: 'cm', value: 'cm' }],
  },
  'physical-size-dim-tags': {
    id: 'physical-size-dim-tags@en',
    language: 'en',
    entries: [{ id: 'max', value: 'max' }],
  },
  'epi-signs-features': {
    id: 'epi-signs-features@en',
    language: 'en',
    entries: [
      { id: 'serif', value: 'serif' },
      { id: 'hedera', value: 'hedera' },
    ],
  },
};

function createSigns(): EpiSign[] {
  return [
    { id: 'a', description: 'alpha', features: ['serif', 'hedera'] },
    { id: 'b', description: 'beta' },
    { id: 'c' },
  ];
}

function createPart(): EpiSignsPart {
  return {
    id: 'p1',
    itemId: 'i1',
    typeId: EPI_SIGNS_PART_TYPEID,
    timeCreated: new Date(),
    creatorId: 'zeus',
    timeModified: new Date(),
    userId: 'zeus',
    signs: createSigns(),
  };
}

describe('EpiSignsPartComponent', () => {
  let component: EpiSignsPartComponent;
  let fixture: ComponentFixture<EpiSignsPartComponent>;
  let dialogService: { confirm: ReturnType<typeof vi.fn> };
  let user$: BehaviorSubject<User | null>;

  function setData(data?: EditedObject<EpiSignsPart>): void {
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
  }

  function getRows(): HTMLTableRowElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
  }

  function getChildEditor(): EpiSignComponent | undefined {
    return fixture.debugElement.query(
      (de) => de.componentInstance instanceof EpiSignComponent,
    )?.componentInstance;
  }

  function ids(): string[] {
    return component.form
      .signs()
      .value()
      .map((s) => s.id);
  }

  function spyOnSnackbar() {
    const snackbar = fixture.debugElement.injector.get(MatSnackBar);
    return vi
      .spyOn(snackbar, 'open')
      .mockReturnValue(
        undefined as unknown as MatSnackBarRef<TextOnlySnackBar>,
      );
  }

  beforeEach(async () => {
    dialogService = { confirm: vi.fn().mockReturnValue(of(true)) };
    const user = { userName: 'zeus', roles: ['editor'] } as unknown as User;
    user$ = new BehaviorSubject<User | null>(user);

    await TestBed.configureTestingModule({
      imports: [EpiSignsPartComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockMonacoEditor({
          initializedEvent: {
            editor: { focus: () => {} } as any,
            monaco: {} as any,
          },
        }),
        { provide: DialogService, useValue: dialogService },
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
    })
      .overrideComponent(EpiSignComponent, {
        remove: { imports: [NgxMonacoEditorComponent] },
        add: { imports: [NgxMonacoEditorFakeComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EpiSignsPartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('identity', {
      itemId: 'i1',
      typeId: EPI_SIGNS_PART_TYPEID,
      partId: null,
      roleId: null,
    });
    fixture.detectChanges();
  });

  it('should create with an invalid empty form', () => {
    expect(component).toBeTruthy();
    expect(plain(component.form.signs().value())).toEqual([]);
    expect(component.form().invalid()).toBe(true);
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('should show the default title', () => {
    const title: HTMLElement =
      fixture.nativeElement.querySelector('mat-card-title');
    expect(title.textContent).toContain('Epigraphic Signs Part');
  });

  it('should load thesauri and part from data', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    expect(component.measNameEntries()?.length).toBe(1);
    expect(component.measUnitEntries()?.length).toBe(1);
    expect(component.measDimTagEntries()?.length).toBe(1);
    expect(component.featEntries()?.length).toBe(2);
    expect(plain(component.form.signs().value())).toEqual(createSigns());
    expect(component.form().valid()).toBe(true);
    expect(component.form().dirty()).toBe(false);
  });

  it('should render signs', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const rows = getRows();
    expect(rows.length).toBe(3);
    const cells = Array.from(rows[0].querySelectorAll('td')).map((c) =>
      c.textContent!.trim(),
    );
    expect(cells.slice(1)).toEqual(['a', 'alpha', 'serif, hedera']);
  });

  it('should clear thesauri entries when missing', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    setData({ value: createPart(), thesauri: {} });
    expect(component.measNameEntries()).toBeUndefined();
    expect(component.measUnitEntries()).toBeUndefined();
    expect(component.measDimTagEntries()).toBeUndefined();
    expect(component.featEntries()).toBeUndefined();
  });

  it('should reset form when data has no value', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    setData({ value: null, thesauri: THESAURI });
    expect(plain(component.form.signs().value())).toEqual([]);
  });

  it('should default signs to empty array when missing', () => {
    const part = createPart();
    part.signs = undefined as unknown as EpiSign[];
    setData({ value: part, thesauri: {} });
    expect(plain(component.form.signs().value())).toEqual([]);
  });

  it('should add a new sign', () => {
    component.addSign();
    fixture.detectChanges();
    expect(component.editedIndex()).toBe(-1);
    expect(component.edited()).toEqual({ id: '' });
    expect(getChildEditor()).toBeTruthy();
  });

  it('should edit a copy of a sign', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editSign(component.form.signs().value()[1], 1);
    fixture.detectChanges();
    expect(component.editedIndex()).toBe(1);
    expect(component.edited()).toEqual(createSigns()[1]);
    expect(component.edited()).not.toBe(component.form.signs().value()[1]);
    expect(getRows()[1].classList.contains('selected')).toBe(true);
    const editor = getChildEditor()!;
    expect(editor.form.id().value()).toBe('b');
    expect(editor.featEntries()).toEqual(
      THESAURI['epi-signs-features'].entries,
    );
  });

  it('should close edited sign on child cancel', () => {
    component.addSign();
    fixture.detectChanges();
    getChildEditor()!.cancel();
    fixture.detectChanges();
    expect(component.edited()).toBeUndefined();
    expect(component.editedIndex()).toBe(-1);
    expect(getChildEditor()).toBeUndefined();
  });

  it('should append a new sign', () => {
    const spy = vi.fn();
    component.dirtyChange.subscribe(spy);
    component.addSign();
    component.saveSign({ id: 'x' });
    expect(plain(component.form.signs().value())).toEqual([{ id: 'x' }]);
    expect(component.form.signs().dirty()).toBe(true);
    expect(component.form().valid()).toBe(true);
    expect(component.edited()).toBeUndefined();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should reject a new sign with the ID of another sign', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const open = spyOnSnackbar();
    component.addSign();
    component.saveSign({ id: 'b', description: 'new beta' });
    expect(plain(component.form.signs().value())).toEqual(createSigns());
    expect(component.form().dirty()).toBe(false);
    expect(open).toHaveBeenCalledOnce();
    expect(open.mock.calls[0][0]).toContain('"b" already exists');
    // the editor stays open, to let the user change the ID
    expect(component.edited()).toEqual({ id: '' });
    expect(component.editedIndex()).toBe(-1);
  });

  it('should reject an edited sign given the ID of another sign', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const open = spyOnSnackbar();
    component.editSign(component.form.signs().value()[2], 2);
    component.saveSign({ id: 'a' });
    expect(plain(component.form.signs().value())).toEqual(createSigns());
    expect(open).toHaveBeenCalledOnce();
    expect(component.editedIndex()).toBe(2);
    expect(component.edited()).toBeTruthy();
  });

  it('should save an edited sign keeping its own ID', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const open = spyOnSnackbar();
    component.editSign(component.form.signs().value()[1], 1);
    component.saveSign({ id: 'b', description: 'new beta' });
    expect(ids()).toEqual(['a', 'b', 'c']);
    expect(component.form.signs().value()[1].description).toBe('new beta');
    expect(open).not.toHaveBeenCalled();
  });

  it('should let the user fix a rejected ID in the child editor', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const open = spyOnSnackbar();
    component.addSign();
    fixture.detectChanges();
    const editor = getChildEditor()!;
    editor.form.id().value.set('a');
    editor.form.id().markAsDirty();
    editor.save();
    fixture.detectChanges();
    expect(open).toHaveBeenCalledOnce();
    expect(ids()).toEqual(['a', 'b', 'c']);
    expect(getChildEditor()).toBe(editor);
    expect(editor.form.id().value()).toBe('a');

    editor.form.id().value.set('d');
    editor.form.id().markAsDirty();
    editor.save();
    fixture.detectChanges();
    expect(ids()).toEqual(['a', 'b', 'c', 'd']);
    expect(getChildEditor()).toBeUndefined();
    expect(open).toHaveBeenCalledOnce();
  });

  it('should replace an edited sign', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editSign(component.form.signs().value()[1], 1);
    component.saveSign({ id: 'z' });
    expect(ids()).toEqual(['a', 'z', 'c']);
    expect(component.editedIndex()).toBe(-1);
  });

  it('should save sign from child editor', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editSign(component.form.signs().value()[2], 2);
    fixture.detectChanges();
    const editor = getChildEditor()!;
    editor.form.description().value.set('gamma');
    editor.save();
    fixture.detectChanges();
    expect(plain(component.form.signs().value()[2])).toEqual({
      id: 'c',
      features: undefined,
      description: 'gamma',
      measurements: undefined,
    });
    expect(getChildEditor()).toBeUndefined();
  });

  it('should delete a sign after confirmation', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.deleteSign(1);
    expect(dialogService.confirm).toHaveBeenCalled();
    expect(ids()).toEqual(['a', 'c']);
    expect(component.form.signs().dirty()).toBe(true);
  });

  it('should not delete a sign without confirmation', () => {
    dialogService.confirm.mockReturnValue(of(false));
    setData({ value: createPart(), thesauri: THESAURI });
    component.deleteSign(1);
    expect(ids()).toEqual(['a', 'b', 'c']);
  });

  it('should close the editor when deleting the edited sign', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editSign(component.form.signs().value()[1], 1);
    component.deleteSign(1);
    expect(component.edited()).toBeUndefined();
  });

  it('should keep edited sign when deleting a previous sign', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editSign(component.form.signs().value()[2], 2);
    component.deleteSign(0);
    expect(component.editedIndex()).toBe(1);
    // rename the edited sign so that it is not matched by ID
    component.saveSign({ id: 'c2' });
    expect(ids()).toEqual(['b', 'c2']);
  });

  it('should move signs up and down', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.moveSignUp(0);
    expect(ids()).toEqual(['a', 'b', 'c']);
    expect(component.form.signs().dirty()).toBe(false);
    component.moveSignDown(2);
    expect(ids()).toEqual(['a', 'b', 'c']);

    component.moveSignUp(2);
    expect(ids()).toEqual(['a', 'c', 'b']);
    component.moveSignDown(0);
    expect(ids()).toEqual(['c', 'a', 'b']);
    expect(component.form.signs().dirty()).toBe(true);
  });

  it('should keep edited sign when moving signs', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editSign(component.form.signs().value()[1], 1);
    component.moveSignUp(1);
    expect(component.editedIndex()).toBe(0);
    component.moveSignDown(1);
    expect(component.editedIndex()).toBe(0);
    component.moveSignDown(0);
    expect(component.editedIndex()).toBe(1);
    component.moveSignUp(2);
    expect(component.editedIndex()).toBe(2);
    expect(ids()).toEqual(['c', 'a', 'b']);
    component.saveSign({ id: 'b2' });
    expect(ids()).toEqual(['c', 'a', 'b2']);
  });

  it('should invoke row actions from buttons', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    let buttons = getRows()[1].querySelectorAll('button');
    expect(getRows()[0].querySelectorAll('button')[1].disabled).toBe(true);
    expect(getRows()[2].querySelectorAll('button')[2].disabled).toBe(true);
    buttons[0].click();
    expect(component.editedIndex()).toBe(1);
    buttons[1].click();
    expect(ids()).toEqual(['b', 'a', 'c']);
    fixture.detectChanges();
    getRows()[0].querySelectorAll('button')[2].click();
    expect(ids()).toEqual(['a', 'b', 'c']);
    fixture.detectChanges();
    buttons = getRows()[2].querySelectorAll('button');
    buttons[3].click();
    expect(ids()).toEqual(['a', 'b']);
  });

  it('should save edited part', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.moveSignDown(0);
    component.save();
    const part = (spy.mock.calls[0][0] as EditedObject<EpiSignsPart>).value!;
    expect(part.id).toBe('p1');
    expect(part.signs.map((s) => s.id)).toEqual(['b', 'a', 'c']);
  });

  it('should save a new part using identity', () => {
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.saveSign({ id: 'x' });
    component.save();
    const part = (spy.mock.calls[0][0] as EditedObject<EpiSignsPart>).value!;
    expect(part.itemId).toBe('i1');
    expect(part.typeId).toBe(EPI_SIGNS_PART_TYPEID);
    expect(part.signs).toEqual([{ id: 'x' }]);
  });

  it('should not save without signs', () => {
    const spy = vi.fn();
    component.data.subscribe(spy);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    component.save();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should save a model whose signs carry no Symbol tags', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);
    expect(
      Object.getOwnPropertySymbols(component.form.signs().value()[0]).length,
    ).toBeGreaterThan(0);

    component.moveSignDown(0);
    component.save();

    const part = (spy.mock.calls[0][0] as EditedObject<EpiSignsPart>).value!;
    for (const sign of part.signs) {
      expect(Object.getOwnPropertySymbols(sign)).toEqual([]);
    }
  });

  it('should not tag or change the signs of the bound part', () => {
    const part = createPart();
    setData({ value: part, thesauri: THESAURI });
    component.editSign(component.form.signs().value()[0], 0);
    expect(Object.getOwnPropertySymbols(component.edited()!)).toEqual([]);
    component.saveSign({ id: 'a', description: 'changed' });
    component.save();
    expect(part.signs).toEqual(createSigns());
    for (const sign of part.signs) {
      expect(Object.getOwnPropertySymbols(sign)).toEqual([]);
    }
  });

  it('should stay pristine when data is bound, and when it is bound again', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    expect(component.isDirty()).toBe(false);
    component.moveSignDown(0);
    expect(component.isDirty()).toBe(true);
    setData({ value: createPart(), thesauri: THESAURI });
    expect(component.isDirty()).toBe(false);
  });

  it('should render no <form>, also with the child editor open', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editSign(component.form.signs().value()[0], 0);
    fixture.detectChanges();
    expect(getChildEditor()).toBeTruthy();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('should not save the part on Enter in the child editor', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.editSign(component.form.signs().value()[1], 1);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      'cadmus-epi-sign input[matInput]',
    );
    input.value = 'b2';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();

    // the child saved its sign into the part, which was not saved
    expect(component.form.signs().value()[1].id).toBe('b2');
    expect(component.edited()).toBeUndefined();
    expect(spy).not.toHaveBeenCalled();
    expect(component.isDirty()).toBe(true);
  });
});
