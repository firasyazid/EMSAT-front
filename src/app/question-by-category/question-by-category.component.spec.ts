import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionByCategoryComponent } from './question-by-category.component';

describe('QuestionByCategoryComponent', () => {
  let component: QuestionByCategoryComponent;
  let fixture: ComponentFixture<QuestionByCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionByCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionByCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
