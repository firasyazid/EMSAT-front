import { Component, OnInit } from '@angular/core';
import {EventEmitter, Output } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-welcome-component',
  templateUrl: './welcome-component.component.html',
  styleUrls: ['./welcome-component.component.css']
})
export class WelcomeComponentComponent implements OnInit {
  @Output() testStarted = new EventEmitter<boolean>();
  
  currentPage: number = 1;
  totalPages: number = 4;
  testHasStarted: boolean = false;  

  constructor(private snackBar: MatSnackBar, private dialog: MatDialog) { }

  ngOnInit(): void {}

  nextPage() {
    if (this.currentPage === 4 && !this.testHasStarted) {
      this.confirmStartTest();
    } else if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  confirmStartTest() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.testHasStarted = true;
        this.testStarted.emit(true);
        this.nextPage();
      } else {
        this.openSnackBar('Test not started.', 'Close');
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      horizontalPosition: 'left',
      verticalPosition: 'bottom',
    });
  }
}

