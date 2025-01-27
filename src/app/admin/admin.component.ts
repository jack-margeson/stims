import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../classes/user';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatSidenav } from '@angular/material/sidenav';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [MatSidenavContainer, MatSidenav, HeaderComponent, SidenavComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
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
  }
}
