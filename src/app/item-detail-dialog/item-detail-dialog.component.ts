import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  Component,
  inject,
} from '@angular/core';
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
export class ItemDetailDialogComponent implements AfterContentInit {
  readonly dialogRef = inject(MatDialogRef<ItemDetailDialogComponent>);
  checkoutDisabled: boolean = false;

  item = inject(MAT_DIALOG_DATA);
  orderedItemArgs: Array<Array<any>> = [];

  constructor() {
    Object.getOwnPropertyNames(this.item.args).forEach((arg) => {
      if (arg != 'image') {
        this.orderedItemArgs.push([arg, this.item.args[arg]]);
      }
    });
  }

  ngAfterContentInit(): void {
    if (this.item.status == 2) {
      // checked out
      document.getElementById('checkout-button')!.innerText = 'Checked Out';

      this.checkoutDisabled = true;
    } else if (
      // lost, damaged, or in repair
      this.item.status == 3 ||
      this.item.status == 4 ||
      this.item.status == 5
    ) {
      document.getElementById('checkout-button')!.innerText = 'Unavailable';

      this.checkoutDisabled = true;
    }
  }

  titlefy(arg: string): string {
    return arg.replace(/_/g, ' ').replace(/\b\w/, (char) => char.toUpperCase());
  }
}
