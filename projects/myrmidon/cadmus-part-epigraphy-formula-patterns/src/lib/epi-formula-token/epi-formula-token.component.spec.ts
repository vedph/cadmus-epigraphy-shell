import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiFormulaTokenComponent } from './epi-formula-token.component';

describe('EpiFormulaTokenComponent', () => {
  let component: EpiFormulaTokenComponent;
  let fixture: ComponentFixture<EpiFormulaTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [EpiFormulaTokenComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(EpiFormulaTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
