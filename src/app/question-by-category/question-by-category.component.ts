import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UserService } from '../services/userService';
import { Question } from '../models/questions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

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

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadQuestions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] && this.categoryId) {
      this.loadQuestions();
    }
  }

 
  onDrop(event: CdkDragDrop<string[]>): void {
    const previousData = event.previousContainer.data; // Already ensured as `string[]`
    const currentData = event.container.data; // Already ensured as `string[]`
    
    if (event.previousContainer === event.container) {
      moveItemInArray(currentData, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(previousData, currentData, event.previousIndex, event.currentIndex);
    }
  
    console.log('Selected Items:', this.selectedItems);
  }
  
  
  stripHtmlTags(part: string): string {
    const htmlTagRegex = /<[^>]*>/g;

    const placeholderRegex = /\[\[(\d+)\]\]/g;

    let cleanText = part.replace(htmlTagRegex, '');

    cleanText = cleanText.replace(placeholderRegex, (match, p1) => {
      return `<span class="drop-placeholder" data-index="${p1}">Drag here ${p1}</span>`;
    });

    return cleanText;
  }


  loadQuestions(): void {
    if (this.categoryId) {
      this.userService.getQuestionsByCategory(this.categoryId).subscribe(
        (data: Question[]) => {
          this.questions = data;
          console.log('Questions:', this.questions);
          this.initializeDragAndDropQuestions();
        },
        error => {
          console.error('Error fetching questions:', error);
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
      }
    });
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
