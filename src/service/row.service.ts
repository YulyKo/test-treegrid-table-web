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

  iterateRows(rows, callback) {
    function iterate(items) {
      for (const row of items) {
        callback(row);
        this.iterate(row.subrows);
      }
    }
  
    iterate(rows);
  }
  
  getFieldDataArray(rows): any[] {
  
    let filedsValues: string [];
    this.iterateRows(rows, row => {
      if (row.subtasks.length !== 0) {
        filedsValues['subrows'].push(row);
      } else {
        filedsValues.push(row);
      }
    });
    return filedsValues;
  }

  // getVirtualData(): any {
  //   let parent: number = -1;
  //   let crew: string = 'Crew';
  //   let parentId: number ;
  //   let columnsFieldNames = Object.keys(this.rows[0]);
  //   let data = [];
  //   columnsFieldNames.forEach(field => {
  //     data.push({})
  //   });
  //   let allRows: IRow[] = this.getFieldDataArray(this.rows); // замісь name  назва філда колонки
  //   allRows.forEach(row => {
  //     if (row.subrows.length > 0) {
  //       parent = row.index;
  //     }

  //   })
  //   for (let i: number = 0; i < allRows.length; i++) {        
  //       if (i % 5 === 0) {
  //           parent = i;
  //       }
  //       if (i % 5 !== 0) {
  //           let num:number = isNaN((virtualData.length % parent)- 1) ?  0 : (virtualData.length % parent) - 1;
  //           virtualData[num][crew].push({
  //               'TaskID': i + 1,
  //               'FIELD1': names[Math.floor(Math.random() * names.length)],
  //               'FIELD2': 1967 + (i % 10),
  //               'FIELD3': Math.floor(Math.random() * 200),
  //               'FIELD4': Math.floor(Math.random() * 100),
  //               'FIELD5': Math.floor(Math.random() * 2000),
  //               'FIELD6': Math.floor(Math.random() * 1000),
  //               'FIELD7': Math.floor(Math.random() * 100),
  //               'FIELD8': Math.floor(Math.random() * 10),
  //               'FIELD9': Math.floor(Math.random() * 10),
  //               'FIELD10': Math.floor(Math.random() * 100),
  //               'FIELD11': Math.floor(Math.random() * 100),
  //               'FIELD12': Math.floor(Math.random() * 1000),
  //               'FIELD13': Math.floor(Math.random() * 10),
  //               'FIELD14': Math.floor(Math.random() * 10),
  //               'FIELD15': Math.floor(Math.random() * 1000),
  //               'FIELD16': Math.floor(Math.random() * 200),
  //               'FIELD17': Math.floor(Math.random() * 300),
  //               'FIELD18': Math.floor(Math.random() * 400),
  //               'FIELD19': Math.floor(Math.random() * 500),
  //               'FIELD20': Math.floor(Math.random() * 700),
  //               'FIELD21': Math.floor(Math.random() * 800),
  //               'FIELD22': Math.floor(Math.random() * 1000),
  //               'FIELD23': Math.floor(Math.random() * 2000),
  //               'FIELD24': Math.floor(Math.random() * 150),
  //               'FIELD25': Math.floor(Math.random() * 1000),
  //               'FIELD26': Math.floor(Math.random() * 100),
  //               'FIELD27': Math.floor(Math.random() * 400),
  //               'FIELD28': Math.floor(Math.random() * 600),
  //               'FIELD29': Math.floor(Math.random() * 500),
  //               'FIELD30': Math.floor(Math.random() * 300),
  //           });
  //       } else {
  //           virtualData.push({
  //               'TaskID': i + 1,
  //               'Crew': [],
  //               'FIELD1': names[Math.floor(Math.random() * names.length)],
  //               'FIELD2': 1967 + (i % 10),
  //               'FIELD3': Math.floor(Math.random() * 200),
  //               'FIELD4': Math.floor(Math.random() * 100),
  //               'FIELD5': Math.floor(Math.random() * 2000),
  //               'FIELD6': Math.floor(Math.random() * 1000),
  //               'FIELD7': Math.floor(Math.random() * 100),
  //               'FIELD8': Math.floor(Math.random() * 10),
  //               'FIELD9': Math.floor(Math.random() * 10),
  //               'FIELD10': Math.floor(Math.random() * 100),
  //               'FIELD11': Math.floor(Math.random() * 100),
  //               'FIELD12': Math.floor(Math.random() * 1000),
  //               'FIELD13': Math.floor(Math.random() * 10),
  //               'FIELD14': Math.floor(Math.random() * 10),
  //               'FIELD15': Math.floor(Math.random() * 1000),
  //               'FIELD16': Math.floor(Math.random() * 200),
  //               'FIELD17': Math.floor(Math.random() * 300),
  //               'FIELD18': Math.floor(Math.random() * 400),
  //               'FIELD19': Math.floor(Math.random() * 500),
  //               'FIELD20': Math.floor(Math.random() * 700),
  //               'FIELD21': Math.floor(Math.random() * 800),
  //               'FIELD22': Math.floor(Math.random() * 1000),
  //               'FIELD23': Math.floor(Math.random() * 2000),
  //               'FIELD24': Math.floor(Math.random() * 150),
  //               'FIELD25': Math.floor(Math.random() * 1000),
  //               'FIELD26': Math.floor(Math.random() * 100),
  //               'FIELD27': Math.floor(Math.random() * 400),
  //               'FIELD28': Math.floor(Math.random() * 600),
  //               'FIELD29': Math.floor(Math.random() * 500),
  //               'FIELD30': Math.floor(Math.random() * 300),
  //           });
  //       }
  // }
}
