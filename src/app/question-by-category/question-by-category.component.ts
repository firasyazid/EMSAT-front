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
  @Output() allQuestionsAnswered: EventEmitter<boolean> = new EventEmitter(); // New Output Event

  dragAndDropData: { correctSequence: string[], draggableItems: string[], _id: string }[] = [];

  updatedSequences: { questionId: string, correctSequence: string[] }[] = [];

  questions: Question[] = [];
  p: number = 1;
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
  usedItems: string[] = [];


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
          this.checkSingleChoiceAnswered(); 

           this.dragAndDropData = [];

           this.questions.forEach(question => {
            if (question.type === 'dragAndDrop') {
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
         question.dragAndDropData = {
          correctSequence: question.dragAndDropData?.correctSequence || [],
          draggableItems: question.dragAndDropData?.draggableItems || [],
          correctSequenceParts: question.dragAndDropData?.correctSequenceParts || [],
          selectedItems: new Array(question.dragAndDropData?.correctSequence.length || 0).fill('')
        };
  
         question.dragAndDropData.connectedDropLists = question.dragAndDropData.correctSequenceParts.map((_, index) => `placeholder-${question.id}-${index}`);
        this.connectedDropLists = question.dragAndDropData.connectedDropLists;
       }
    });
  }
  

   splitCorrectSequence(sequence: string): string[] {
     return sequence.split(/(\[\[\d+\]\])/);
  }

   isPlaceholder(part: string): boolean {
    return /\[\[\d+\]\]/.test(part);
  }

  

  checkWordCount(text: string): void {
    // Split the user input by spaces to count words
    this.wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

   
  

  drop(event: CdkDragDrop<string[]>, question: Question, index: number): void {
    // Set the selected item into the placeholder for this specific question
    const itemText = event.item.element.nativeElement.innerText.trim();
    question.dragAndDropData!.selectedItems[index] = itemText;
  
    // Mark this item as used if it's not already in the usedItems array
    if (!this.usedItems.includes(itemText)) {
      this.usedItems.push(itemText);
    }
  
    // Update the correct sequence after the drop for this question
    this.updateCorrectSequence(question);
  
    // Optionally, send the updated sequence to the backend for saving
    this.saveUpdatedSequence(question);
  }
  
  isItemUsed(item: string): boolean {
    return this.usedItems.includes(item);
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
   
    // Update or add test result
    const resultIndex = this.testResults.findIndex(result => result.questionId === questionId);
    if (resultIndex >= 0) {
      this.testResults[resultIndex].selectedOption = selectedOption; // Update existing entry
    } else {
      this.testResults.push({ questionId, selectedOption }); // Add new entry
    }
  
    // Save the results in localStorage
    localStorage.setItem('testResults', JSON.stringify(this.testResults));
    this.checkSingleChoiceAnswered();

   }
  


 







  isOptionSelected(questionId: string, option: string): boolean {
    // Check if the selected option for single-choice questions matches the current option
    return this.selectedOptions[questionId] === option;
  }
  

  // Validate whether all single-choice questions are answered
  checkSingleChoiceAnswered(): void {
    // Check if all single-choice questions are answered
    const allSingleChoiceAnswered = this.questions.every(
      question => question.type !== 'singleChoice' || this.selectedOptions[question.id]
    );

    // Emit the result to the parent component
    this.allQuestionsAnswered.emit(allSingleChoiceAnswered);
  }


   
    

  
}
