import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
 import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/AuthService';
import { LocalstorageService } from '../../services/LocalstorageService';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginFormGroup! : FormGroup;
  isSubmitted = false;
  authError = false;
  authMessage = 'Email or Password are wrong';

  constructor(private formBuilder: FormBuilder,
    private auth: AuthService,
    private localstorageService: LocalstorageService,
    private router: Router
    ) { }

  ngOnInit(): void {
    this._initLoginForm();

  }
  private _initLoginForm() {
    this.loginFormGroup = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }
  get loginForm() {
    return this.loginFormGroup.controls;
  }

  onSubmit() {
    this.isSubmitted = true;
  
    // Check if form is invalid
    if (this.loginFormGroup.invalid) return;
  
    // Call the auth service to log in the user
    this.auth.login(this.loginForm['email'].value, this.loginForm['password'].value).subscribe(
      (user) => {
        this.authError = false;
   
        // Store the token, fullname, role, and userId in local storage
        this.localstorageService.setToken(user.token);
        this.localstorageService.setUserName(user.fullname || '');
        this.localstorageService.setRole(user.role || '');
        this.localstorageService.setUserId(user.userId || '');
  
        // If the user is a student, check their expiration date
        if (user.role === 'Student') {
          if (user.expiresAt) {  // Ensure expiresAt exists
            const expirationDate = new Date(user.expiresAt.toString());
            const currentDate = new Date();
    
            if (currentDate < expirationDate) {
              // Redirect to student dashboard if account is still valid
              this.router.navigate(['/admin/order-detail']);
            } else {
              // Deny access if the account has expired
              this.authError = true;
              this.authMessage = 'Access denied. Your account has expired.';
            }
          }  
        } else {
          // Handle other roles like Admin
          this.router.navigate(['/admin/order-detail']);
        }
      },
      (error: HttpErrorResponse) => {
        this.authError = true;
        
        if (error.status === 403) {
          // If account is expired
          this.authMessage = 'Access denied. Your account has expired.';
        } else if (error.status === 400) {
          // If email or password is wrong
          this.authMessage = 'Email or password is wrong.';
        } else {
          // Any other server error
          this.authMessage = 'Error in the Server, please try again later!';
        }
      }
    );
  }
  
  
  
  

}
