import { Injectable } from '@angular/core';
import IRow from '../models/Row.interface';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {merge, Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
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
  private readonly API_URL = `${environment.API_URL}/rows`;

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
    return this.http.get<IRow[]>(this.API_URL);
  }

  createRow(rowStatus: string, rowData: IRow, path: string[]): void {
    rowData.subrows = [];
    this.http.post<ICreatePayload>(this.API_URL, { rowData, rowStatus, path }).subscribe();
  }

  updateRow(rowData: ICreatePayload, path: string[]): void {
    this.http.patch<ICreatePayload>(this.API_URL, { rowData, path }).subscribe();
  }

  removeRow(path: string[]): void {
    this.http.request('DELETE', this.API_URL, { body: { paths: [path] } }).subscribe();
  }

  getRowPath(initRow: IRow): string[] {
    const path = [];
    let row = initRow;

    while (row) {
      path.unshift(row.id);
      row = row.parentItem as any as IRow;
    }

    return path;
  }

  paste(rowStatus: string, toPath: string[], fromPaths: Array<string[]>): void {
    this.http.post<ICreatePayload>(`${this.API_URL}/paste`, { fromPaths, rowStatus, toPath }).subscribe();
  }

  removeMany(rows: any[]): void {
    rows.forEach(row => {
      this.removeRow(row);
    });
  }

}
