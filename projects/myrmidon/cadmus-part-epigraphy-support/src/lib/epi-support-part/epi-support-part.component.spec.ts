import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiSupportPartComponent } from './epi-support-part.component';

describe('EpiSupportPartComponent', () => {
  let component: EpiSupportPartComponent;
  let fixture: ComponentFixture<EpiSupportPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiSupportPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiSupportPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
