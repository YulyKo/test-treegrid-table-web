import { Injectable } from '@angular/core';
import {IColumn} from '../models/Column.interface';
import {HttpClient} from '@angular/common/http';
import {environment} from '../environments/environment';
import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ColumnService {
  private readonly API_URL = `${ environment.API_URL }/columns`;

  public columns: IColumn[];
  constructor(
    private http: HttpClient
  ) {}

  findByColumnField(field: string): IColumn {
    return this.columns.find(col => col.field === field);
  }

  getAllColumns(): Observable<IColumn[]> {
    return this.http.get<IColumn[]>(this.API_URL).pipe(
      tap((data) => {
        console.log(data);
        this.columns = data as IColumn[];
      })
    );
  }

  createColumn(columnData: Omit<IColumn, 'id'>): void {
    this.http.post<IColumn>(this.API_URL, columnData).subscribe();
  }
}
