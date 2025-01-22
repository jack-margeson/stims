import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatToolbarModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidenav = new EventEmitter<void>();

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    document.getElementById('username')!.innerText =
      this.authService.getUser().username;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  emitToggleSidenav() {
    this.toggleSidenav.emit();
  }
}
