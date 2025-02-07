import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItemDetailDialogComponent } from '../item-detail-dialog/item-detail-dialog.component';

@Component({
  selector: 'app-database-view-card',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './database-view-card.component.html',
  styleUrl: './database-view-card.component.scss',
})
export class DatabaseViewCardComponent implements OnChanges {
  @Input() item: any;

  isUnavailable: boolean = false;
  orderedItemArgs: Array<Array<any>> = [];
  readonly dialog = inject(MatDialog);

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.isUnavailable = this.item.status != 1;
    if (changes['item']) {
      Object.getOwnPropertyNames(this.item.args).forEach((arg) => {
        this.orderedItemArgs.push([arg, this.item.args[arg]]);
      });
    }
  }

  onClick(): void {
    this.openDialog('300ms', '500ms');
  }

  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(ItemDetailDialogComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '85%',
      width: '70%',
      data: this.item,
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  truncate(string: string, length: number): string {
    return string.length > length
      ? string.substring(0, length) + '...'
      : string;
  }
}
