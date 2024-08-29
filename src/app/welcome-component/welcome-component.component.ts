import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-welcome-component',
  templateUrl: './welcome-component.component.html',
  styleUrls: ['./welcome-component.component.css']
})
export class WelcomeComponentComponent implements OnInit {
  @Output() testStarted = new EventEmitter<boolean>();

  currentPage: number = 1;
  totalPages: number = 3;  
  hasTestStarted: boolean = false;  

  constructor(private snackBar: MatSnackBar, private dialog: MatDialog) { }

  ngOnInit(): void {}

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
     if (this.currentPage > 1 && !this.hasTestStarted) {
      this.currentPage--;
    }
  }

  confirmStartTest() {
    if (window.confirm('Do you really want to start the test? ?')) {
      this.testStarted.emit(true);
      this.hasTestStarted = true;   
      this.nextPage();
    } else {
      this.openSnackBar('Test not started.', 'Close');
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      horizontalPosition: 'left',
      verticalPosition: 'bottom',
    });
  }
}
