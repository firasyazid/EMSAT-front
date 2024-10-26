import { Component, OnInit,HostListener} from '@angular/core';
import {SharedService} from '../shared.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  title = 'EMSAT';
  navSidebarClass: boolean = true;
  hamburgerClass: boolean = false;
  isDesktopView: boolean = true;

    constructor(public sharedService: SharedService) {
      
    }

    ngOnInit(): void {
      this.checkScreenSize(); // Initial check
    }
  



  @HostListener('window:resize', [])
  onResize(): void {
    this.checkScreenSize(); // Check on window resize
  }

  checkScreenSize(): void {
    this.isDesktopView = window.innerWidth >= 768; // Set breakpoint for desktop view (e.g., 768px)
  }

}
