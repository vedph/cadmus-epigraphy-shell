import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiSupportOldPartComponent } from './epi-support-old-part.component';

describe('EpiSupportOldPartComponent', () => {
  let component: EpiSupportOldPartComponent;
  let fixture: ComponentFixture<EpiSupportOldPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpiSupportOldPartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiSupportOldPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
