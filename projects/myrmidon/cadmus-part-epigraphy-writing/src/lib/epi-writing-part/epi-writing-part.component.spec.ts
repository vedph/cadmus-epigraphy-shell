import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiWritingPartComponent } from './epi-writing-part.component';

describe('EpiWritingPartComponent', () => {
  let component: EpiWritingPartComponent;
  let fixture: ComponentFixture<EpiWritingPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiWritingPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiWritingPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
