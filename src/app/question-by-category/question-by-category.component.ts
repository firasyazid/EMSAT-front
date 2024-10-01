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

  updatedSequences: { questionId: string, correctSequence: string[] }[] = [];

  questions: Question[] = [];
  p: number = 1;
// Modify the type of selectedOptions to handle both single and multiple choices
selectedOptions: { [key: string]: string | string[] } = {};
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
  loadCategoryName(categoryId: string): void {
    this.http.get<any>(`https://emsat-project-backend.onrender.com/api/v1/categories/${categoryId}`).subscribe(
      (response) => {
        this.categoryname = response.name;
      },
      (error) => {
        console.error('Error loading category name:', error);
      }
    );
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
    if (question.dragAndDropData && question.dragAndDropData.correctSequence) {
      // Transform the correctSequence array into a single phrase string
      const correctSequencePhrase = this.transformCorrectSequenceToString(question.dragAndDropData.correctSequence);
  
      console.log("Saving updated sequence for question:", question.id, correctSequencePhrase);
  
      // Retrieve the existing testResults2 from localStorage (or use an empty array if none exist)
      let testResults2 = JSON.parse(localStorage.getItem('testResults2') || '[]');
  
      // Check if the question already exists in testResults2 array
      const resultIndex = testResults2.findIndex((result: any) => result.questionId === question.id);
  
      if (resultIndex !== -1) {
        // If the question exists, update its correctSequence
        testResults2[resultIndex].correctSequence = correctSequencePhrase;
      } else {
        // If the question doesn't exist, push a new entry into the array without overwriting other entries
        testResults2.push({
          questionId: question.id,
          correctSequence: correctSequencePhrase,
         });
      }
      // Save the updated testResults2 back to localStorage
      localStorage.setItem('testResults2', JSON.stringify(testResults2));
  
      // Log the updated testResults2 array for debugging
      console.log('Updated testResults2 in localStorage:', testResults2);
    } else {
      console.log('No correctSequence available for this question.');
    }
  }
  


   
  
  // Helper function to transform array into a single string
  transformCorrectSequenceToString(correctSequence: string[]): string {
    // Join the array elements into a single string
    return correctSequence.join('').trim();
  }
  



  onSingleChoiceSelected(questionId: string, selectedOption: string): void {
    this.selectedOptions[questionId] = selectedOption; // Store as a single value, not an array
    console.log('Selected option:', this.selectedOptions);
  
    // Update or add test result
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
  


 







  isOptionSelected(questionId: string, option: string): boolean {
    // Check if the selected option for single-choice questions matches the current option
    return this.selectedOptions[questionId] === option;
  }
  






   
    

  
}
