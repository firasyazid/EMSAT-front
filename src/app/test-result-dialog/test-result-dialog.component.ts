import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-test-result-dialog',
  templateUrl: './test-result-dialog.component.html',
  styleUrls: ['./test-result-dialog.component.css']
})
export class TestResultDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<TestResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { score: string, correctAnswers: number, totalQuestions: number }
  ) { }

  onConfirm(): void {
    this.dialogRef.close(true);  // Return true if confirmed
  }

  onCancel(): void {
    this.dialogRef.close(false); // Return false if canceled
  }

}
