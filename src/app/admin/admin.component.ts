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
import { MatTableModule, MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    MatSidenavContainer,
    MatSidenav,
    HeaderComponent,
    SidenavComponent,
    MatTableModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  user: User;
  allCheckedOutItems: any[] = [];
  allCheckedOutItemsColumns: string[] = [
    'type',
    'name',
    'userDisplayName',
    'username',
    'email',
    'checkedOutAt',
    'null',
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private databaseService: DatabaseService,
    private notificationService: NotificationService
  ) {
    this.user = this.authService.getUser();

    this.databaseService.getAllCheckedOutItems().subscribe({
      next: (items: any) => {
        this.allCheckedOutItems = items.map((item: any) => {
          return {
            ...item,
            item_name: item.args[Object.getOwnPropertyNames(item.args)[0]],
            checked_out_at: new Date(item.checked_out_at).toLocaleString(
              'en-US',
              {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }
            ),
          };
        });
      },
      error: (error: any) => {
        this.notificationService.showNotification(
          'There was an error retrieving checked out items: ' +
            error.error.error
        );
      },
    });
  }

  returnItem(user_id: any, item_id: any) {
    this.databaseService.returnItem(user_id, item_id).subscribe({
      next: (response) => {
        this.notificationService.showNotification(
          'Item returned successfully!'
        );

        // Remove the item from the checked out items list locally
        this.allCheckedOutItems = this.allCheckedOutItems.filter(
          (item) => item.item_id !== item_id
        );
      },
      error: (error) => {
        this.notificationService.showNotification(
          'Error returning item: ' + error.error.error
        );
      },
    });
  }

  returnAllItems() {
    this.databaseService.returnAllItems().subscribe({
      next: (response: any) => {
        this.notificationService.showNotification(
          'All items have been returned.'
        );

        // Clear the checked out items list locally
        this.allCheckedOutItems = [];
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
}
