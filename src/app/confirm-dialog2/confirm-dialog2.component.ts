import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
 
@Component({
  selector: 'app-confirm-dialog2',
  templateUrl: './confirm-dialog2.component.html',
  styleUrls: ['./confirm-dialog2.component.css']
})
export class ConfirmDialog2Component   {

  constructor(public dialogRef: MatDialogRef<ConfirmDialog2Component>) {}

   

  onConfirm(): void {
    this.dialogRef.close(true);  
  }

  onCancel(): void {
    this.dialogRef.close(false);  
  }

}
