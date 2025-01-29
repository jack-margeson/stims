import { AfterViewInit, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IDatabaseView } from '../interfaces/idatabase-view';
import { map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private base_url = 'http://localhost:3000/';
  private book_cover_url = 'http://covers.openlibrary.org/b/isbn/';

  constructor(private httpClient: HttpClient) {}

  getBookCover(isbn: string): Observable<any> {
    return this.httpClient
      .get(`${this.book_cover_url}${isbn}-L.jpg`, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((response) => {
          return response.url;
        })
      );
  }

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
}
