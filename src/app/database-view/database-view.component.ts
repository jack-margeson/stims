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
  @Input() filters: object = {};

  categories: IDatabaseView[] = [];
  currentSearchTerm: string = '';
  currentFilters: any = {};
  noCategoriesVisible: boolean = false;

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
    if (changes.filters?.currentValue) {
      this.currentFilters = changes.filters.currentValue;
    }
    if (
      changes.searchTerm?.currentValue ||
      changes.searchTerm?.currentValue === ''
    ) {
      this.currentSearchTerm = changes.searchTerm.currentValue;
    }

    this.categories.forEach((category) => {
      category.items.forEach((item) => {
        item.hidden = false;

        // Apply filters
        if (this.currentFilters.hideUnavailableItems && item.status !== 1) {
          item.hidden = true;
        }

        // Apply search term
        if (
          this.currentSearchTerm &&
          !this.search(item, this.currentSearchTerm)
        ) {
          item.hidden = true;
        }

        // Hide the category if all items are hidden
        category.hidden = category.items.every((item) => item.hidden);
      });

      // Show the "No Categories Visible" message if all categories are hidden
      this.noCategoriesVisible = this.categories.every(
        (category) => category.hidden
      );
    });
  }

  search(item: any, searchTerm: string): boolean {
    // If the search term is empty, return true
    if (!searchTerm) {
      return true;
    }

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
