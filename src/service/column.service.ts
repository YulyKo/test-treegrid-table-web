import { Injectable } from '@angular/core';
import {IColumn} from '../models/Column.interface';
import {HttpClient} from '@angular/common/http';
import {environment} from '../environments/environment';
import {map, tap} from 'rxjs/operators';
import {BehaviorSubject, merge, Observable, Subject} from 'rxjs';
import {SocketService} from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class ColumnService {
  private readonly API_URL = `${ environment.API_URL }/columns`;

  private columnsSubject = new Subject<IColumn[]>();
  public columns: IColumn[] = [];
  public columns$: Observable<Array<IColumn>> = this.columnsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private socketService: SocketService
  ) {}

  findByColumnField(field: string): IColumn {
    return this.columns.find(col => col.field === field);
  }

  getAllColumns(): Observable<IColumn[]> {
    return this.http.get<IColumn[]>(this.API_URL);
  }

  createColumn(columnData: Omit<IColumn, 'id'>): void {
    this.http.post<IColumn>(this.API_URL, columnData).subscribe();
  }

  updateColumn(id: string, columnData: Omit<IColumn, 'id'>): void {
    this.http.patch<IColumn>(`${this.API_URL}/${id}`, columnData).subscribe();
  }

  loadColumns(): void {
    merge(this.getAllColumns(), this.socketService.columnUpdate$).subscribe((columns) => {
      this.columns = columns;
      this.columnsSubject.next(columns);
    });
  }

  remove(column: IColumn): void {
    const ids = [column.id];
    this.http.request('DELETE', this.API_URL, { body: { ids } }).subscribe();
  }
}
