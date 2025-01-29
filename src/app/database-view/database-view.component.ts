import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatGridTile } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { DatabaseService } from '../services/database.service';
import { IDatabaseView } from '../interfaces/idatabase-view';
import { DatabaseViewCardComponent } from '../database-view-card/database-view-card.component';

@Component({
  selector: 'app-database-view',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatGridTile,
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

      this.databaseService.getCatalogData().subscribe((results) => {
        results.forEach((item) => {
          const category = this.categories.find(
            (category) => category.id === item.type_id
          );
          if (category) {
            category.items.push(item);
          }
        });

        console.log(this.categories);
      });
    });
  }

  ngAfterViewInit(): void {}
}
