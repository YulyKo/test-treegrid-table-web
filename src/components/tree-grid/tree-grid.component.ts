import {Component, OnInit, QueryList, RendererType2, ViewChild, ViewChildren} from '@angular/core';
import { ContextMenuItemModel, QueryCellInfoEventArgs } from '@syncfusion/ej2-angular-grids';
import { FormControl } from '@angular/forms';
import IRow from 'src/models/Row.interface';
import { AppService } from 'src/service/app.service';
import {
  Column, ColumnChooserService, ColumnsDirective,
  ContextMenuService,
  EditService,
  EditSettingsModel, InfiniteScrollService,
  PageService,
  PageSettingsModel,
  SelectionSettingsModel,
  ToolbarService,
  TreeGridComponent as TreeGridComp,
} from '@syncfusion/ej2-angular-treegrid';
import { closest, createElement } from '@syncfusion/ej2-base';
import {BeforeOpenCloseMenuEventArgs, ClickEventArgs, MenuEventArgs} from '@syncfusion/ej2-angular-navigations';
import { ColumnFormComponent } from '../forms/column-form/column-form.component';
import {IColumn} from '../../models/Column.interface';
import { DataType } from '../../models/enums/DataType.enum';
import { ColumnService } from '../../service/column.service';
import { RowFormComponent } from '../forms/row-form/row-form.component';
import { RowService } from '../../service/row.service';
import {WindowService} from '../../service/window.service';
import {Observable} from 'rxjs';
import {first, map, tap} from 'rxjs/operators';
import {CONTEXT_MENU_ITEMS} from './contextMenu.const';
import {DialogUtility} from '@syncfusion/ej2-angular-popups';
import {ClipboardService} from '../../service/clipboard.service';

import {
  DataManager,
  WebApiAdaptor
} from '@syncfusion/ej2-data';

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
    ColumnChooserService
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

  public dataManager: DataManager = new DataManager({
    url: 'https://vom-app.herokuapp.com/tasks?limit=14000',
    updateUrl: 'https://vom-app.herokuapp.com/tasks',
    insertUrl: 'https://vom-app.herokuapp.com/tasks',
    removeUrl: 'https://vom-app.herokuapp.com/tasks',
    crossDomain: true,
    adaptor: new WebApiAdaptor()
  });

  public readonly dataType = DataType;
  public readonly contextMenuItems = CONTEXT_MENU_ITEMS;

  public editSettings: EditSettingsModel | any;
  public pageSettings: PageSettingsModel;
  public selectionOptions: SelectionSettingsModel;
  public windowHeight$: Observable<number>;
  public windowWidth$: Observable<number>;

  public isLoading = true;

  columns: any[] = [];
  rows: IRow[] = [];
  private copiedRow: Element;
  listHeaders = [];

  constructor(
    private appService: AppService,
    private columnService: ColumnService,
    private rowService: RowService,
    private windowService: WindowService,
    private clipboardService: ClipboardService
  ) {
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
      if (this.isLoading) {
        this.rowService.loadRows();
      }
    });
    this.columnService.loadColumns();

    this.windowHeight$ = windowService.height$.pipe(
      map(height => height - this.windowService.getScrollbarWidth() - 30)
    );
    this.windowWidth$ = windowService.width$.pipe(
      map(width => width - this.windowService.getScrollbarWidth())
    );
  }

//   this.columns.forEach((column: IColumn) => {
//   const columnIndex = this.treegrid.getColumnIndexByField(column.field);
//   const columnElement = this.treegrid.getColumnHeaderByIndex(columnIndex) as HTMLElement;
//   console.log('column');
//   console.log(columnElement);
//   this.syncColumnStyles(columnElement, column);
// });

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

    this.selectionOptions = {
      type: 'Multiple',
      mode: 'Row'
    };

    this.pageSettings = { pageCount: 5, pageSize: 90 };
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
    const rowIndex = args.rowInfo.rowIndex;
    switch (args.item.id) {
      // column
      case 'newCol':
        this.columnForm.showDialog();
        break;
      case 'editCol':
        const columnData = args.column as Column;
        this.columnForm.showDialog(columnData);
        break;
      case 'deleteCol':
        this.deleteColumn(args.column.field);
        break;
      case 'addNext':
        this.showCreateRowDialog(args, 'next');
        break;
      case 'addChild':
        this.showCreateRowDialog(args, 'child');
        break;
      case 'editRow':
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
        break;
      case 'cancelMultiSelect':
        this.treegrid.selectionSettings.type = 'Single';
        break;
      case 'columnChooser':
        this.treegrid.columnChooserModule.openColumnChooser();
        break;
    }
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
  }

  toolbarClick(args: ClickEventArgs): void {
    let rowIndex: number;
    let cellIndex: any;

    if (args.item.text === 'Add Parent' || args.item.text === 'Add Child') {
      // checking if any record is chosen for adding new record below/child to it
      if (this.treegrid.getSelectedRecords().length) {
        // if the 'Add Parent' or 'Add Child' option is choose,
        // setting newRowPosition accordingly and calling 'addRecord' method
        this.treegrid.editSettings.newRowPosition = (args.item.text === 'Add Parent') ? 'Below' : 'Child';
        this.treegrid.addRecord();
      } else if (args.item.text === 'Add Parent') {
        this.treegrid.editSettings.newRowPosition = 'Below';
        this.treegrid.addRecord();
      } else {
        // for adding with 'Child' newRowPosition, a record should be choosen. If not, showing alert
        alert('No record selected for Add Operation');
      }
    }
    if (args.item.id === 'customCopy') {
      rowIndex = this.treegrid.selectedRowIndex;
      cellIndex = this.treegrid.getSelectedRowCellIndexes;

    } else if (args.item.id === 'customPaste') {
      // @ts-ignore: Unreachable code error
      const copiedData = this.treegrid.clipboardModule.copyContent;

      this.treegrid.paste(copiedData, rowIndex, cellIndex);
    }
  }
}
