import {Injectable} from '@angular/core';
import {TreeGridComponent} from '@syncfusion/ej2-angular-treegrid';
import {RowService} from './row.service';
import IRow from '../models/Row.interface';

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  private treegrid: TreeGridComponent;
  private copiedPaths: Array<string[]>;
  private lastSelectedPath: string[];

  constructor(private rowService: RowService) {}

  public async init(treegrid: TreeGridComponent): Promise<void> {
    this.treegrid = treegrid;

    this.treegrid.rowSelected.subscribe((row: { data: IRow }) => {
      this.lastSelectedPath = this.rowService.getRowPath(row.data);
    });

    treegrid.beforeCopy.subscribe(this.copy.bind(this));

    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'v') {
        this.paste('next', this.lastSelectedPath);
      }
    });
  }

  private copy(): void {
    this.copiedPaths = this.treegrid.getSelectedRecords().map((row: IRow) => this.rowService.getRowPath(row));
    // this.treegrid.clearSelection();
  }

  paste(status: string, rowPath: string[]): void {
    this.rowService.paste(status, rowPath, this.copiedPaths);
  }
}
