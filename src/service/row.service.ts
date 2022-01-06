import { Injectable } from '@angular/core';
import IRow from '../models/Row.interface';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {merge, Observable, Subject} from 'rxjs';
import {IColumn} from '../models/Column.interface';
import {tap, map} from 'rxjs/operators';
import {ColumnService} from './column.service';
import {DataType} from '../models/enums/DataType.enum';
import {SocketService} from './socket.service';

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

  private rowsSubject = new Subject<IRow[]>();
  public rows: IRow[] = [];
  public rows$: Observable<Array<IRow>> = this.rowsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private columnService: ColumnService,
    private socketService: SocketService
  ) {}

  loadRows(): void {
    merge(this.getAllRows(), this.socketService.rowUpdate$).pipe(
      map(data => {
        return data.map(row => {
          this.columnService.columns.forEach(column => {
            if (column.dataType === DataType.DATE) {
              row[column.field] = new Date(row[column.field] as number);
            }
          });
          return row;
        });
      })
    ).subscribe((rows) => {
      this.rows = rows;
      this.rowsSubject.next(rows);
    });
  }

  getAllRows(): Observable<IRow[]> {
    return this.http.get<IRow[]>(`${ this.API_URL }/rows`);
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
