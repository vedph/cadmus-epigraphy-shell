import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject, of } from 'rxjs';

import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { EditedObject, ThesauriSet } from '@myrmidon/cadmus-core';
import { AppRepository } from '@myrmidon/cadmus-state';

import {
  EPI_SCRIPTS_PART_TYPEID,
  EpiScript,
  EpiScriptsPart,
} from '../epi-scripts-part';
import { EpiScriptComponent } from '../epi-script/epi-script.component';
import { EpiScriptsPartComponent } from './epi-scripts-part.component';

// the form tags the objects in its arrays with an identity Symbol:
// compare their plain data only
function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const THESAURI: ThesauriSet = {
  'epi-script-systems': {
    id: 'epi-script-systems@en',
    language: 'en',
    entries: [
      { id: 'lat', value: 'Latin' },
      { id: 'grc', value: 'Greek' },
    ],
  },
  'epi-scripts': {
    id: 'epi-scripts@en',
    language: 'en',
    entries: [
      { id: 'cap', value: 'capitalis' },
      { id: 'unc', value: 'uncialis' },
    ],
  },
  'epi-script-casings': {
    id: 'epi-script-casings@en',
    language: 'en',
    entries: [{ id: 'upper', value: 'upper' }],
  },
  'epi-script-features': {
    id: 'epi-script-features@en',
    language: 'en',
    entries: [{ id: 'serif', value: 'serif' }],
  },
};

function createScripts(): EpiScript[] {
  return [
    { system: 'lat', script: 'cap', casing: 'upper' },
    { system: 'grc', script: 'unc' },
    { script: 'x' },
  ];
}

function createPart(): EpiScriptsPart {
  return {
    id: 'p1',
    itemId: 'i1',
    typeId: EPI_SCRIPTS_PART_TYPEID,
    timeCreated: new Date(),
    creatorId: 'zeus',
    timeModified: new Date(),
    userId: 'zeus',
    scripts: createScripts(),
  };
}

