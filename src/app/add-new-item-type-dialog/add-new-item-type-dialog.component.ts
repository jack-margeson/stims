import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';
import { NotificationService } from '../services/notification.service';
import { MatListModule } from '@angular/material/list';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatChipEditedEvent,
  MatChipInputEvent,
  MatChipsModule,
} from '@angular/material/chips';
import { COMMA, ENTER, SEMICOLON } from '@angular/cdk/keycodes';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconPickerModule } from 'ngx-icon-picker';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-add-new-item-type-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatListModule,
    DragDropModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    IconPickerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-new-item-type-dialog.component.html',
  styleUrl: './add-new-item-type-dialog.component.scss',
})
export class AddNewItemTypeDialogComponent implements AfterContentInit {
  readonly dialogRef = inject(MatDialogRef<AddNewItemTypeDialogComponent>);
  separatorKeyCodes = [ENTER, COMMA, SEMICOLON] as const;

  submitDisabled = true;

  form: FormGroup;

  constructor(
    private authService: AuthService,
    private databaseService: DatabaseService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      type_name: ['', Validators.required],
      type_name_plural: ['', Validators.required],
      tag_type_id: ['1', Validators.required],
      icon: ['book', Validators.required],
      args: [[], Validators.required],
    });

    this.form.valueChanges.subscribe(() => {
      console.log(this.form.value);
      this.submitDisabled =
        this.form.invalid || this.form.value.args.length < 2;
    });
  }

  ngAfterContentInit(): void {}

  drop(event: any): void {
    moveItemInArray(
      this.form.value.args,
      event.previousIndex,
      event.currentIndex
    );
  }

  add(event: MatChipInputEvent): void {
    let value = (event.value || '').trim();
    value = value.toLowerCase();

    // Add arg
    if (value) {
      if (this.validateArg(value)) {
        this.form.patchValue({ args: [...this.form.value.args, value] });
      }
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(arg: any): void {
    this.form.patchValue({
      args: this.form.value.args.filter((a: any) => a !== arg),
    });
  }

  edit(arg: any, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove arg if it no longer has a name
    if (!value) {
      this.remove(arg);
      return;
    }

    // Edit existing arg
    if (this.validateArg(value)) {
      this.form.patchValue({
        args: this.form.value.args.map((a: any) => (a === arg ? value : a)),
      });
    }
  }

  validateArg(arg: string): boolean {
    if (this.form.value.args.includes(arg)) {
      this.notificationService.showNotification(
        'Duplicate arguments are not allowed.'
      );
      return false;
    }

    try {
      JSON.parse(`{"${arg}": ""}`);
    } catch (e) {
      this.notificationService.showNotification('Invalid argument name.');
      return false;
    }

    return true;
  }

  onIconPickerSelect(icon: string): void {
    this.form.patchValue({ icon: icon });
    (document.getElementById('iconInput') as HTMLInputElement)!.value = icon;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    let itemType = {
      ...this.form.value,
      display_name: this.form.value.type_name,
      display_name_plural: this.form.value.type_name_plural,
      type_name: this.form.value.type_name.toLowerCase(),
    };
    this.databaseService.addItemType(itemType).subscribe(
      (response) => {
        this.notificationService.showNotification(
          'Item type added successfully.'
        );
        this.dialogRef.close();
      },
      (error) => {
        this.notificationService.showNotification(
          'Failed to add item type: ' + error.error.error
        );
      }
    );
  }
}
