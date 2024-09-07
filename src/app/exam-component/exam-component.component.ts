import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserService } from '../services/userService';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subscription } from 'rxjs';
import { ConfirmDialog2Component } from '../confirm-dialog2/confirm-dialog2.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-exam-component',
  templateUrl: './exam-component.component.html',
  styleUrls: ['./exam-component.component.css']
})
export class ExamComponentComponent implements OnInit, OnDestroy {

  id: string | null = null;
  testData: any;
  questions: any[] = [];  // Array to hold questions
  timeLeft: number = 2 * 60 * 60;  
  displayTime: string = '02:00:00';
  private timerSubscription: Subscription | null = null;
  private categoryTimerSubscription: Subscription | null = null;
  testStarted: boolean = false;
  selectedCategoryId: string | null = null;
  currentCategoryIndex: number = 0;
  categoryTimers: { [key: string]: number } = {};  // Track time left for each category

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
   ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.userService.GetTestbyId(this.id).subscribe(
        (data: any) => {
          this.testData = data;
          this.initializeCategoryTimers();
        },
        error => {
          console.error('Error fetching test data:', error);
          this.snackBar.open('Failed to load test data', 'Close', { duration: 3000 });
        }
      );
    }
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.categoryTimerSubscription) {
      this.categoryTimerSubscription.unsubscribe();
    }
  }

  initializeCategoryTimers(): void {
    if (this.testData && this.testData.categories) {
      this.testData.categories.forEach((category: any) => {
        this.categoryTimers[category.id] = category.timeLimit * 60; // Initialize each category timer in seconds
      });
    }
  }

  cleanCategoryName(name: string): string {
    return name.replace(/ - copy .*/, '');
  }

  onTestStartConfirmed(started: boolean): void {
    if (started) {
      this.testStarted = true;
      this.startTimer();
      this.startCategoryRotation();
    }
  }

  startTimer(): void {
    if (this.testStarted) {
      this.timerSubscription = interval(1000).subscribe(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
          this.updateDisplayTime();
        } else {
          this.timerSubscription?.unsubscribe();
        }

        this.updateCategoryTimers();
      });
    }
  }

  updateDisplayTime(): void {
    const hours = Math.floor(this.timeLeft / 3600);
    const minutes = Math.floor((this.timeLeft % 3600) / 60);
    const seconds = this.timeLeft % 60;

    this.displayTime = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  updateCategoryTimers(): void {
    const currentCategoryId = this.testData.categories[this.currentCategoryIndex].id;
    if (this.categoryTimers[currentCategoryId] > 0) {
      this.categoryTimers[currentCategoryId]--;
    } else {
      this.categoryTimerSubscription?.unsubscribe();
    }
  }

  padZero(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  startCategoryRotation(): void {
    if (this.testData && this.testData.categories.length > 0) {
      this.selectCategory(this.testData.categories[this.currentCategoryIndex].id);
      this.setCategoryTimer(); // Set the timer for the current category
    }
  }

  setCategoryTimer(): void {
    if (this.categoryTimerSubscription) {
      this.categoryTimerSubscription.unsubscribe(); // Unsubscribe from the previous timer
    }

    const currentCategory = this.testData.categories[this.currentCategoryIndex];
    const categoryTimeLimit = currentCategory.timeLimit * 60 * 1000; // Convert timeLimit from minutes to milliseconds

    this.categoryTimerSubscription = interval(categoryTimeLimit).subscribe(() => {
      // Move to the next category
      this.currentCategoryIndex = (this.currentCategoryIndex + 1) % this.testData.categories.length;
      this.selectCategory(this.testData.categories[this.currentCategoryIndex].id);
      this.refreshQuestions(); 
      this.setCategoryTimer();  
    });
  }

  selectCategory(categoryId: string): void {
    this.selectedCategoryId = categoryId;
    this.cdr.detectChanges();  // Manually trigger change detection
  }

  isActiveCategory(categoryId: string): boolean {
    return this.selectedCategoryId === categoryId;
  }

  getCategoryTimerDisplay(categoryId: string): string {
    const timeLeft = this.categoryTimers[categoryId];
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  refreshQuestions(): void {
    if (this.selectedCategoryId) {
      console.log('Refreshing questions for category:', this.selectedCategoryId);
      this.userService.getQuestionsByCategory(this.selectedCategoryId).subscribe(
        (data: any) => {
          this.questions = data;  // Update the questions array
          console.log('Questions refreshed:', this.questions);
          this.cdr.detectChanges();  // Manually trigger change detection
        },
        error => {
          console.error('Error fetching questions:', error);
          this.snackBar.open('Failed to load questions', 'Close', { duration: 3000 });
        }
      );
    }
  
  
  
  }


  moveToNextCategory(): void {
    const dialogRef = this.dialog.open(ConfirmDialog2Component);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
         this.currentCategoryIndex++;
        this.selectCategory(this.testData.categories[this.currentCategoryIndex].id);
        this.refreshQuestions();
      }
    });
  }
}
