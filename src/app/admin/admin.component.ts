import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../classes/user';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatSidenav } from '@angular/material/sidenav';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { DatabaseService } from '../services/database.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [MatSidenavContainer, MatSidenav, HeaderComponent, SidenavComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  user: User;

  constructor(
    private authService: AuthService,
    private router: Router,
    private databaseService: DatabaseService,
    private notificationService: NotificationService
  ) {
    this.user = this.authService.getUser();
  }

  returnAllItems() {
    this.databaseService.returnAllItems().subscribe({
      next: (response: any) => {
        this.notificationService.showNotification(
          'All items have been returned.'
        );
      },
      error: (error: any) => {
        this.notificationService.showNotification(
          'There was an error returning all items: ' + error.error.error
        );
      },
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  ngAfterViewInit() {
    document.getElementById('display-name')!.innerHTML =
      this.user.first_name + ' ' + this.user.last_name;
  }
}
