import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/AuthService';
import { LocalstorageService } from '../../services/LocalstorageService';
import { HttpErrorResponse } from '@angular/common/http';
 import { FormBuilder, FormGroup, Validators } from '@angular/forms';
 import { User } from 'src/app/models/user';
  import { UserService } from 'src/app/services/userService';
  import { MatSnackBar } from '@angular/material/snack-bar';  
  

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  user: User = {
    fullname: '',
    email: '',
    password: '',
    // You can leave role and expiresAt out since your backend assigns them by default
  };

  constructor(private userService: UserService, private router: Router,
    private snackBar: MatSnackBar  


  ) { }

ngOnInit(): void { }


onSubmit(): void {
this.snackBar.open('Please contact us to complete your subscription payment.', 'Close', {
duration: 5000, // 5 seconds
verticalPosition: 'top', // Position of the snackbar
panelClass: ['snackbar-success'] // You can add custom styles in your CSS
});
}




/*
  onSubmit(): void {
    this.userService.createUser2(this.user).subscribe(
      response => {
        console.log('User registered successfully', response);
        // Show success message
        this.snackBar.open('Registration successful! You have a free trial for 3 days.', 'Close', {
          duration: 5000, // 5 seconds
          verticalPosition: 'top', // Position of the snackbar
          panelClass: ['snackbar-success'] // You can add custom styles in your CSS
        });
        this.router.navigate(['/page-login']);
      },
      error => {
        console.error('Error occurred during registration', error);
        // Show error message
        this.snackBar.open('Registration failed. Please try again.', 'Close', {
          duration: 5000, // 5 seconds
          verticalPosition: 'top', // Position of the snackbar
          panelClass: ['snackbar-error'] // You can add custom styles in your CSS
        });
      }
    );
  }
*/

}
