import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiScriptsPartComponent } from './epi-scripts-part.component';

describe('EpiScriptsPartComponent', () => {
  let component: EpiScriptsPartComponent;
  let fixture: ComponentFixture<EpiScriptsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpiScriptsPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiScriptsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
