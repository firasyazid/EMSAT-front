import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import { UserService } from 'src/app/services/userService';

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexLegend,
  ApexTitleSubtitle
} from 'ng-apexcharts';
 
export type ChartOptions = {
  series?: ApexNonAxisChartSeries | any;
  chart?: ApexChart | any;
  responsive?: ApexResponsive[] | any;
  labels?: any;
  legend?: ApexLegend | any;
  title?: ApexTitleSubtitle | any;


};

@Component({
  selector: 'app-pie-simple',
  templateUrl: './pie-simple.component.html',
  styleUrls: ['./pie-simple.component.css']
})
export class PieSimpleComponent implements OnInit {
  percentages: any = {};

  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions> = {
    series: [],
    chart: {
      width: 380,
      type: 'pie'
    },
    labels: [ 
      'Student',
      'Teacher',
      'Super Admin'

    ],
    responsive: [
      {
        breakpoint: 575,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: 'bottom',
            show: true,
          },
          dataLabels: {
            enabled: false,
          },
          title: {
            text: 'User Role Percentages',
            align: 'center',
            margin: 10,
            offsetX: 0,
            offsetY: 0,
            floating: false,
            style: {
              fontSize: '14px',
              color: '#263238'
            }
          
          }
            

        }
      }
    ]
  };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUserRolePercentages().subscribe(
      data => {
        this.percentages = data;
        console.log('User role percentages:', this.percentages);

         this.chartOptions.series = [
          this.percentages['Student'] || 0,
          this.percentages['Teacher'] || 0,
          this.percentages['Super Admin'] || 0
        ];

        this.chartOptions.labels = [
          'Student',
          'Teacher',
          'Super Admin'
        ];

         this.chart.updateOptions(this.chartOptions);
      },
      error => {
        console.error('Error fetching user role percentages:', error);
      }
    );
  }
}
