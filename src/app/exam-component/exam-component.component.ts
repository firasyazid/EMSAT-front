import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserService } from '../services/userService';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subscription } from 'rxjs';
import { ConfirmDialog2Component } from '../confirm-dialog2/confirm-dialog2.component';
import { MatDialog } from '@angular/material/dialog';
import { TestResultDialogComponent } from '../test-result-dialog/test-result-dialog.component';
import { test } from '../models/tests';


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
  currentPage: number = 1;  // Add this property to track the current page
  canMoveToNextCategory: boolean = false; // New variable to track if navigation is allowed

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
        this.categoryTimers[category.id] = category.timeLimit * 60;  
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
      this.setCategoryTimer(); 
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
       this.userService.getQuestionsByCategory(this.selectedCategoryId).subscribe(
        (data: any) => {
          this.questions = data;   
           this.cdr.detectChanges();  
        },
        error => {
          console.error('Error fetching questions:', error);
          this.snackBar.open('Failed to load questions', 'Close', { duration: 3000 });
        }
      );
    }
  }
  handleAllQuestionsAnswered(allAnswered: boolean): void {
    this.canMoveToNextCategory = allAnswered;
  }

  moveToNextCategory(): void {
   

    
    const dialogRef = this.dialog.open(ConfirmDialog2Component);
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const categoriesWithQuestions = this.getCategoriesWithQuestions();
  
        if (categoriesWithQuestions.length > 0) {
          if (this.categoryTimerSubscription) {
            this.categoryTimerSubscription.unsubscribe(); // Unsubscribe from the previous timer
          }

          
          // Move to the next category only if it's not the last one
          if (this.currentCategoryIndex < categoriesWithQuestions.length - 1) {
            this.currentCategoryIndex++;
            
        
          } else {
            this.snackBar.open('You have reached the last category with questions', 'Close', { duration: 3000 });
            return; // Do nothing if it's the last category
          }
  
          // Reset the page and load questions from the selected category
          this.currentPage = 1;
   
          // Select the next category with questions
          this.selectCategory(categoriesWithQuestions[this.currentCategoryIndex].id);
          this.refreshQuestions();
        } else {
          // Handle case when no categories have questions
           this.snackBar.open('No categories with questions available', 'Close', { duration: 3000 });
        }
      }
    });
  }
  
  
  getCategoriesWithQuestions(): any[] {
    return this.testData.categories.filter((category: any) =>
      category.questions && category.questions.length > 0
    );
  }
  

  finishTest(): void {
    // Open the confirmation dialog
    const dialogRef = this.dialog.open(TestResultDialogComponent, {
      width: '300px'
    });
    // Handle the dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.submitTestAndShowScore();
      }
    });
  }
  

  submitTestAndShowScore(): void { 
    // Retrieve test results from localStorage
    const storedResults = localStorage.getItem('testResults');
    const storedResults2 = localStorage.getItem('testResults2');
     
    if (storedResults || storedResults2) {
      // Parse the stored results
      const testResults = storedResults ? JSON.parse(storedResults) : [];
      const testResults2 = storedResults2 ? JSON.parse(storedResults2) : [];
  
      // Merge both results (assuming both are arrays of answers)
      const combinedTestResults = [...testResults, ...testResults2];
   
      const testId = this.id;  // Assuming 'this.id' holds the current test ID
  
      if (testId) {
        // Call the submitTest method from the UserService
        this.userService.submitTest(testId, combinedTestResults).subscribe(
          (response: any) => {
             // Extract score and other details from the response
            const score = response.score;
            const correctAnswers = response.correctAnswers;
            const totalQuestions = response.totalQuestions;
  
            // Store the score in localStorage to pass to the next component
            localStorage.setItem('testScore', JSON.stringify({ score, correctAnswers, totalQuestions }));
  
            // Remove the stored results after submission
            localStorage.removeItem('testResults');
            localStorage.removeItem('testResults2');
  
            // Show the score in the snackBar
            this.snackBar.open(`Test Submitted! Score: ${score} | Correct Answers: ${correctAnswers} / ${totalQuestions}`, 'Close', {
              duration: 5000,
            });
  
            // Navigate to the results component
            this.router.navigate(['/admin/test-result'], {
              queryParams: {
                score: score,
                correctAnswers: correctAnswers,
                totalQuestions: totalQuestions,
                testId: testId
              }
            });
          },
          (error: any) => {
            console.error('Error submitting test:', error);
            this.snackBar.open('Failed to submit test', 'Close', { duration: 3000 });
          }
        );
      } else {
        this.snackBar.open('No test results found', 'Close', { duration: 3000 });
      }
    } else {
      this.snackBar.open('No test results found', 'Close', { duration: 3000 });
    }
  }
  

}
