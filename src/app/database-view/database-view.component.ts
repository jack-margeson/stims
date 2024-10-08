import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatGridTile } from '@angular/material/grid-list';
import { DatabaseService } from '../services/database.service';
import { IDatabaseView } from '../interfaces/idatabase-view';

@Component({
  selector: 'app-database-view',
  standalone: true,
  imports: [CommonModule, MatGridListModule, MatGridTile],
  templateUrl: './database-view.component.html',
  styleUrls: ['./database-view.component.scss'],
})
export class DatabaseViewComponent {
  categories = [] as IDatabaseView[];
  constructor(private databaseService: DatabaseService) {
    this.categories = this.databaseService.getDatabaseViewColumns();
  }
}
