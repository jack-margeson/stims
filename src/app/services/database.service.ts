import { Injectable, Type } from '@angular/core';
import { IDatabaseView } from '../interfaces/idatabase-view';

// Import item classes
import { Item } from '../classes/item';
import { Book } from '../classes/book';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor() {}

  getDatabaseViewColumns(): IDatabaseView[] {
    return [
      {
        type: Item,
        displayName: 'Items',
        description: 'A list of items',
        icon: 'item',
      },
      {
        type: Book,
        displayName: 'Books',
        description: 'A list of books',
        icon: 'book',
      },
      {
        type: Book,
        displayName: 'Books',
        description: 'A list of books',
        icon: 'book',
      },
      {
        type: Book,
        displayName: 'Books',
        description: 'A list of books',
        icon: 'book',
      },
      {
        type: Book,
        displayName: 'Books',
        description: 'A list of books',
        icon: 'book',
      },
    ];
  }
}
