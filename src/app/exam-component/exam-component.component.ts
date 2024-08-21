import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserService } from '../services/userService';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-exam-component',
  templateUrl: './exam-component.component.html',
  styleUrls: ['./exam-component.component.css']
})
export class ExamComponentComponent implements OnInit, OnDestroy {

  id: string | null = null;
  testData: any;
  timeLeft: number = 2 * 60 * 60; // 2 hours in seconds
  displayTime: string = '02:00:00';
  private timerSubscription: Subscription | null = null;

  constructor( 
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.userService.GetTestbyId(this.id).subscribe(
        (data: any) => {
          this.testData = data;
          this.startTimer(); // Start the timer when test data is loaded
        },
        error => {
          console.error('Error fetching test data:', error);
          this.snackBar.open('Failed to load test data', 'Close', { duration: 3000 });
        }
      );
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from the timer when the component is destroyed to prevent memory leaks
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  cleanCategoryName(name: string): string {
    return name.replace(/ - copy .*/, '');
  }

  startTimer(): void {
    // Create an interval observable that emits a value every second (1000ms)
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDisplayTime();
      } else {
        // Optionally, handle what happens when the timer reaches 0
        this.timerSubscription?.unsubscribe();
      }
    });
  }

  updateDisplayTime(): void {
    const hours = Math.floor(this.timeLeft / 3600);
    const minutes = Math.floor((this.timeLeft % 3600) / 60);
    const seconds = this.timeLeft % 60;

    this.displayTime = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  padZero(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }
}
