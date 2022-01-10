import {Injectable} from '@angular/core';
import {webSocket} from 'rxjs/webSocket';
import {environment} from '../environments/environment';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {IColumn} from '../models/Column.interface';
import IRow from '../models/Row.interface';

interface ISocketEvent<T> {
  type: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private readonly websoket = webSocket(environment.SOCKET_URL);

  public readonly columnUpdate$ = this.listen<Array<IColumn>>('columns:update');
  public readonly rowUpdate$ = this.listen<Array<IRow>>('rows:update');

  private listen<T>(type: string): Observable<T> {
    return this.websoket.pipe(
      filter((event: ISocketEvent<T>) => {
        return event.type === type;
      }),
      map(event => event.data)
    );
  }
}
