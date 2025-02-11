import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';
import { NotificationService } from '../services/notification.service';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-assign-user-roles-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './assign-user-roles-dialog.component.html',
  styleUrl: './assign-user-roles-dialog.component.scss',
})
export class AssignUserRolesDialogComponent {
  readonly dialogRef = inject(MatDialogRef<AssignUserRolesDialogComponent>);

  allRoles: any[] = [];
  allUsers: any[] = [];
  selectedUser: any;
  submitDisabled = true;

  form: FormGroup;

  constructor(
    private authService: AuthService,
    private databaseService: DatabaseService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      user_id: ['', Validators.required],
    });

    this.databaseService.getAllUsers().subscribe({
      next: (users: any) => {
        this.allUsers = users;
      },
    });

    this.databaseService.getAllRoles().subscribe({
      next: (roles: any) => {
        this.allRoles = roles;
        const roleControls = this.allRoles.reduce((acc, role) => {
          acc['role_' + role.role_id] = this.fb.control(false);
          return acc;
        }, {});
        this.form.addControl('roles', this.fb.group(roleControls));
      },
    });

    this.form.valueChanges.subscribe(() => {
      if (this.form.value.user_id != this.selectedUser?.user_id) {
        this.selectedUser = this.allUsers.find(
          (user) => user.user_id === parseInt(this.form.value.user_id, 10)
        );
        if (this.selectedUser) {
          const rolesGroup = this.form.get('roles') as FormGroup;
          Object.keys(rolesGroup.controls).forEach((key) => {
            rolesGroup.get(key)?.patchValue(false, { emitEvent: false });
          });
          this.selectedUser.roles.forEach((role: any) => {
            this.form
              .get('roles')
              ?.get('role_' + role.role_id)
              ?.patchValue(true, { emitEvent: false });
          });
        }
      }

      this.submitDisabled = !(
        this.form.valid && this.selectedUser != undefined
      );
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    const selectedRoles = this.allRoles
      .filter(
        (role) => this.form.get('roles')?.get('role_' + role.role_id)?.value
      )
      .map((role) => role.role_id);

    const payload = {
      user_id: this.form.value.user_id,
      roles: selectedRoles,
    };

    this.databaseService.editUserRoles(payload).subscribe({
      next: (response) => {
        this.notificationService.showNotification(
          'User roles edited successfully.'
        );
      },
      error: (error) => {
        this.notificationService.showNotification(
          'Failed to assign roles: ' + error.error.error
        );
      },
    });

    this.dialogRef.close();
  }
}
