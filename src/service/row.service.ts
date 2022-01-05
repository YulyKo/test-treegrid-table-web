import { Injectable } from '@angular/core';
import IRow from '../models/Row.interface';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import IColumn from '../models/Column.interface';
import {tap, map} from 'rxjs/operators';
import {ColumnService} from './column.service';
import {DataType} from '../models/enums/DataType.enum';

interface ICreatePayload {
  rowData: IRow;
  path: Array<string>;
  rowStatus: 'next' | 'child';
}

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

  createRow(rowData: ICreatePayload): void {
    // {
    //     "rowData": {
    //             "name": "TTTT",
    //             "startDate": 1486072800000,
    //             "endDate": 1486418400000,
    //             "progress": 100,
    //             "duration": 5,
    //             "priority": "Normal",
    //             "approved": false,
    //             "isInExpandState": true,
    //             "subrows": []
    //     },
    //     "path": ["39e3e82b-ed17-4c17-9ddb-59dac8a396e0-1", "39e3e82b-ed17-4c17-9ddb-59dac8a396e0-2"],
    //     "rowStatus": "next"
    // }
    this.http.post<ICreatePayload>(this.API_URL, rowData).subscribe();
  }
}
