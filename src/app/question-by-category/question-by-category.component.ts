import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/userService';
import { Question } from '../models/questions';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-question-by-category',
  templateUrl: './question-by-category.component.html',
  styleUrls: ['./question-by-category.component.css']
})
export class QuestionByCategoryComponent implements OnInit {
  questions: Question[] = [];   
  categoryId: string = '66a0e35d3cb891882df265fb';   
  p: number = 1;  

  constructor(

    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private snackBar: MatSnackBar,



  ) { }

  ngOnInit(): void {

    this.loadQuestions();
  }
  loadQuestions(): void {
    this.userService.getQuestionsByCategory(this.categoryId).subscribe((data: Question[]) => {
      this.questions = data;
      console.log('Questions:', this.questions);
    });
  }

  selectedOptions: { [questionId: string]: string } = {};

onOptionSelected(questionId: string, selectedOption: string): void {
  this.selectedOptions[questionId] = selectedOption;
  console.log('Selected option:', this.selectedOptions);
}

}
