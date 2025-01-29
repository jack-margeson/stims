import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-database-view-card',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './database-view-card.component.html',
  styleUrl: './database-view-card.component.scss',
})
export class DatabaseViewCardComponent implements OnChanges {
  @Input() item: any;

  orderedItemArgs: Array<Array<any>> = [];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item']) {
      Object.getOwnPropertyNames(this.item.args).forEach((arg) => {
        this.orderedItemArgs.push([arg, this.item.args[arg]]);
      });
    }
    console.log(this.orderedItemArgs);
  }
}
