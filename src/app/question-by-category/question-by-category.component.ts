import { Component, Input, OnChanges, OnInit, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../services/userService';
import { Question } from '../models/questions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-question-by-category',
  templateUrl: './question-by-category.component.html',
  styleUrls: ['./question-by-category.component.css']
})
export class QuestionByCategoryComponent implements OnChanges, OnInit {
  @Input() categoryId: string | null = null;
  questions: Question[] = [];
  p: number = 1;
  selectedOptions: { [questionId: string]: string[] } = {};
  selectedItems: string[] = [];
  correctSequence: string[] = [];
  correctSequenceParts: string[] = [];
  connectedDropLists: string[] = [];

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] && this.categoryId) {
      this.loadQuestions();
      this.p = 1;
    }
  }

  loadQuestions(): void {
    if (this.categoryId) {
      this.userService.getQuestionsByCategory(this.categoryId).subscribe(
        (data: Question[]) => {
          this.questions = data;
          this.initializeDragAndDropQuestions();
        },
        error => {
          this.snackBar.open('Failed to load questions', 'Close', { duration: 3000 });
        }
      );
    }
  }

  initializeDragAndDropQuestions(): void {
    this.questions.forEach((question) => {
      if (question.type === 'dragAndDrop') {
        this.correctSequence = question.dragAndDropData?.correctSequence || [];
        this.selectedItems = new Array(this.correctSequence.length).fill('');

        // Split the correct sequence into parts (placeholders and regular text)
        this.correctSequenceParts = this.splitCorrectSequence(this.correctSequence.join(' '));
        this.connectedDropLists = this.correctSequenceParts.map((_, index) => 'placeholder-' + index);

      }
    });
  }

  // Split the sequence into parts with placeholders
  splitCorrectSequence(sequence: string): string[] {
    // Regex to match placeholders like [[1]], [[2]]
    return sequence.split(/(\[\[\d+\]\])/);
  }

  // Check if a part is a placeholder
  isPlaceholder(part: string): boolean {
    return /\[\[\d+\]\]/.test(part);
  }



 
 
  


  drop(event: CdkDragDrop<string[]>, index: number): void {
    // Set the selected item into the placeholder
    this.selectedItems[index] = event.item.element.nativeElement.innerText.trim();
    
    // Update the correct sequence after the drop
    this.updateCorrectSequence();
    
    // Optionally, send the updated sequence to the backend for saving
    this.saveUpdatedSequence();
  }

  // Update the correct sequence based on the current selected items
  updateCorrectSequence(): void {
    // Combine the selected items and static text parts to form the updated correct sequence
    this.correctSequence = this.correctSequenceParts.map((part, idx) => {
      return this.isPlaceholder(part) ? (this.selectedItems[idx] || part) : part;
    });
    console.log("Updated correct sequence:", this.correctSequence.join(' '));
  }

  // Simulate saving the updated sequence (you can replace this with an actual API call)
  saveUpdatedSequence(): void {
    // Here you would typically send this.correctSequence to your backend service to save it
    console.log("Saving updated sequence:", this.correctSequence);
    // Example: this.userService.saveUpdatedSequence(this.correctSequence).subscribe();
  }









  












  onSingleChoiceSelected(questionId: string, selectedOption: string): void {
    this.selectedOptions[questionId] = [selectedOption];
    console.log('Selected option:', this.selectedOptions);
  }

  onMultipleChoiceSelectionChange(questionId: string, selectedOption: string): void {
    if (!this.selectedOptions[questionId]) {
      this.selectedOptions[questionId] = [];
    }

    const optionsArray = this.selectedOptions[questionId];
    const optionIndex = optionsArray.indexOf(selectedOption);

    if (optionIndex === -1) {
      optionsArray.push(selectedOption);
    } else {
      optionsArray.splice(optionIndex, 1);
    }

    this.selectedOptions[questionId] = optionsArray;
    console.log('Selected options:', this.selectedOptions);
  }

  isOptionSelected(questionId: string, option: string): boolean {
    const optionsArray = this.selectedOptions[questionId];
    return optionsArray ? optionsArray.includes(option) : false;
  }
}
