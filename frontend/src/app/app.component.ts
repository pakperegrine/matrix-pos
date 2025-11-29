import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Matrix POS';
  pageTitle = 'Point of Sale';

  private pageTitles: { [key: string]: string } = {
    '/pos': 'Point of Sale',
    '/products': 'Product Management',
    '/sales': 'Sales Reports',
    '/customers': 'Customer Management',
    '/reports': 'Analytics & Reports',
    '/settings': 'Settings'
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.pageTitle = this.pageTitles[event.url] || 'Point of Sale';
      });
  }
}
