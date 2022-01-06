import { Component, OnInit, ViewChild } from '@angular/core';
import { ContextMenuItemModel, QueryCellInfoEventArgs } from '@syncfusion/ej2-angular-grids';
import { FormControl } from '@angular/forms';
import IRow from 'src/models/Row.interface';
import { AppService } from 'src/service/app.service';
import {
  Column,
  ContextMenuService,
  EditService,
  EditSettingsModel, InfiniteScrollService,
  PageService,
  PageSettingsModel,
  SelectionSettingsModel,
  ToolbarService,
  TreeGridComponent as TreeGridComp,
} from '@syncfusion/ej2-angular-treegrid';
import { ClickEventArgs } from '@syncfusion/ej2-angular-navigations';
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
    InfiniteScrollService
  ]
})
export class TreeGridComponent implements OnInit {

  @ViewChild('treegrid')
  public treegrid!: TreeGridComp;

  @ViewChild('columnForm')
  columnForm: ColumnFormComponent;

  @ViewChild('rowForm')
  rowForm: RowFormComponent;

  public readonly dataType = DataType;
  public readonly contextMenuItems = CONTEXT_MENU_ITEMS;

  public editSettings: EditSettingsModel | any;
  public pageSettings: PageSettingsModel;
  public selectionOptions: SelectionSettingsModel;
  public windowHeight$: Observable<number>;
  public windowWidth$: Observable<number>;

  public isLoading = true;

  columns: IColumn[] = [];
  rows: IRow[] = [];

  constructor(
    private appService: AppService,
    private columnService: ColumnService,
    private rowService: RowService,
    private windowService: WindowService
  ) {
    this.rowService.rows$.subscribe((rows) => {
      this.rows = rows;
      this.isLoading = false;
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

  ngOnInit(): void {
    // for edit and create
    this.editSettings = {
      allowEditing: false,
      allowAdding: false,
      allowDeleting: true,
      mode: 'Dialog',
      // newRowPosition: 'Child',
      showDeleteConfirmDialog: true,
      // newRowPosition: 'Child'
    };

    this.selectionOptions = {
      persistSelection: false,
      enableToggle: true
    };

    this.pageSettings = { pageCount: 5, pageSize: 90 };
  }

  contextMenuClick(args: any): void {
    console.log('i am a life!!!', args.item.text, args.item.id);
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
        this.columnService.removeByField(args.column.field);
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
        this.rowService.removeRow(this.getRowPath(args.rowInfo.rowData));
    }
  }

  showCreateRowDialog(args: any, rowStatus: string): void {
    this.rowForm.showCreateDialog(rowStatus, this.getRowPath(args.rowInfo.rowData));
  }

  showEditRowDialog(args: any): void {
    const row = args.rowInfo.rowData;
    this.rowForm.showUpdateDialog(row, this.getRowPath(row));
  }

  private getRowPath(initRow: IRow): string[] {
    const path = [];
    let row = initRow;

    while (row) {
      path.unshift(row.id);
      row = row.parentItem as any as IRow;
    }

    return path;
  }

  customizeSelf(args: QueryCellInfoEventArgs): void {
    const field = args.column.field;

    if (field !== 'index' && field !== 'checkbox') {
      const cellElement = args.cell as HTMLElement;
      cellElement.classList.add('column-cell');

      const initialColumn = this.columnService.findByColumnField(field);

      if (!initialColumn) {
        return;
      }

      this.syncColumnStyles(cellElement, initialColumn);

      const subscription = this.columnService.columns$.subscribe(() => {
        const column = this.columnService.findByColumnField(field);

        if (column) {
          this.syncColumnStyles(cellElement, column);
        } else {
          subscription.unsubscribe();
        }
      });
    }
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
      // checking if any record is choosen for adding new record below/child to it
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

      this.treegrid.copy();
    } else if (args.item.id === 'customPaste') {
      // @ts-ignore: Unreachable code error
      const copiedData = this.treegrid.clipboardModule.copyContent;

      this.treegrid.paste(copiedData, rowIndex, cellIndex);
    }
  }

}