describe('EpiScriptsPartComponent', () => {
  let component: EpiScriptsPartComponent;
  let fixture: ComponentFixture<EpiScriptsPartComponent>;
  let dialogService: { confirm: ReturnType<typeof vi.fn> };
  let user$: BehaviorSubject<User | null>;

  function setData(data?: EditedObject<EpiScriptsPart>): void {
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
  }

  function getRows(): HTMLTableRowElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
  }

  function getChildEditor(): EpiScriptComponent | undefined {
    return fixture.debugElement.query(
      (de) => de.componentInstance instanceof EpiScriptComponent,
    )?.componentInstance;
  }

  beforeEach(async () => {
    dialogService = { confirm: vi.fn().mockReturnValue(of(true)) };
    const user = { userName: 'zeus', roles: ['editor'] } as unknown as User;
    user$ = new BehaviorSubject<User | null>(user);

    await TestBed.configureTestingModule({
      imports: [EpiScriptsPartComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
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
    }).compileComponents();

    fixture = TestBed.createComponent(EpiScriptsPartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('identity', {
      itemId: 'i1',
      typeId: EPI_SCRIPTS_PART_TYPEID,
      partId: null,
      roleId: null,
    });
    fixture.detectChanges();
  });

  it('should create with an invalid empty form', () => {
    expect(component).toBeTruthy();
    expect(plain(component.form.scripts().value())).toEqual([]);
    expect(component.form().invalid()).toBe(true);
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
    expect(component.userLevel).toBe(3);
  });

  it('should show the default title', () => {
    const title: HTMLElement =
      fixture.nativeElement.querySelector('mat-card-title');
    expect(title.textContent).toContain('Epigraphic Scripts Part');
  });

  it('should load thesauri and part from data', () => {
    setData({ value: createPart(), thesauri: THESAURI });

    expect(component.systemEntries()?.length).toBe(2);
    expect(component.scriptEntries()?.length).toBe(2);
    expect(component.casingEntries()?.length).toBe(1);
    expect(component.featEntries()?.length).toBe(1);
    expect(plain(component.form.scripts().value())).toEqual(createScripts());
    expect(component.form().valid()).toBe(true);
    expect(component.form().dirty()).toBe(false);
  });

  it('should render scripts with looked up values', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const rows = getRows();
    expect(rows.length).toBe(3);
    const cells = Array.from(rows[0].querySelectorAll('td')).map((c) =>
      c.textContent!.trim(),
    );
    expect(cells.slice(1)).toEqual(['Latin', 'capitalis', 'upper']);
  });

  it('should clear thesauri entries when missing', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    setData({ value: createPart(), thesauri: {} });
    expect(component.systemEntries()).toBeUndefined();
    expect(component.scriptEntries()).toBeUndefined();
    expect(component.casingEntries()).toBeUndefined();
    expect(component.featEntries()).toBeUndefined();
  });

  it('should reset form when data has no value', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    setData({ value: null, thesauri: THESAURI });
    expect(plain(component.form.scripts().value())).toEqual([]);
  });

  it('should default scripts to empty array when missing', () => {
    const part = createPart();
    part.scripts = undefined as unknown as EpiScript[];
    setData({ value: part, thesauri: {} });
    expect(plain(component.form.scripts().value())).toEqual([]);
  });

  it('should add a new script defaulting to first script entry', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.addScript();
    fixture.detectChanges();
    expect(component.editedIndex()).toBe(-1);
    expect(component.edited()).toEqual({ script: 'cap' });
    expect(getChildEditor()).toBeTruthy();
  });

  it('should add a new script with empty script without thesaurus', () => {
    component.addScript();
    expect(component.edited()).toEqual({ script: '' });
  });

  it('should edit a copy of a script', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editScript(component.form.scripts().value()[1], 1);
    fixture.detectChanges();

    expect(component.editedIndex()).toBe(1);
    expect(component.edited()).toEqual(createScripts()[1]);
    expect(component.edited()).not.toBe(component.form.scripts().value()[1]);
    expect(getRows()[1].classList.contains('selected')).toBe(true);
    const editor = getChildEditor()!;
    expect(editor.form.script().value()).toBe('unc');
    expect(editor.systemEntries()).toEqual(THESAURI['epi-script-systems'].entries);
  });

  it('should close edited script', () => {
    component.addScript();
    component.closeScript();
    fixture.detectChanges();
    expect(component.edited()).toBeUndefined();
    expect(component.editedIndex()).toBe(-1);
    expect(getChildEditor()).toBeUndefined();
  });

  it('should close edited script on child cancel', () => {
    component.addScript();
    fixture.detectChanges();
    getChildEditor()!.cancel();
    fixture.detectChanges();
    expect(component.edited()).toBeUndefined();
  });

  it('should append a new script', () => {
    const spy = vi.fn();
    component.dirtyChange.subscribe(spy);
    component.addScript();
    component.saveScript({ script: 'new' });

    expect(plain(component.form.scripts().value())).toEqual([{ script: 'new' }]);
    expect(component.form.scripts().dirty()).toBe(true);
    expect(component.form().valid()).toBe(true);
    expect(component.edited()).toBeUndefined();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should replace an edited script', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editScript(component.form.scripts().value()[1], 1);
    component.saveScript({ script: 'replaced' });

    expect(component.form.scripts().value().length).toBe(3);
    expect(plain(component.form.scripts().value()[1])).toEqual({ script: 'replaced' });
    expect(component.editedIndex()).toBe(-1);
  });

  it('should save script from child editor', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editScript(component.form.scripts().value()[0], 0);
    fixture.detectChanges();

    const editor = getChildEditor()!;
    editor.form.note().value.set('note');
    editor.save();
    fixture.detectChanges();

    expect(plain(component.form.scripts().value()[0])).toEqual({
      system: 'lat',
      script: 'cap',
      casing: 'upper',
      features: undefined,
      note: 'note',
    });
    expect(getChildEditor()).toBeUndefined();
  });

  it('should delete a script after confirmation', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.deleteScript(1);
    expect(dialogService.confirm).toHaveBeenCalled();
    expect(plain(component.form.scripts().value())).toEqual([
      createScripts()[0],
      createScripts()[2],
    ]);
    expect(component.form.scripts().dirty()).toBe(true);
  });

  it('should not delete a script without confirmation', () => {
    dialogService.confirm.mockReturnValue(of(false));
    setData({ value: createPart(), thesauri: THESAURI });
    component.deleteScript(1);
    expect(component.form.scripts().value().length).toBe(3);
  });

  it('should close the editor when deleting the edited script', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editScript(component.form.scripts().value()[1], 1);
    component.deleteScript(1);
    expect(component.edited()).toBeUndefined();
    expect(component.editedIndex()).toBe(-1);
  });

  it('should keep edited script when deleting a previous script', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editScript(component.form.scripts().value()[2], 2);
    component.deleteScript(0);
    expect(component.editedIndex()).toBe(1);

    component.saveScript({ script: 'y' });
    expect(plain(component.form.scripts().value())).toEqual([
      createScripts()[1],
      { script: 'y' },
    ]);
  });

  it('should keep edited script when deleting a following script', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editScript(component.form.scripts().value()[0], 0);
    component.deleteScript(2);
    expect(component.editedIndex()).toBe(0);
  });

  it('should move scripts up', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const scripts = createScripts();
    component.moveScriptUp(0);
    expect(plain(component.form.scripts().value())).toEqual(scripts);
    expect(component.form.scripts().dirty()).toBe(false);

    component.moveScriptUp(2);
    expect(plain(component.form.scripts().value())).toEqual([
      scripts[0],
      scripts[2],
      scripts[1],
    ]);
    expect(component.form.scripts().dirty()).toBe(true);
  });

  it('should move scripts down', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const scripts = createScripts();
    component.moveScriptDown(2);
    expect(plain(component.form.scripts().value())).toEqual(scripts);

    component.moveScriptDown(0);
    expect(plain(component.form.scripts().value())).toEqual([
      scripts[1],
      scripts[0],
      scripts[2],
    ]);
    expect(component.form.scripts().dirty()).toBe(true);
  });

  it('should keep edited script when moving scripts', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editScript(component.form.scripts().value()[1], 1);

    // moving the edited script itself
    component.moveScriptUp(1);
    expect(component.editedIndex()).toBe(0);
    component.moveScriptDown(0);
    expect(component.editedIndex()).toBe(1);

    // moving a neighbor of the edited script
    component.moveScriptDown(0);
    expect(component.editedIndex()).toBe(0);
    component.moveScriptUp(1);
    expect(component.editedIndex()).toBe(1);

    // moving unrelated scripts
    component.moveScriptDown(2);
    expect(component.editedIndex()).toBe(1);

    component.saveScript({ script: 'edited' });
    expect(plain(component.form.scripts().value()[1])).toEqual({ script: 'edited' });
  });

  it('should disable move buttons for first and last rows', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const rows = getRows();
    const firstButtons = rows[0].querySelectorAll('button');
    const lastButtons = rows[2].querySelectorAll('button');
    expect(firstButtons[1].disabled).toBe(true);
    expect(firstButtons[2].disabled).toBe(false);
    expect(lastButtons[1].disabled).toBe(false);
    expect(lastButtons[2].disabled).toBe(true);
  });

  it('should invoke row actions from buttons', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const buttons = getRows()[1].querySelectorAll('button');
    buttons[0].click();
    expect(component.editedIndex()).toBe(1);
    buttons[1].click();
    expect(plain(component.form.scripts().value()[0])).toEqual(createScripts()[1]);
    fixture.detectChanges();
    getRows()[0].querySelectorAll('button')[2].click();
    expect(plain(component.form.scripts().value()[1])).toEqual(createScripts()[1]);
    fixture.detectChanges();
    getRows()[1].querySelectorAll('button')[3].click();
    expect(component.form.scripts().value().length).toBe(2);
  });

  it('should save edited part', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);

    component.moveScriptDown(0);
    component.save();

    const part = (spy.mock.calls[0][0] as EditedObject<EpiScriptsPart>)
      .value!;
    expect(part.id).toBe('p1');
    expect(part.scripts.map((s) => s.script)).toEqual(['unc', 'cap', 'x']);
    expect(component.form().dirty()).toBe(false);
  });

  it('should save a new part using identity', () => {
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.saveScript({ script: 'cap' });
    component.save();

    const part = (spy.mock.calls[0][0] as EditedObject<EpiScriptsPart>)
      .value!;
    expect(part.itemId).toBe('i1');
    expect(part.typeId).toBe(EPI_SCRIPTS_PART_TYPEID);
    expect(part.scripts).toEqual([{ script: 'cap' }]);
  });

  it('should not save without scripts', () => {
    const spy = vi.fn();
    component.data.subscribe(spy);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    component.save();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should save a model whose scripts carry no Symbol tags', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    const spy = vi.fn();
    component.data.subscribe(spy);
    // the form's own objects are tagged...
    expect(
      Object.getOwnPropertySymbols(component.form.scripts().value()[0]).length,
    ).toBeGreaterThan(0);

    component.moveScriptDown(0);
    component.save();

    // ...but the saved ones are not
    const part = (spy.mock.calls[0][0] as EditedObject<EpiScriptsPart>)
      .value!;
    for (const script of part.scripts) {
      expect(Object.getOwnPropertySymbols(script)).toEqual([]);
    }
  });

  it('should not tag or change the scripts of the bound part', () => {
    const part = createPart();
    setData({ value: part, thesauri: THESAURI });
    component.editScript(component.form.scripts().value()[0], 0);
    component.saveScript({ script: 'changed' });
    component.save();
    expect(part.scripts).toEqual(createScripts());
    for (const script of part.scripts) {
      expect(Object.getOwnPropertySymbols(script)).toEqual([]);
    }
  });

  it('should pass the child editor a script with no Symbol tags', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editScript(component.form.scripts().value()[0], 0);
    expect(Object.getOwnPropertySymbols(component.edited()!)).toEqual([]);
  });

  it('should stay pristine when data is bound, and when it is bound again', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    expect(component.isDirty()).toBe(false);
    component.moveScriptDown(0);
    expect(component.isDirty()).toBe(true);
    setData({ value: createPart(), thesauri: THESAURI });
    expect(component.isDirty()).toBe(false);
  });

  it('should render no <form>, also with the child editor open', () => {
    setData({ value: createPart(), thesauri: THESAURI });
    component.editScript(component.form.scripts().value()[0], 0);
    fixture.detectChanges();
    expect(getChildEditor()).toBeTruthy();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('should not save the part on Enter in the child editor', () => {
    // no thesauri: the child editor has free text inputs
    setData({ value: createPart(), thesauri: {} });
    const spy = vi.fn();
    component.data.subscribe(spy);
    component.editScript(component.form.scripts().value()[0], 0);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      'cadmus-epi-script input',
    );
    input.value = 'grc';
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

    // the child saved its script into the part, which was not saved
    expect(plain(component.form.scripts().value()[0]).system).toBe('grc');
    expect(component.edited()).toBeUndefined();
    expect(spy).not.toHaveBeenCalled();
    expect(component.isDirty()).toBe(true);
  });

  it('should emit editorClose on close', () => {
    const spy = vi.fn();
    component.editorClose.subscribe(spy);
    component.close();
    expect(spy).toHaveBeenCalled();
  });
});
