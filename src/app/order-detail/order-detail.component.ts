import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/userService';
import { test } from '../models/tests';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalstorageService } from '../services/LocalstorageService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  Tests: test[] = [];
  p: number = 1;  

  constructor( 
    private userService: UserService,
    private snackBar: MatSnackBar,
    private modalService: NgbModal,
    private localStorageService: LocalstorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.GetTests();
  }

  GetTests() {
    this.userService.getTests().subscribe(
      (tests: test[]) => {
        this.Tests = tests;
        console.log('Tests', this.Tests);
      },
      (error) => {
        console.error('Failed to load tests', error);
      }
    );
  }


      navigatetoexam(testid: string)
      {
        this.router.navigate(['/exam', testid]);
      }

}
