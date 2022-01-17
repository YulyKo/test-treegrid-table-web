import {Component, HostListener, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {QueryCellInfoEventArgs, SaveEventArgs} from '@syncfusion/ej2-angular-grids';
import IRow from 'src/models/Row.interface';
import { AppService } from 'src/service/app.service';

import {
  Column, ColumnChooserService,
  ContextMenuService,
  EditService,
  EditSettingsModel, FilterSettingsModel, FreezeService, InfiniteScrollService,
  PageService,
  PageSettingsModel,
  ResizeService,
  RowDDService,
  SelectionService,
  SelectionSettingsModel,
  ToolbarService,
  TreeGridComponent as TreeGridComp,
  VirtualScrollService,
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
    FreezeService,
    RowDDService,
    SelectionService,
    ResizeService,
    VirtualScrollService
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
  private readonly copyCutRowCssClass = ' copied-cutted-row';

  public editSettings: EditSettingsModel | any;
  public pageSettings: PageSettingsModel;

  public dropEditSettings = {allowEditing: true, allowAdding: true};
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
  private copiedRows: any[] = []; // Element | HTMLElement;
  private cutedRows: any; // Element | HTMLElement;
  listHeaders = [];

  public enableVirtualization = true;
  public enableInfiniteScrolling = !this.enableVirtualization;
  public allowFiltering = true;
  filterOptions: FilterSettingsModel;
  public allowMultiSorting = false;
  public frozenColumns = 0;

  constructor(
    private columnService: ColumnService,
    private rowService: RowService,
    private windowService: WindowService,
    private clipboardService: ClipboardService
  ) {
    this.selectionOptions = {
      type: 'Multiple',
      mode: 'Row'
    };

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

    if (this.isLoading) {
      this.rowService.loadRows();
    }
    this.columnService.loadColumns();

    this.windowHeight$ = windowService.height$.pipe(
      map(height => height - this.windowService.getScrollbarWidth() - 70)
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
      showDeleteConfirmDialog: true
    };
    this.pageSettings = { pageCount: 5, pageSize: 90 };
  }

  actionBegin(args: SaveEventArgs): void {
    if (args.requestType === 'save') {
      console.log('actionBegin', args.requestType);
    }
  }

  changeChildNodeStyles(newClasses: string): void {
    this.copiedRows.forEach(copiedRow => {
      //  && copiedRow.rowIndex !== rowIndex

      if (this.copiedRows.length > 0) {
        for (const childNode of copiedRow.childNodes) {
          let copiedRowCssClass = childNode.getAttribute('class');
          if (newClasses === this.copyCutRowCssClass) {
            copiedRowCssClass = copiedRowCssClass + newClasses;
          } else {
            copiedRowCssClass = copiedRowCssClass.replace(this.copyCutRowCssClass, '');
            // this.copiedRows = this.copiedRows.filter(item => item !== copiedRow);
          }
          childNode.setAttribute('class', copiedRowCssClass);
        }
      }
    });
  }

  writeClipboardData(rowIndexes: number[], goal: 'copy' | 'cut'): void {
    if (this.copiedRows.length > 0) {
      this.changeChildNodeStyles('');
      this.copiedRows = [];
    }

    rowIndexes.forEach(index => {
      // when copy index allways more than 1
      const rowIndex = goal === 'copy' ? index - 1 : index;
      const rowElement = this.treegrid.getRowByIndex(rowIndex) as HTMLElement;
      this.copiedRows.push(rowElement);
    });

    this.treegrid.copyHierarchyMode = 'None';

    this.changeChildNodeStyles(this.copyCutRowCssClass);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPress($event: KeyboardEvent): void {
    // Ctrl + X
    if (($event.ctrlKey || $event.metaKey) && $event.keyCode === 88) {
      const rowIndexes = [];
      this.treegrid.getSelectedRowIndexes().forEach(item => {
        rowIndexes.push(item);
      });
      this.writeClipboardData(rowIndexes, 'cut');
    }
  }

  beforeCopy(args: any): void {
    const rowIndexes = [];
    const zeroRowIndex = args.data.split('\t')[0].split('\n').at(-1);
    rowIndexes.push(zeroRowIndex);

    args.data.split('\t').forEach(item => {
      if (item.includes('\n')) {
        const id = +item.replace('\n', '');
        rowIndexes.push(id);
      }
    });
    this.writeClipboardData(rowIndexes, 'copy');
  }
  showRowMenuItems(args: any): void {
    if (this.selectionOptions.type && this.selectionOptions.type === 'Single') {
      args.element.querySelector('#cancelMultiSelect').style.display = 'none';
      args.element.querySelector('#multiSelect').style.display = 'block';
    } else if ( this.selectionOptions.type && this.selectionOptions.type === 'Multiple') {
      args.element.querySelector('#cancelMultiSelect').style.display = 'block';
      args.element.querySelector('#multiSelect').style.display = 'none';
    }

    args.element.querySelector('#unfreeze').style.display = 'none';
    args.element.querySelector('#freeze').style.display = 'none';
    args.element.querySelector('#filter').style.display = 'none';
    args.element.querySelector('#unfilter').style.display = 'none';
    args.element.querySelector('#multiSort').style.display = 'none';
    args.element.querySelector('#unmultiSort').style.display = 'none';
  }
  showColumnMenuItems(args: any): void {
    const selectedColumnIndex = args.column.index + 1;
    if (this.frozenColumns !== selectedColumnIndex) {
      args.element.querySelector('#freeze').style.display = 'block';
      args.element.querySelector('#unfreeze').style.display = 'none';
    } else if (this.frozenColumns === selectedColumnIndex) {
      args.element.querySelector('#freeze').style.display = 'none';
      args.element.querySelector('#unfreeze').style.display = 'block';
    }

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

    args.element.querySelector('#multiSelect').style.display = 'none';
    args.element.querySelector('#cancelMultiSelect').style.display = 'none';
  }
  public contextMenuBeforeOpen(args: any): void {
    const isRow = !!args.rowInfo.row;
    const isSystemField = this.isSystemColumn(args.column.field);
    const display = isRow || isSystemField ? 'none' : 'block';
    if (isRow) {
      this.showRowMenuItems(args);
    } else {
      this.showColumnMenuItems(args);
    }
    args.element.querySelector('#editCol').style.display = display;
    args.element.querySelector('#deleteCol').style.display = display;
  }

  contextMenuClick(args: any): void {
    this.isColumnFormOpen = false;
    this.isRowFormOpen = false;
    const filterElement = args.element as HTMLElement;
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
      case 'rowCut':
        this.changeChildNodeStyles('');
        this.cutedRows = args.rowInfo.rowData;
        this.treegrid.copyHierarchyMode = 'None';
        this.treegrid.copy();
        this.changeChildNodeStyles(this.copyCutRowCssClass);
        break;
      case 'copyRows':
        this.changeChildNodeStyles('');
        this.treegrid.copyHierarchyMode = 'None';
        this.treegrid.copy();
        this.changeChildNodeStyles(this.copyCutRowCssClass);
        break;
      case 'rowPasteNext':
        this.clipboardService.paste('next', this.rowService.getRowPath(args.rowInfo.rowData));
        if (this.cutedRows) {
          const path = this.rowService.getRowPath(this.cutedRows);
          this.rowService.removeRow(path);
          this.cutedRows = null;
        }
        break;
      case 'rowPasteChild':
        this.clipboardService.paste('child', this.rowService.getRowPath(args.rowInfo.rowData));
        if (this.cutedRows) {
          const path = this.rowService.getRowPath(this.cutedRows);
          this.rowService.removeRow(path);
          this.cutedRows = null;
        }
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
        this.allowFiltering = false;
        break;
      case 'filter':
        this.allowFiltering = true;
        filterElement.style.setProperty('--filterbar-pointer-events', 'pointed');
        break;
      case 'freeze':
        const index = args.column.index + 1;
        this.frozenColumns = index;
        this.enableVirtualization = false;
        this.rowService.getAllRows().subscribe((rows: any) => {
          this.rows = rows;
        });
        break;
      case 'unfreeze':
        this.frozenColumns = 0;
        this.enableVirtualization = true;
        break;
      case 'multiSort':
        this.allowMultiSorting = true;
        break;
      case 'unmultiSort':
        this.allowMultiSorting = false;
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

    // not work
    if (column.textWrap) {
      el.style.setProperty('--cell-text-white-space', 'nowrap');
    } else {
      el.style.setProperty('--cell-text-white-space', 'normal');
    }
  }

  rowDataBound(args: any): void {
    if (args.data.taskID === 1) {
      args.row.querySelector('td').innerHTML = ' ';  // hide the DragIcon(td element)
    }
  }
  rowDragStartHelper(args: any): void {
    if (args.data[0].taskID === 1) {
      args.cancel = 'true';  // prevent Drag operations by setting args.cancel as true
    }
  }
  rowDrop(args: any): void {
    const treeGridobj = (document.getElementById('TreeGrid') as any).ej2_instances[0];
    const data = treeGridobj.getCurrentViewRecords()[args.dropIndex];
    if (data.hasChildRecords)  {
      // apply your own customized condition
      args.cancel = 'true';
    }
  }
  rowDragStart(args: any): void {
   args.rows[0].classList.add('e-dragclonerow'); // customize the dragged row here
  }
  rowDrag(args: any): void {
     const treeGridobj = (document.getElementById('TreeGrid') as any).ej2_instances[0];
     const rowEle: Element = args.target ? args.target.closest('tr') : null;
     const rowIdx: number = rowEle ? (rowEle as HTMLTableRowElement).rowIndex : -1;
     const currentData = treeGridobj.getCurrentViewRecords()[rowIdx];
     if (rowIdx !== -1) {
      if (currentData.hasChildRecords) {
        treeGridobj.rowDragAndDropModule.addErrorElem();
        // shown (no drop) icon for the parent records
      }
    }
  }
}
