import { Component, Input, OnChanges, OnInit, SimpleChanges, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { UserService } from '../services/userService';
import { Question } from '../models/questions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/AuthService';
import { LocalstorageService } from '../services/LocalstorageService';


@Component({
  selector: 'app-question-by-category',
  templateUrl: './question-by-category.component.html',
  styleUrls: ['./question-by-category.component.css']
})

export class QuestionByCategoryComponent implements OnChanges, OnInit {
  @Input() categoryId: string | null = null;
  @Output() testFinished: EventEmitter<{ questionId: string, selectedOption: string }[]> = new EventEmitter();

  dragAndDropData: { correctSequence: string[], draggableItems: string[], _id: string }[] = [];


  questions: Question[] = [];
  p: number = 1;
  selectedOptions: { [questionId: string]: string[] } = {};
  selectedItems: string[] = [];
  correctSequence: string[] = [];
  correctSequenceParts: string[] = [];
  connectedDropLists: string[] = [];
  categoryname: string = '';
  userInput: string = '';
  wordCount: number = 0;
  currentQuestionIndex: number = 0;
  testResults: { questionId: string, selectedOption: string }[] = [];


  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private auth: AuthService,
    private localstorageService: LocalstorageService,

  ) { }

  ngOnInit(): void {
    this.loadQuestions();
    const loggedInUserRole = this.localstorageService.getUserId();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] && this.categoryId) {
      this.loadCategoryName(this.categoryId);
      this.loadQuestions();
      this.p = 1;
    }
  }


  loadQuestions(): void {
    if (this.categoryId) {
      this.userService.getQuestionsByCategory(this.categoryId).subscribe(
        (data: Question[]) => {
          this.questions = data;
          console.log('Questions:', this.questions);

          // Clear existing drag and drop data before reloading
          this.dragAndDropData = [];

          // Iterate through the questions and check the type
          this.questions.forEach(question => {
            if (question.type === 'dragAndDrop') {
              // Push the dragAndDropData (correctSequence, draggableItems, _id) to the array
              this.dragAndDropData.push({
                correctSequence: question.dragAndDropData?.correctSequence ?? [],
                draggableItems: question.dragAndDropData?.draggableItems ?? [],
                _id: question.id
              });
            }
          });
          // Initialize the drag and drop functionality
          this.initializeDragAndDropQuestions();

        },
        error => {
          this.snackBar.open('Failed to load questions', 'Retry', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        }
      );
    }
  }
   

  initializeDragAndDropQuestions(): void {
    this.questions.forEach((question) => {
      if (question.type === 'dragAndDrop') {
        // Ensure each question has its own instance of selected items and sequence parts
        question.dragAndDropData = {
          correctSequence: question.dragAndDropData?.correctSequence || [],
          draggableItems: question.dragAndDropData?.draggableItems || [],
          correctSequenceParts: question.dragAndDropData?.correctSequenceParts || [],
          selectedItems: new Array(question.dragAndDropData?.correctSequence.length || 0).fill('')
        };
  
        // Generate unique drop list IDs for each question's placeholders
        question.dragAndDropData.connectedDropLists = question.dragAndDropData.correctSequenceParts.map((_, index) => `placeholder-${question.id}-${index}`);
        this.connectedDropLists = question.dragAndDropData.connectedDropLists;
        console.log(this.connectedDropLists , "testt")
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

  loadCategoryName(categoryId: string): void {
    this.http.get<any>(`http://192.168.39.71:3003/api/v1/categories/${categoryId}`).subscribe(
      (response) => {
        this.categoryname = response.name;
      },
      (error) => {
        console.error('Error loading category name:', error);
      }
    );
  }


  checkWordCount(text: string): void {
    // Split the user input by spaces to count words
    this.wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  drop(event: CdkDragDrop<string[]>, question: Question, index: number): void {
    // Set the selected item into the placeholder for this specific question
    question.dragAndDropData!.selectedItems[index] = event.item.element.nativeElement.innerText.trim();
  
    // Update the correct sequence after the drop for this question
    this.updateCorrectSequence(question);
  
    // Optionally, send the updated sequence to the backend for saving
    this.saveUpdatedSequence(question);
  }
  

  updateCorrectSequence(question: Question): void {
    // Combine the selected items and static text parts to form the updated correct sequence for this question
    question.dragAndDropData!.correctSequence = question.dragAndDropData!.correctSequenceParts.map((part, idx) => {
      return this.isPlaceholder(part) ? (question.dragAndDropData!.selectedItems[idx] || part) : part;
    });
  }
  
  saveUpdatedSequence(question: Question): void {
    console.log("Saving updated sequence for question:", question.id, question.dragAndDropData!.correctSequence);
    // Example: this.userService.saveUpdatedSequence(question.id, question.dragAndDropData.correctSequence).subscribe();
  }
  



















  onSingleChoiceSelected(questionId: string, selectedOption: string): void {
    this.selectedOptions[questionId] = [selectedOption];
    // Update test results array
    const resultIndex = this.testResults.findIndex(result => result.questionId === questionId);
    if (resultIndex >= 0) {
      this.testResults[resultIndex].selectedOption = selectedOption; // Update existing entry
    } else {
      this.testResults.push({ questionId, selectedOption }); // Add new entry
    }

    // Save the results in localStorage
    localStorage.setItem('testResults', JSON.stringify(this.testResults));

    console.log('Test results saved to localStorage:', this.testResults);
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
