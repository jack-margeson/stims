import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IDatabaseView } from '../interfaces/idatabase-view';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private base_url = 'http://localhost:3000/';

  constructor(private httpClient: HttpClient) {}

  getDatabaseViewColumns(): Observable<IDatabaseView[]> {
    return this.httpClient.get(`${this.base_url}getDatabaseViewColumns`).pipe(
      map((views: any) => {
        return views.map((view: any) => view as IDatabaseView);
      })
    );
  }
}
