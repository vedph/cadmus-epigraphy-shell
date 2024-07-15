import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiSupportFrCellMappingComponent } from './epi-support-fr-cell-mapping.component';

describe('EpiSupportFrCellMappingComponent', () => {
  let component: EpiSupportFrCellMappingComponent;
  let fixture: ComponentFixture<EpiSupportFrCellMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiSupportFrCellMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiSupportFrCellMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
