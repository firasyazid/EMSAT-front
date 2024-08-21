import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-switcher',
  templateUrl: './switcher.component.html',
  styleUrls: ['./switcher.component.css']
})
export class SwitcherComponent implements OnInit {

  themename!: string;
  themedir!: string;
  attributeVal!: any;
  event!: Event;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.themedir = params.direction || 'ltr';

      // Set the default theme to dezThemeSet6
      if (params.themename && params.themename <= 5 && params.themename > 0) {
        this.themename = 'dezThemeSet' + params.themename;
      } else {
        this.themename = 'dezThemeSet6'; // Default to dezThemeSet6
      }

      this.themeDemoSettings(this.themename, this.themedir);
    });
  }

  toggleswitcher: boolean = true;
  togglesthemedemo: boolean = true;

  toggleswitcherwindow() {
    this.toggleswitcher = !this.toggleswitcher;
  }

  togglesthemedemowindow() {
    this.togglesthemedemo = !this.togglesthemedemo;
  }

  themeSettings(attributeName: any, event: any) {
    if (event.target === undefined) {
      this.attributeVal = event;
    } else {
      this.attributeVal = event.target.value;
    }

    document.body.setAttribute(attributeName, this.attributeVal);

    if (attributeName == 'direction') {
      document.getElementsByTagName('html')[0].setAttribute('dir', this.attributeVal);
      document.getElementsByTagName('html')[0].setAttribute('class', this.attributeVal);
    }
  }

  themeDemoSettings(theme: any, direction: any) {
    var dezThemeSet1 = { /* your theme settings */ };
    var dezThemeSet2 = { /* your theme settings */ };
    var dezThemeSet3 = { /* your theme settings */ };
    var dezThemeSet4 = { /* your theme settings */ };
    var dezThemeSet5 = { /* your theme settings */ };
    var dezThemeSet6 = {
      typography: "poppins",
      version: "light",
      layout: "horizontal",
      primary: "color_5",
      headerBg: "color_1",
      navheaderBg: "color_1",
      sidebarBg: "color_1",
      sidebarStyle: "full",
      sidebarPosition: "fixed",
      headerPosition: "static",
      containerLayout: "full",
    };
    var dezThemeSet7 = { /* your theme settings */ };
    var dezThemeSet8 = { /* your theme settings */ };
    var dezThemeSet9 = { /* your theme settings */ };
    var dezThemeSet10 = { /* your theme settings */ };
    var dezThemeSet11 = { /* your theme settings */ };

    var themeVar = eval(theme);

    document.body.setAttribute('data-typography', themeVar.typography);
    document.body.setAttribute('data-theme-version', themeVar.version);
    document.body.setAttribute('data-layout', themeVar.layout);
    document.body.setAttribute('data-primary', themeVar.primary);
    document.body.setAttribute('data-headerbg', themeVar.headerBg);
    document.body.setAttribute('data-nav-headerbg', themeVar.navheaderBg);
    document.body.setAttribute('data-sibebarbg', themeVar.sidebarBg);
    document.body.setAttribute('data-sidebar-style', themeVar.sidebarStyle);
    document.body.setAttribute('data-sidebar-position', themeVar.sidebarPosition);
    document.body.setAttribute('data-header-position', themeVar.headerPosition);
    document.body.setAttribute('data-container', themeVar.containerLayout);
    document.body.setAttribute('direction', direction);

    document.getElementsByTagName('html')[0].setAttribute('dir', direction);
    document.getElementsByTagName('html')[0].setAttribute('class', direction);
  }
}
