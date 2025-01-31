import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

@Component({
  selector: 'app-item-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
  ],
  templateUrl: './item-detail-dialog.component.html',
  styleUrl: './item-detail-dialog.component.scss',
})
export class ItemDetailDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ItemDetailDialogComponent>);

  item = inject(MAT_DIALOG_DATA);
  orderedItemArgs: Array<Array<any>> = [];

  constructor() {
    Object.getOwnPropertyNames(this.item.args).forEach((arg) => {
      this.orderedItemArgs.push([arg, this.item.args[arg]]);
    });
  }
}
