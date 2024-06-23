import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiSupportFrComponent } from './epi-support-fr.component';

describe('EpiSupportFrComponent', () => {
  let component: EpiSupportFrComponent;
  let fixture: ComponentFixture<EpiSupportFrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiSupportFrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiSupportFrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
