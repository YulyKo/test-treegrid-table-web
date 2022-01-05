import { Injectable } from '@angular/core';
import IRow from '../models/Row.interface';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import IColumn from '../models/Column.interface';
import {tap, map} from 'rxjs/operators';
import {ColumnService} from './column.service';
import {DataType} from '../models/enums/DataType.enum';

@Injectable({
  providedIn: 'root'
})
export class RowService {
  private readonly API_URL = environment.API_URL;

  public rows: IRow[];

  constructor(
    private http: HttpClient,
    private columnService: ColumnService
  ) {}

  getAllRows(): Observable<IRow[]> {
    return this.http.get<IRow[]>(`${ this.API_URL }/rows`).pipe(
      map(data => {
        return data.map(row => {
          this.columnService.columns.forEach(column => {
            if (column.dataType === DataType.DATE) {
              row[column.field] = new Date(row[column.field] as number);
            }
          });
          return row;
        });
      }),
      tap((data) => {
        this.rows = data;
      })
    );
  }

}
