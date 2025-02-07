import { AfterViewInit, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IDatabaseView } from '../interfaces/idatabase-view';
import { map, Observable, of, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private base_url = 'http://localhost:3000/';
  private book_cover_url = 'http://covers.openlibrary.org/b/isbn/';

  reloadCatalog = new Subject<any>();

  constructor(private httpClient: HttpClient) {}

  getCatalogData(): Observable<any[]> {
    return this.httpClient.get(`${this.base_url}getCatalogData`).pipe(
      map((catalog: any) => {
        return catalog.map((item: any) => item as any);
      })
    );
  }

  getDatabaseViewColumns(): Observable<IDatabaseView[]> {
    return this.httpClient.get(`${this.base_url}getDatabaseViewColumns`).pipe(
      map((views: any) => {
        return views.map((view: any) => view as IDatabaseView);
      })
    );
  }

  getDatabaseItemTypes(): Observable<any[]> {
    return this.httpClient.get(`${this.base_url}getDatabaseItemTypes`).pipe(
      map((itemTypes: any) => {
        return itemTypes.map((itemType: any) => itemType as any);
      })
    );
  }

  checkout(user_id: any, item_id: any): Observable<any> {
    return this.httpClient.post(`${this.base_url}checkout`, null, {
      params: {
        user_id: user_id,
        item_id: item_id,
      },
    });
  }

  returnItem(user_id: any, item_id: any): Observable<any> {
    return this.httpClient.post(`${this.base_url}return`, null, {
      params: {
        user_id: user_id,
        item_id: item_id,
      },
    });
  }

  getCheckedOutItemsByUserId(user_id?: any): Observable<any[]> {
    const params: any = {};
    if (user_id) {
      params.user_id = user_id;
    }

    return this.httpClient
      .get(`${this.base_url}getCheckedOutItemsByUserId`, {
        params: params,
      })
      .pipe(
        map((items: any) => {
          return items.map((item: any) => item as any);
        })
      );
  }

  getAllCheckedOutItems(): Observable<any[]> {
    return this.httpClient.get(`${this.base_url}getAllCheckedOutItems`).pipe(
      map((items: any) => {
        return items.map((item: any) => item as any);
      })
    );
  }

  returnAllItems(): Observable<any> {
    return this.httpClient.post(`${this.base_url}returnAllItems`, null);
  }

  addItem(item: Object): Observable<any> {
    return this.httpClient.post(`${this.base_url}addItem`, item);
  }

  getBookCover(isbn: string): Observable<any> {
    return this.httpClient
      .get(`${this.book_cover_url}${isbn}-L.jpg?default=false`, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((response) => {
          return response.url;
        })
      );
  }
}
