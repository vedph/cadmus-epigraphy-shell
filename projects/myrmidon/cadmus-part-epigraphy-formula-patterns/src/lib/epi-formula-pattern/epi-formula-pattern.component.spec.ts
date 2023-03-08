import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiFormulaPatternComponent } from './epi-formula-pattern.component';

describe('EpiFormulaPatternComponent', () => {
  let component: EpiFormulaPatternComponent;
  let fixture: ComponentFixture<EpiFormulaPatternComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpiFormulaPatternComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiFormulaPatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
