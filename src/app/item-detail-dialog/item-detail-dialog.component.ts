import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-item-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './item-detail-dialog.component.html',
  styleUrl: './item-detail-dialog.component.scss',
})
export class ItemDetailDialogComponent implements AfterContentInit {
  readonly dialogRef = inject(MatDialogRef<ItemDetailDialogComponent>);
  checkoutDisabled: boolean = false;

  item = inject(MAT_DIALOG_DATA);
  orderedItemArgs: Array<Array<any>> = [];

  constructor(
    private authService: AuthService,
    private databaseService: DatabaseService,
    private notificationService: NotificationService
  ) {
    Object.getOwnPropertyNames(this.item.args).forEach((arg) => {
      this.orderedItemArgs.push([arg, this.item.args[arg]]);
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

  checkout() {
    const user_id = this.authService.getUser()!.user_id;

    console.log(user_id, this.item.id);
    this.databaseService.checkout(user_id, this.item.id).subscribe(
      (response) => {
        console.log(response);
        if (response.checkout != null) {
          this.notificationService.showNotification(
            'Item checked out successfully!'
          );

          // Disable checkout button.
          this.checkoutDisabled = true;
          document.getElementById('checkout-button')!.innerText = 'Checked Out';

          this.databaseService.reloadCatalog.next(null);
        } else {
          this.notificationService.showNotification(
            "Couldn't checkout item: " + response.message
          );
        }
      },
      (error) => {
        this.notificationService.showNotification(
          "Couldn't checkout item: " + error.error.error
        );
      }
    );
  }

  titlefy(arg: string): string {
    return arg.replace(/_/g, ' ').replace(/\b\w/, (char) => char.toUpperCase());
  }
}
