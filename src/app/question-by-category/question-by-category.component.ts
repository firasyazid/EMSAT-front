import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UserService } from '../services/userService';
import { Question } from '../models/questions';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-question-by-category',
  templateUrl: './question-by-category.component.html',
  styleUrls: ['./question-by-category.component.css']
})
export class QuestionByCategoryComponent implements OnChanges {
  @Input() categoryId: string | null = null;
  questions: Question[] = [];
  p: number = 1;
  selectedOptions: { [questionId: string]: string[] } = {};

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] && this.categoryId) {
      this.loadQuestions();
    }
  }

  loadQuestions(): void {
    if (this.categoryId) {
      this.userService.getQuestionsByCategory(this.categoryId).subscribe(
        (data: Question[]) => {
          this.questions = data;
          console.log('Questions:', this.questions);
        },
        error => {
          console.error('Error fetching questions:', error);
          this.snackBar.open('Failed to load questions', 'Close', { duration: 3000 });
        }
      );
    }
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
