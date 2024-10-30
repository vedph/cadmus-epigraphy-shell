import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiTechniquePartComponent } from './epi-technique-part.component';

describe('EpiTechniquePartComponent', () => {
  let component: EpiTechniquePartComponent;
  let fixture: ComponentFixture<EpiTechniquePartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiTechniquePartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiTechniquePartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
