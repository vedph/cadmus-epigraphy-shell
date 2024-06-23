import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiSignsPartComponent } from './epi-signs-part.component';

describe('EpiSignsPartComponent', () => {
  let component: EpiSignsPartComponent;
  let fixture: ComponentFixture<EpiSignsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiSignsPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiSignsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
