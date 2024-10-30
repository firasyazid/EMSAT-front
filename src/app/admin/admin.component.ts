import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
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
  isMobile: boolean = window.innerWidth < 768; // Déterminer si c'est un mobile au chargement initial

  constructor(public sharedService: SharedService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Vérifier la taille de l'écran à l'initialisation
    this.isMobile = window.innerWidth < 768;
    this.cdr.detectChanges(); // Demander à Angular de vérifier les changements
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.isMobile = event.target.innerWidth < 768;
    this.cdr.detectChanges(); // Assurer la détection des changements après redimensionnement
  }
}
