import { AfterViewInit, Component, Input, input } from '@angular/core';
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
  @Input() searchTerm: string = '';
  categories: IDatabaseView[] = [];

  constructor(private databaseService: DatabaseService) {
    this.databaseService.getDatabaseViewColumns().subscribe((results) => {
      this.categories = results.map((category) => {
        return {
          ...category,
          items: [],
          hidden: false,
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
              item.hidden = false;
              category.items.push(item);
            }
          });
        });
    });
  }

  ngOnChanges(changes: any): void {
    if (changes.searchTerm) {
      if (changes.searchTerm.currentValue === '') {
        this.categories.forEach((category) => {
          category.items.forEach((item) => {
            item.hidden = false;
          });
          category.hidden = false;
        });
      } else {
        this.categories.forEach((category) => {
          let allItemsHidden = true;
          category.items.forEach((item) => {
            item.hidden = !this.search(item, changes.searchTerm.currentValue);
            if (!item.hidden) {
              allItemsHidden = false;
            }
          });

          category.hidden = allItemsHidden;
        });
      }
    }
  }

  search(item: any, searchTerm: string): boolean {
    // Match the item's tag_data
    if (item.tag_data.toString() === searchTerm) {
      return true;
    }

    // Search all keys in the item except "image"
    const excludedKeys = ['image', 'publication_date'];
    for (const key in item.args) {
      if (
        !excludedKeys.includes(key) &&
        item.args[key]
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ) {
        return true;
      }
    }

    // Item was not found
    return false;
  }

  ngAfterViewInit(): void {}
}
