import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../classes/user';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatSidenav } from '@angular/material/sidenav';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import {
  FormGroupDirective,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatabaseService } from '../services/database.service';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../services/notification.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-intake',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSidenavContainer,
    MatSidenav,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    HeaderComponent,
    SidenavComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './intake.component.html',
  styleUrl: './intake.component.scss',
})
export class IntakeComponent {
  form: FormGroup;
  user: User;

  itemTypes: any[] = [];
  selectedItemType: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private databaseService: DatabaseService,
    private notificationService: NotificationService
  ) {
    this.user = this.authService.getUser();

    // Get item types from the database
    this.databaseService.getDatabaseItemTypes().subscribe((itemTypes: any) => {
      this.itemTypes = itemTypes;
    });

    this.form = this.fb.group({
      itemType: ['', Validators.required],
      tagData: ['', Validators.required],
      image: [''],
    });

    this.form.valueChanges.subscribe((value) => {
      if (value?.itemType !== this.selectedItemType?.id) {
        this.selectedItemType = this.itemTypes.find(
          (itemType) => itemType.id === value.itemType
        );

        const argsObject = this.selectedItemType?.args.reduce(
          (acc: any, arg: any) => {
            acc[arg] = '';
            return acc;
          },
          {}
        );

        // Reset the form and then include the new arguments.
        this.form.patchValue({ tagData: '', image: '' }, { emitEvent: false });
        this.form.removeControl('args', { emitEvent: false });
        const argsGroup = this.fb.group(
          Object.keys(argsObject).reduce((acc: any, key: string) => {
            acc[key] = ['', Validators.required];
            return acc;
          }, {})
        );
        this.form.addControl('args', argsGroup, { emitEvent: false });
        // Blank out the image input.
        document
          .getElementById('imageInput')
          ?.setAttribute('src', 'assets/png/no_img_available.png');
      }
    });
  }

  getFormType(arg: string) {
    if (arg.includes('date')) {
      return 'date';
    } else {
      return 'default';
    }
  }

  findImage(): void {
    // Handle books separately
    if (this.selectedItemType?.name === 'book') {
      if (this.form.value['tagData'] === '') {
        this.notificationService.showNotification('No tag data provided.');
      } else {
        this.databaseService.getBookCover(this.form.value['tagData']).subscribe(
          (data) => {
            this.notificationService.showNotification('Book cover found.');
            this.form.patchValue({ image: data });
            document.getElementById('imageInput')?.setAttribute('src', data);
          },
          (error) => {
            this.notificationService.showNotification('Book cover not found.');
            document
              .getElementById('imageInput')
              ?.setAttribute('src', 'assets/png/no_img_available.png');
          }
        );
      }
    } else {
      // Generic image search
      console.log(this.form.value);
      const searchQuery = this.form.value.args
        ? Object.values(this.form.value.args)[0]?.toString() || ''
        : '';
      if (searchQuery === '') {
        this.notificationService.showNotification('No name provided.');
      } else {
        this.databaseService.getGenericImage(searchQuery).subscribe(
          (data) => {
            if (data) {
              this.notificationService.showNotification('Image found.');
              this.form.patchValue({ image: data });
              document.getElementById('imageInput')?.setAttribute('src', data);
            } else {
              this.notificationService.showNotification('Image not found.');
              document
                .getElementById('imageInput')
                ?.setAttribute('src', 'assets/png/no_img_available.png');
            }
          },
          (error) => {
            this.notificationService.showNotification('Error fetching image.');
            document
              .getElementById('imageInput')
              ?.setAttribute('src', 'assets/png/no_img_available.png');
          }
        );
      }
    }
  }

  addItem(event: any): void {
    event.preventDefault();

    if (this.form.valid) {
      // Construct the item object for submission
      const item: any = {
        type_id: this.form.value.itemType,
        tag_data: this.form.value.tagData,
        args: JSON.stringify(this.form.value.args),
        image: this.form.value.image,
        status: 1,
      };

      this.databaseService.addItem(item).subscribe(
        (response) => {
          this.notificationService.showNotification('Item added successfully.');

          // Reset everything but the item type, clear the validators
          this.form.reset({
            itemType: this.form.value.itemType,
          });
          this.form.clearValidators();
          this.form.updateValueAndValidity();
          document
            .getElementById('imageInput')
            ?.setAttribute('src', 'assets/png/no_img_available.png');
        },
        (error) => {
          this.notificationService.showNotification(
            'Error adding item: ' + error.error.error
          );
        }
      );
    } else {
      this.notificationService.showNotification(
        'Please fill out all required fields.'
      );
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  titlefy(arg: string): string {
    return arg.replace(/_/g, ' ').replace(/\b\w/, (char) => char.toUpperCase());
  }
}
