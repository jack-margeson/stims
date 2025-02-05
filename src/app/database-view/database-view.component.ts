import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatGridTile } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { DatabaseService } from '../services/database.service';
import { IDatabaseView } from '../interfaces/idatabase-view';
import { DatabaseViewCardComponent } from '../database-view-card/database-view-card.component';
import { repeat, repeatWhen } from 'rxjs';

@Component({
  selector: 'app-database-view',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatIcon,
    DatabaseViewCardComponent,
  ],
  templateUrl: './database-view.component.html',
  styleUrls: ['./database-view.component.scss'],
})
export class DatabaseViewComponent implements AfterViewInit {
  categories: IDatabaseView[] = [];

  constructor(private databaseService: DatabaseService) {
    this.databaseService.getDatabaseViewColumns().subscribe((results) => {
      this.categories = results.map((category) => {
        return {
          ...category,
          items: [],
        } as IDatabaseView;
      });

      this.databaseService
        .getCatalogData()
        .pipe(repeat({ delay: () => this.databaseService.reloadCatalog }))
        .subscribe((results) => {
          // clear all items (for retry)
          this.categories.forEach((category) => {
            category.items = [];
          });

          results.forEach((item) => {
            const category = this.categories.find(
              (category) => category.id === item.type_id
            );
            if (category) {
              category.items.push(item);
            }
          });
        });
    });
  }

  ngAfterViewInit(): void {}
}
