import { Component, OnInit, ViewChild } from '@angular/core';
import { DataUtil } from '@syncfusion/ej2-data';
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
import IColumn from '../../models/Column.interface';
import { DataType } from '../../models/enums/DataType.enum';
import { ColumnService } from '../../service/column.service';
import { RowFormComponent } from '../forms/row-form/row-form.component';
import { RowService } from '../../service/row.service';
import {WindowService} from '../../service/window.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

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

  public dataType = DataType;
  public editSettings: EditSettingsModel | any;
  public pageSettings: PageSettingsModel;
  public progressDistinctData: Array<any>;
  public priorityDistinctData: Array<any>;
  public selectionOptions: SelectionSettingsModel;
  // public pp: ContextMenuItem
  public rows: IRow[];
  public windowHeight$: Observable<number>;
  public windowWidth$: Observable<number>;

  public contextMenuItems: ContextMenuItemModel[] = [
    {
      text: 'Add Next (Dialog)  ',
      target: '.e-content',
      id: 'addNext'
    },
    {
      text: 'Add Child (Dialog)  ',
      target: '.e-content',
      id: 'addChild'
    },
    {
      text: 'Edit (Dialog)  ',
      target: '.e-content',
      id: 'editRow'
    },
    {
      text: 'Delete',
      target: '.e-content',
      id: 'delRow'
    },

    { text: 'Multi-Select', target: '.e-content', id: 'rmultiSelect' },
    {text: 'Copy', target: '.e-content', id: 'rcopy'},

    {text: 'Paste Sibling', target: '.e-content', id: 'rsibling'},
    {text: 'Paste Child', target: '.e-content', id: 'rchild'},
    {
      id: 'cut',
      text: 'Cut',
      target: '.e-content',
      iconCss: 'e-cm-icons e-cut'
    },
    // { text: 'Style', target: '.e-headercontent', id: 'style' },

    {text: 'Edit Column', target: '.e-headercontent', id: 'editCol'},
    {text: 'New Column', target: '.e-headercontent', id: 'newCol'},

    {text: 'Delete Column', target: '.e-headercontent', id: 'deleteCol'},
    {text: 'Show', target: '.e-headercontent', id: 'columnChooser'},
    {text: 'Freeze', target: '.e-headercontent', id: 'freeze'},

    {text: 'Filter', target: '.e-headercontent', id: 'filter'},
    {text: 'Multi-Sort', target: '.e-headercontent', id: 'multiSort'}
  ];

  columns: IColumn[];

  constructor(
    private appService: AppService,
    private columnService: ColumnService,
    private rowService: RowService,
    private windowService: WindowService
  ) {
    this.columnService.getAllColumns().subscribe((columns) => {
      console.log(columns);
      this.columns = columns;
      this.rowService.getAllRows().subscribe((rows) => {
        console.log(rows);
        this.rows = rows;
      });
    });
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
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      mode: 'Dialog',
      newRowPosition: 'Child',
      showDeleteConfirmDialog: true,
      // newRowPosition: 'Child'
    };

    this.selectionOptions = {
      persistSelection: false,
      enableToggle: true
    };

    // treegrid
    this.pageSettings = { pageCount: 5, pageSize: 90 };
    // this.progressDistinctData = DataUtil.distinct(this.rows, 'progress', true);
    // this.priorityDistinctData = DataUtil.distinct(this.rows, 'priority', true);
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
      case 'addNext':
        this.showRowDialog(args);
    }
  }

  showRowDialog(args: any): void {
    const path = [];
    let row = args.rowInfo.rowData;

    while (row) {
      path.unshift(row.id);
      row = row.parentItem;
    }

    this.rowForm.showDialog('next', path);
  }

  dateValidator(): any {
    return (control: FormControl): null | object  => {
      return control.value && control.value.getFullYear &&
      (1900 <= control.value.getFullYear() && control.value.getFullYear() <=  2099) ? null : { OrderDate: { value : control.value}};
    };
  }

  customizeSelf(args: QueryCellInfoEventArgs): void {
    if (args.column.field !== 'index' && args.column.field !== 'checkbox') {
      const column = this.columnService.findByColumnField(args.column.field);
      const cellElement = args.cell as HTMLElement;
      cellElement.style.setProperty('--cell-bg-color', column.backgroundColor);
      cellElement.style.setProperty('--cell-color', column.fontColor);
      cellElement.style.setProperty('--cell-font-size', `${ column.fontSize }px`);
      cellElement.classList.add('column-cell');
    }
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
    // event.item => class ItemModel
  }

}
