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
    dropListIds: string[] = [];  
  
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
        console.log('Questions or category changed:', this.questions, this.categoryId);
        this.p = 1;  
  
      }
    }
 


    drop(event: CdkDragDrop<string[]>): void {
      if (!event.container.data || !event.previousContainer.data) {
        return;
      }
    
      const droppedItem = event.previousContainer.data[event.previousIndex];
    
      // Extract the target drop area index from the drop list id
      const targetId = event.container.id;  // Full id of the drop area
      const targetParts = targetId.split('-');  // Splitting the id by '-'
      const targetIndex = targetParts.length > 2 ? parseInt(targetParts[targetParts.length - 1], 10) : -1;
    
      if (targetIndex >= 0) {
        // Check if the target placeholder is empty
        if (!this.selectedItems[targetIndex]) {
          // Place the item in the selectedItems array at the correct index
          this.selectedItems[targetIndex] = droppedItem;
    
          // Replace the placeholder in the correct sequence at the right index
          const placeholder = `[[${targetIndex + 1}]]`;  // Placeholder format is [[1]], [[2]], etc.
          const regex = new RegExp(placeholder, 'g');
          this.correctSequence[targetIndex] = this.correctSequence[targetIndex].replace(regex, droppedItem);
    
          // Remove the dragged item from the original list (optional)
          event.previousContainer.data[event.previousIndex] = '';
        } 
      }
    }


 

    
stripHtmlTags(part: string, idx: number): string {
  const htmlTagRegex = /<[^>]*>/g;
  const placeholderRegex = /\[\[(\d+)\]\]/g;

  let cleanText = part.replace(htmlTagRegex, '');

  cleanText = cleanText.replace(placeholderRegex, (match, p1) => {
    // Create a unique ID by combining idx and placeholder number (p1)
    const uniqueId = `drop-placeholder-${idx}-${p1}`;
    
    // Use p1 to show the sequence number (1-based index)
    console.log(`Drag here ${p1}: ${uniqueId}`);
    
    return `<span id="${uniqueId}" class="drop-placeholder" data-index="${p1}">Drag here ${p1}</span>`;
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
