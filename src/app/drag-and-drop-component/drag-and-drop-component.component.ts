import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { UserService } from '../services/userService';
import { ActivatedRoute, Router } from '@angular/router';
import { DragAndDropData, Question } from '../models/questions';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-drag-and-drop-component',
  templateUrl: './drag-and-drop-component.component.html',
  styleUrls: ['./drag-and-drop-component.component.css']
})
export class DragAndDropComponentComponent implements OnInit {
  questionForm: FormGroup;
  id: string | null = null;
  question: Question | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.questionForm = this.fb.group({
      questionName: ['', Validators.required],
      questionText: ['', Validators.required],
      questionContent: ['', Validators.required],
      draggableItems: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required)
      ])
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.getQuestionsById(this.id);
    }
  }

  getQuestionsById(id: string): void {
    this.userService.getQuestionsbyId(id).subscribe(
      (data: Question) => {
        this.question = data;
        this.populateForm(data);
       },
      (error) => {
        console.error('Error fetching questions:', error);
      }
    );
  }

  populateForm(question: Question): void {
    this.questionForm.patchValue({
      questionName: question.name,
      questionText: question.text,
      questionContent: question.dragAndDropData?.correctSequence.join('\n')
    });

    // Clear existing items and add fetched ones
    this.draggableItems.clear();
    question.dragAndDropData?.draggableItems.forEach(item => {
      this.draggableItems.push(this.fb.control(item, Validators.required));
    });
  }

  get draggableItems() {
    return this.questionForm.get('draggableItems') as FormArray;
  }

  addDraggableItem() {
    this.draggableItems.push(this.fb.control('', Validators.required));
  }

  removeDraggableItem(index: number) {
    this.draggableItems.removeAt(index);
  }

  onSubmit() {
    if (this.questionForm.valid && this.id) {
      // Create a partial update object
      const updatedFields: Partial<Question> = {};
  
      // Extract and log form values for debugging
      const questionName = this.questionForm.value.questionName;
      const questionText = this.questionForm.value.questionText;
      const correctSequence = this.questionForm.value.questionContent.split('\n');
      const draggableItems = this.questionForm.value.draggableItems;
  
      console.log('Form Values:', { questionName, questionText, correctSequence, draggableItems });
  
      if (questionName) {
        updatedFields.name = questionName;
      }
  
      if (questionText) {
        updatedFields.text = questionText;
      }
  
      // Handle dragAndDropData updates conditionally
      const dragAndDropData: Partial<DragAndDropData> = {};
  
      if (correctSequence && correctSequence.length > 0) {
        dragAndDropData.correctSequence = correctSequence;
      }
  
      if (draggableItems && draggableItems.length > 0) {
        dragAndDropData.draggableItems = draggableItems;
      }
  
      if (Object.keys(dragAndDropData).length > 0) {
        updatedFields.dragAndDropData = dragAndDropData as DragAndDropData;
      }
  
       console.log('Updated Fields:', updatedFields);
  
       if (Object.keys(updatedFields).length > 0) {
        this.userService.updateDragAndDropQuestion(this.id, updatedFields).subscribe(
          (response) => {
             this.snackBar.open('Question updated successfully!', 'Close', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            });
           },
          (error) => {
            console.error('Error updating question:', error);
            this.snackBar.open('Failed to update question.', 'Close', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['snackbar-error']
            });
          }
        );
      } else {
        this.snackBar.open('No changes detected.', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-info']
        });
      }
    } else {
      this.snackBar.open('Please fill out the form correctly.', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        panelClass: ['snackbar-warning']
      });
    }
  }
}
