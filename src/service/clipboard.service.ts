import {Injectable} from '@angular/core';
import {TreeGridComponent} from '@syncfusion/ej2-angular-treegrid';
import {RowService} from './row.service';
import IRow from '../models/Row.interface';

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  private treegrid: TreeGridComponent;
  private copiedPaths: Array<string[]>;

  constructor(private rowService: RowService) {}

  public async init(treegrid: TreeGridComponent): Promise<void> {
    this.treegrid = treegrid;

    const module = await this.listenPropertyInit<object>(treegrid, 'clipboardModule');
    const clipboardEl = await this.listenPropertyInit<HTMLTextAreaElement>(module, 'clipBoardTextArea');

    clipboardEl.addEventListener('copy', this.copy.bind(this));
  }

  private listenPropertyInit<T>(host: object, name: string): Promise<T> {
    return new Promise<T>(resolve => {
      let property;
      Object.defineProperty(host, name, {
        set: m => {
          property = m;
          resolve(property);
        },
        get: () => property
      });
    });
  }

  copy(): void {
    this.copiedPaths = this.treegrid.getSelectedRecords().map((row: IRow) => this.rowService.getRowPath(row));
  }

  paste(status: string, rowPath: string[]): void {
    this.rowService.paste(status, rowPath, this.copiedPaths);
  }
}
