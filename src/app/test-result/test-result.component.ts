import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';


@Component({
  selector: 'app-test-result',
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.css']
})
export class TestResultComponent {
  @Input() score!: string;
  @Input() correctAnswers!: number;
  @Input() totalQuestions!: number;
  @Input() testId!: string;

  constructor(private route: ActivatedRoute , 
              private router: Router

  ) {}

  ngOnInit(): void {
    // In case the data is passed via route params
    this.route.queryParams.subscribe(params => {
      this.score = params['score'] || this.score;
      this.correctAnswers = params['correctAnswers'] || this.correctAnswers;
      this.totalQuestions = params['totalQuestions'] || this.totalQuestions;
      this.testId = params['testId'] || this.testId;

      // Clear the test results from localStorage
      localStorage.removeItem('testScore');
     });
  }

  retakeTest(): void {
    // Redirect to the test page (replace 'test-page-route' with your actual route)
    this.router.navigate(['/admin/exam/', this.testId]);
    localStorage.removeItem('testResults2');
    localStorage.removeItem('testResults');
    
  }
}
