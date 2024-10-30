import { Component, OnInit, HostListener } from '@angular/core';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  title = 'EMSAT';
  navSidebarClass: boolean = true;
  hamburgerClass: boolean = false;
  isMobile: boolean = window.innerWidth < 768;  

  constructor(public sharedService: SharedService) {}

  ngOnInit(): void {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.isMobile = event.target.innerWidth < 768;
  }
}
