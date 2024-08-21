import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamComponentComponent } from './exam-component.component';

describe('ExamComponentComponent', () => {
  let component: ExamComponentComponent;
  let fixture: ComponentFixture<ExamComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExamComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
