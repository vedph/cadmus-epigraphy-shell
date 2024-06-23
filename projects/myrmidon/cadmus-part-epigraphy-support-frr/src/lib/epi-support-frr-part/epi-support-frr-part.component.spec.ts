import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiSupportFrrPartComponent } from './epi-support-frr-part.component';

describe('EpiSupportFrrPartComponent', () => {
  let component: EpiSupportFrrPartComponent;
  let fixture: ComponentFixture<EpiSupportFrrPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiSupportFrrPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiSupportFrrPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
