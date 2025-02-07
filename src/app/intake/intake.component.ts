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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatabaseService } from '../services/database.service';
import { CommonModule } from '@angular/common';

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
    private databaseService: DatabaseService
  ) {
    this.user = this.authService.getUser();

    // Get item types from the database
    this.databaseService.getDatabaseItemTypes().subscribe((itemTypes: any) => {
      this.itemTypes = itemTypes;
    });

    this.form = this.fb.group({
      itemType: [''],
      tagData: [''],
    });

    this.form.valueChanges.subscribe((value) => {
      if (value?.itemType !== this.selectedItemType?.id) {
        this.selectedItemType = this.itemTypes.find(
          (itemType) => itemType.id === value.itemType
        );

        const argsObject = this.selectedItemType.args.reduce(
          (acc: any, arg: any) => {
            acc[arg] = '';
            return acc;
          },
          {}
        );

        this.form.removeControl('args', { emitEvent: false });
        this.form.addControl('args', this.fb.group(argsObject), {
          emitEvent: false,
        });

        console.log(this.form.value);
      } else {
        console.log(this.form.value);
      }
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  titlefy(arg: string): string {
    return arg.replace(/_/g, ' ').replace(/\b\w/, (char) => char.toUpperCase());
  }
}
