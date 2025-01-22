import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { DatabaseViewComponent } from '../database-view/database-view.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
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
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  title = 'STIMS';
}
