import { Routes } from '@angular/router';
import { adminGuard, authGuard, catalogerGuard } from './services/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { IntakeComponent } from './intake/intake.component';
import { App404Component } from './404/404.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  {
    path: 'intake',
    component: IntakeComponent,
    canActivate: [authGuard, catalogerGuard],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, adminGuard],
  },
  { path: '**', component: App404Component },
];
