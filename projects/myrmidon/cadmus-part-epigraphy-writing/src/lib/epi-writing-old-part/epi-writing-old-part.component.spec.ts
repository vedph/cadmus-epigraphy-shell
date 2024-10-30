import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiWritingOldPartComponent } from './epi-writing-old-part.component';

describe('EpiWritingOldPartComponent', () => {
  let component: EpiWritingOldPartComponent;
  let fixture: ComponentFixture<EpiWritingOldPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EpiWritingOldPartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EpiWritingOldPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
