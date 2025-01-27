import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../classes/user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatToolbarModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements AfterViewInit {
  @Output() toggleSidenav = new EventEmitter<void>();

  user: User;

  constructor(private router: Router, private authService: AuthService) {
    this.user = this.authService.getUser();
  }

  ngAfterViewInit() {
    document.getElementById('username')!.innerHTML = this.user.username;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  emitToggleSidenav() {
    this.toggleSidenav.emit();
  }
}
