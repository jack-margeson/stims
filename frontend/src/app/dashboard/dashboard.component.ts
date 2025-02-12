import { Component, EventEmitter, Output } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { DatabaseViewComponent } from '../database-view/database-view.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { SidenavComponent } from '../sidenav/sidenav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    DatabaseViewComponent,
    ToolbarComponent,
    MatSidenavContainer,
    MatSidenav,
    SidenavComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  title = 'STIMS';
  searchTerm: string = '';
  filters: Object = {};

  onSearchTermChange(searchTerm: string) {
    this.searchTerm = searchTerm;
  }

  onFiltersChange(filters: Object) {
    this.filters = filters;
  }
}
