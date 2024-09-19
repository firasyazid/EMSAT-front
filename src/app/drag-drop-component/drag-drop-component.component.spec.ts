import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragDropComponentComponent } from './drag-drop-component.component';

describe('DragDropComponentComponent', () => {
  let component: DragDropComponentComponent;
  let fixture: ComponentFixture<DragDropComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DragDropComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DragDropComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
