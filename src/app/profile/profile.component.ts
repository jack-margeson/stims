import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../classes/user';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatSidenav } from '@angular/material/sidenav';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatSidenavContainer, MatSidenav, HeaderComponent, SidenavComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements AfterViewInit {
  user: User;

  constructor(private authService: AuthService, private router: Router) {
    this.user = this.authService.getUser();
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  ngAfterViewInit() {
    document.getElementById('display-name')!.innerHTML =
      this.user.first_name + ' ' + this.user.last_name;

    this.authService.getRoles().subscribe({
      next: (roles: any) => {
        const roleList = document.getElementById('role-list')!;
        roles.forEach((role: any) => {
          const li = document.createElement('li');
          li.innerHTML = role.role_display_name;
          roleList.appendChild(li);
        });
      },
    });
  }

  logout() {
    this.authService.logout();
  }
}
