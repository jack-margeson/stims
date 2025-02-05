import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../classes/user';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatSidenav } from '@angular/material/sidenav';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { MatChipsModule } from '@angular/material/chips';
import { DatabaseService } from '../services/database.service';
import { MatTable, MatTableModule } from '@angular/material/table';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavContainer,
    MatSidenav,
    HeaderComponent,
    SidenavComponent,
    MatChipsModule,
    MatTableModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  user: User;
  userRoles: any[] = [];
  checkedOutItems: any[] = [];

  constructor(
    private authService: AuthService,
    private databaseService: DatabaseService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.user = this.authService.getUser();

    this.authService.getRoles().subscribe({
      next: (roles: any) => {
        roles.forEach((role: any) => {
          this.userRoles.push(role.role_display_name);
        });
      },
    });

    this.databaseService.getCheckedOutItems().subscribe({
      next: (items: any) => {
        this.checkedOutItems = items.map((item: any) => {
          return {
            ...item,
            name: item.args[Object.getOwnPropertyNames(item.args)[0]],
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

        console.log(this.checkedOutItems);
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
        this.checkedOutItems = this.checkedOutItems.filter(
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

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.authService.logout();
  }
}
