import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiScriptComponent } from './epi-script.component';

describe('EpiScriptComponent', () => {
  let component: EpiScriptComponent;
  let fixture: ComponentFixture<EpiScriptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiScriptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiScriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
