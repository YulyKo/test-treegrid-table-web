import { Component, OnInit, ViewChild } from '@angular/core';

import { Browser } from '@syncfusion/ej2-base';
import { DataUtil } from '@syncfusion/ej2-data';
import {ContextMenuOpenEventArgs, SaveEventArgs, ContextMenuItemModel
} from '@syncfusion/ej2-angular-grids';
import { FormGroup, AbstractControl, FormControl, Validators } from '@angular/forms';
import Row from 'src/models/Row.interface';
import { AppService } from 'src/service/app.service';
import { sampleData } from '../../service/db';
import {
  EditService, PageService, ToolbarService, TreeGridComponent as TreeGridComp,
  EditSettingsModel,
  PageSettingsModel,
  SelectionSettingsModel, ContextMenuService,
} from '@syncfusion/ej2-angular-treegrid';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import {ClickEventArgs, MenuEventArgs} from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'app-tree-grid',
  templateUrl: './tree-grid.component.html',
  styleUrls: ['./tree-grid.component.less'],
  providers: [
    AppService,
    ToolbarService,
    EditService,
    PageService,
    ContextMenuService
  ]
})
export class TreeGridComponent implements OnInit {

  @ViewChild('treegrid')
  public treegrid!: TreeGridComp;

  public data: object[] = [];
  public editSettings: EditSettingsModel | any;
  public toolbar: string[] = [];
  public pageSettings: PageSettingsModel;
  public taskForm: FormGroup;
  public progressDistinctData: Array<any>;
  public priorityDistinctData: Array<any>;
  public submitClicked = false;
  public selectionOptions: SelectionSettingsModel;
  // public pp: ContextMenuItem
  rows: Row[];

  public contextMenuItems: ContextMenuItemModel[] = [
    {
      text: 'Add/Delete/Edit (Dialog)  ',
      target: '.e-content',
      id: 'rndeDialog'
    },
    { text: 'Add/Delete/Edit (Row)  ', target: '.e-content', id: 'rndeRow' },

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

    {text: 'EditCol ', target: '.e-headercontent', id: 'editCol'},
    {text: 'NewCol ', target: '.e-headercontent', id: 'newCol'},

    {text: 'DeleteCol ', target: '.e-headercontent', id: 'deleteCol'},
    {text: 'Show', target: '.e-headercontent', id: 'columnChooser'},
    {text: 'Freeze', target: '.e-headercontent', id: 'freeze'},

    {text: 'Filter', target: '.e-headercontent', id: 'filter'},
    {text: 'Multi-Sort', target: '.e-headercontent', id: 'multiSort'}
  ];

  constructor(
    private appService: AppService
  ) {}

  ngOnInit(): void {
    // init data
    this.data = sampleData;
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
    this.pageSettings = { pageCount: 5 };
    this.progressDistinctData = DataUtil.distinct(sampleData, 'progress', true);
    this.priorityDistinctData = DataUtil.distinct(sampleData, 'priority', true);
  }

  contextMenuClick(args: MenuEventArgs): void {
    console.log('i am a life!!!', args.item.text, args.item.id);
  }

  createFormGroup(data: ITaskModel): FormGroup {
    return new FormGroup({
      taskID: new FormControl(data.taskID, Validators.required),
      startDate: new FormControl(data.startDate, this.dateValidator()),
      taskName: new FormControl(data.taskName, Validators.required),
      duration: new FormControl(data.duration),
      progress: new FormControl(data.progress),
      priority: new FormControl(data.priority),
    });
  }

  dateValidator(): any {
    return (control: FormControl): null | object  => {
      return control.value && control.value.getFullYear &&
      (1900 <= control.value.getFullYear() && control.value.getFullYear() <=  2099) ? null : { OrderDate: { value : control.value}};
    };
  }

  actionBegin(args: SaveEventArgs): void {
    if (args.requestType === 'beginEdit' || args.requestType === 'add') {
      this.submitClicked = false;
      this.taskForm = this.createFormGroup(args.rowData);
    }
    if (args.requestType === 'save') {
      this.submitClicked = true;
      if (this.taskForm.valid) {
        args.data = this.taskForm.value;
      } else {
        args.cancel = true;
      }
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

  actionComplete(args): void {}

  get taskID(): AbstractControl { return this.taskForm.get('taskID'); }

  get taskName(): AbstractControl { return this.taskForm.get('taskName'); }

  get startDate(): AbstractControl { return this.taskForm.get('startDate'); }
}

export interface ITaskModel {
  taskID?: number;
  taskName?: string;
  startDate?: Date;
  duration?: number;
  progress?: number;
  priority?: string;
}

export type NewParentRow = {
  text: 'Add Parent';
  tooltipText: 'Add Parent';
  id: 'Add Parent';
};
