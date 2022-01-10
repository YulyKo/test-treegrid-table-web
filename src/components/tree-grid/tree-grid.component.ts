import {Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import { QueryCellInfoEventArgs } from '@syncfusion/ej2-angular-grids';
import IRow from 'src/models/Row.interface';
import { AppService } from 'src/service/app.service';
import {
  Column, ColumnChooserService,
  ContextMenuService,
  EditService,
  EditSettingsModel, FilterSettingsModel, FreezeService, InfiniteScrollService,
  PageService,
  PageSettingsModel,
  SelectionSettingsModel,
  ToolbarService,
  TreeGridComponent as TreeGridComp,
} from '@syncfusion/ej2-angular-treegrid';
import { ColumnFormComponent } from '../forms/column-form/column-form.component';
import {IColumn} from '../../models/Column.interface';
import { DataType } from '../../models/enums/DataType.enum';
import { ColumnService } from '../../service/column.service';
import { RowFormComponent } from '../forms/row-form/row-form.component';
import { RowService } from '../../service/row.service';
import {WindowService} from '../../service/window.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CONTEXT_MENU_ITEMS} from './contextMenu.const';
import {DialogUtility} from '@syncfusion/ej2-angular-popups';
import {ClipboardService} from '../../service/clipboard.service';

@Component({
  selector: 'app-tree-grid',
  templateUrl: './tree-grid.component.html',
  styleUrls: ['./tree-grid.component.less'],
  providers: [
    AppService,
    ToolbarService,
    EditService,
    PageService,
    ContextMenuService,
    InfiniteScrollService,
    ColumnChooserService,
    FreezeService
  ]
})
export class TreeGridComponent implements OnInit {

  @ViewChild('treegrid')
  public treegrid!: TreeGridComp;

  @ViewChildren('treegrid', { read: TreeGridComp })
  public queriedTreegrid: QueryList<TreeGridComp>;

  @ViewChild('columnForm')
  columnForm: ColumnFormComponent;

  @ViewChild('rowForm')
  rowForm: RowFormComponent;

  public readonly dataType = DataType;
  public readonly contextMenuItems = CONTEXT_MENU_ITEMS;

  public editSettings: EditSettingsModel | any;
  public pageSettings: PageSettingsModel;
  public selectionOptions: SelectionSettingsModel;
  public sortSettings: object;
  public windowHeight$: Observable<number>;
  public windowWidth$: Observable<number>;

  public isLoading = true;
  public isRowFormOpen = false;
  public isColumnFormOpen = false;

  columns: any[] = [];
  columnsList: any[] = [];
  rows: IRow[] = [];
  private copiedRow: Element;
  listHeaders = [];

  allowFiltering = true;
  filterOptions: FilterSettingsModel;
  public allowMultiSorting = true;
  public sorting = false;
  private frozenColumns = 0;

  constructor(
    private appService: AppService,
    private columnService: ColumnService,
    private rowService: RowService,
    private windowService: WindowService,
    private clipboardService: ClipboardService
  ) {
    // this.filterSettings = {};
    this.rowService.rows$.subscribe((rows) => {
      this.rows = rows;

      if (this.isLoading) {
        this.isLoading = false;

        this.queriedTreegrid.changes.subscribe(() => {
          this.clipboardService.init(this.treegrid);
        });
      }
    });

    this.columnService.columns$.subscribe((columns) => {
      this.columns = columns;
      const sortedColumnFields = [];
      columns.forEach(column => {
        sortedColumnFields.push({
          field: column.field,
          direction: 'Ascending'
        });
      });
      this.sortSettings =  { columns: sortedColumnFields };
      if (this.isLoading) {
        this.rowService.loadRows();
      }
    });

    if (this.isLoading) {
      this.rowService.loadRows();
    }
    this.columnService.loadColumns();

    this.windowHeight$ = windowService.height$.pipe(
      map(height => height - this.windowService.getScrollbarWidth() - 30)
    );
    this.windowWidth$ = windowService.width$.pipe(
      map(width => width - this.windowService.getScrollbarWidth())
    );
  }

  ngOnInit(): void {
    // for edit and create
    this.editSettings = {
      allowEditing: false,
      allowAdding: false,
      allowDeleting: true,
      mode: 'Dialog',
      // newRowPosition: 'Child',
      showDeleteConfirmDialog: true
    };
    document.getElementsByClassName('e-filterbar').item(0).setAttribute('style', 'pointer-events: none;');
    this.selectionOptions = {
      type: 'Multiple',
      mode: 'Row'
    };

    this.pageSettings = { pageCount: 5, pageSize: 90 };
    const options = [];
    this.columns.forEach(column => {
      options.push({
        field: column.field,
        matchCase: false,
        operator: 'startswith',
        predicate: 'and',
        value: column.value
      });
    });

    this.filterOptions = {
      columns: options
    };
  }

  beforeCopy(args: any): void {
    console.log(args.data.split('\t')[this.columns.length - 1].split('\n'));
    const rowIndex = args.data.split('\t')[this.columns.length - 1].split('\n').at(-1);
    console.log(rowIndex);
    this.copiedRow = this.treegrid.getRowByIndex(rowIndex + 1);

    this.treegrid.copyHierarchyMode = 'None';
    this.copiedRow.setAttribute('style', 'background: #FFC0CB;');
    this.copiedRow.setAttribute('style', 'background: #FFC0CB;');
    this.copiedRow.setAttribute('style', 'background: #FFC0CB;');
  }

  public contextMenuBeforeOpen(args: any): void {
    const isRow = !!args.rowInfo.row;
    const isSystemField = this.isSystemColumn(args.column.field);
    const display = isRow || isSystemField ? 'none' : 'block';

    if (this.allowFiltering) {
      args.element.querySelector('#unfilter').style.display = 'block';
      args.element.querySelector('#filter').style.display = 'none';
    } else if (!this.allowFiltering) {
      args.element.querySelector('#unfilter').style.display = 'none';
      args.element.querySelector('#filter').style.display = 'block';
    }

    if (this.allowMultiSorting) {
      args.element.querySelector('#unmultiSort').style.display = 'block';
      args.element.querySelector('#multiSort').style.display = 'none';
    } else if (!this.allowMultiSorting) {
      args.element.querySelector('#unmultiSort').style.display = 'none';
      args.element.querySelector('#multiSort').style.display = 'block';
    }

    if (this.selectionOptions.type === 'Single') {
      args.element.querySelector('#cancelMultiSelect').style.display = 'none';
      args.element.querySelector('#multiSelect').style.display = 'block';
    } else if (this.selectionOptions.type === 'Multiple') {
      args.element.querySelector('#cancelMultiSelect').style.display = 'block';
      args.element.querySelector('#multiSelect').style.display = 'none';
    }

    args.element.querySelector('#editCol').style.display = display;
    args.element.querySelector('#deleteCol').style.display = display;
  }

  contextMenuClick(args: any): void {
    this.isColumnFormOpen = false;
    this.isRowFormOpen = false;
    const rowIndex = args.rowInfo.rowIndex;
    switch (args.item.id) {
      // column
      case 'newCol':
        this.isColumnFormOpen = true;
        this.columnForm.showDialog();
        break;
      case 'editCol':
        this.isColumnFormOpen = true;
        const columnData = args.column as Column;
        this.columnForm.showDialog(columnData);
        break;
      case 'deleteCol':
        this.deleteColumn(args.column.field);
        break;
      case 'addNext':
        this.isRowFormOpen = true;
        this.showCreateRowDialog(args, 'next');
        break;
      case 'addChild':
        this.isRowFormOpen = true;
        this.showCreateRowDialog(args, 'child');
        break;
      case 'editRow':
        this.isRowFormOpen = true;
        this.showEditRowDialog(args);
        break;
      case 'delRow':
        this.deleteRow(args.rowInfo.rowData);
        break;
      case 'copyRows':
        this.copiedRow = this.treegrid.getRowByIndex(rowIndex);
        console.log(this.copiedRow);
        this.treegrid.copyHierarchyMode = 'None';
        this.treegrid.copy();
        this.copiedRow.setAttribute('style', 'background: #FFC0CB;');
        break;
      case 'rowPasteNext':
        this.clipboardService.paste('next', this.rowService.getRowPath(args.rowInfo.rowData));
        break;
      case 'rowPasteChild':
        this.clipboardService.paste('child', this.rowService.getRowPath(args.rowInfo.rowData));
        this.copiedRow.setAttribute('style', 'background: #FFF;');
        break;
      case 'multiSelect':
        this.treegrid.selectionSettings.type = 'Multiple';
        this.selectionOptions.type = 'Multiple';
        break;
      case 'cancelMultiSelect':
        this.treegrid.selectionSettings.type = 'Single';
        this.selectionOptions.type = 'Single';
        break;
      case 'columnChooser':
        this.treegrid.columnChooserModule.openColumnChooser();
        break;
      case 'unfilter':
        // this.allowFiltering = false;
        args.element.querySelector('.e-filterbar').setAttribute('style', 'pointer-events: none;');
        this.treegrid.allowFiltering = false;
        break;
      case 'filter':
        // this.allowFiltering = true;
        args.element.querySelector('.e-filterbar').setAttribute('style', 'pointer-events: pointed;');
        this.treegrid.allowFiltering = true;
        break;
      case 'freeze':
        const index = args.column.index as number;
        this.frozenColumns = 0;
        this.frozenColumns = this.treegrid.frozenColumns === index ? 0 : index;
        break;
      case 'multiSort':
        // this.allowMultiSorting = !this.treegrid.allowMultiSorting;
        console.log(args.column.field);
        // this.sorting = !this.sorting;
        // this.treegrid.sortByColumn(args.column.field, 'Descending', this.allowMultiSorting);
        break;
      case 'unmultiSort':
        this.treegrid.removeSortColumn(args.column.field);
      }

    //    replace col index 1 with selected col
    this.treegrid.clearSelection();
  }

  showCreateRowDialog(args: any, rowStatus: string): void {
    this.rowForm.showCreateDialog(rowStatus, this.rowService.getRowPath(args.rowInfo.rowData));
  }

  showEditRowDialog(args: any): void {
    const row = args.rowInfo.rowData;
    this.rowForm.showUpdateDialog(row, this.rowService.getRowPath(row));
  }

  deleteColumn(field: string): void {
    const column = this.columnService.findByColumnField(field);

    this.showConfirm('Delete Column', `Are you sure that you want to delete column "${column.name}"`, () => {
      this.columnService.remove(column);
    });
  }

  deleteRow(row: IRow): void {
    this.showConfirm('Delete Row', `Are you sure that you want to delete row "${row.index}"`, () => {
      this.rowService.removeRow(this.rowService.getRowPath(row));
    });
  }

  showConfirm(title: string, content: string, onOk: () => void): void {
    const dialog = DialogUtility.confirm({
      title,
      content,
      okButton: {
        text: 'OK',
        click(): void {
          dialog.close();
          onOk();
        }
      },
      cancelButton: {
        text: 'Cancel',
        click: () => dialog.close()
      },
      showCloseIcon: false,
      closeOnEscape: true,
      animationSettings: {effect: 'Zoom'}
    });
  }

  customizeSelf(args: QueryCellInfoEventArgs): void {
    const field = args.column.field;

    if (this.isSystemColumn(field)) {
      return;
    }
    const cellElement = args.cell as HTMLElement;

    const columnIndex = this.treegrid.getColumnIndexByField(field);
    const columnElement = this.treegrid.getColumnHeaderByIndex(columnIndex) as HTMLElement;
    cellElement.classList.add('column-cell');
    columnElement.classList.add('header-cell');

    const initialColumn = this.columnService.findByColumnField(field);

    if (!initialColumn) {
      return;
    }

    this.syncColumnStyles(cellElement, initialColumn);
    this.syncColumnStyles(columnElement, initialColumn);

    const subscription = this.columnService.columns$.subscribe(() => {
      const column = this.columnService.findByColumnField(field);

      if (column) {
        this.syncColumnStyles(cellElement, column);
        this.syncColumnStyles(columnElement, column);
      } else {
        subscription.unsubscribe();
      }
    });
  }

  private isSystemColumn(field: string): boolean {
    return ['checkbox', 'index'].includes(field);
  }

  syncColumnStyles(el: HTMLElement, column: IColumn): void {
    el.style.setProperty('--cell-bg-color', column.backgroundColor);
    el.style.setProperty('--cell-color', column.fontColor);
    el.style.setProperty('--cell-font-size', `${ column.fontSize }px`);
    if (column.textWrap) {
      // el.style.setProperty('--cell-text-wrap', 'break-word');
      el.style.setProperty('--cell-text-white-space', 'nowrap');
    } else {
      el.style.setProperty('--cell-text-white-space', 'normal');
    }
  }
}
