import { Component, OnInit, ViewChild } from '@angular/core';

import { Browser } from '@syncfusion/ej2-base';
import { DataUtil } from '@syncfusion/ej2-data';
import {
  ActionEventArgs,
  ContextMenuItem,
  DialogEditEventArgs,
  EditEventArgs,
  EditSettingsModel,
  PageSettingsModel,
  SaveEventArgs,
  SelectionSettingsModel
} from '@syncfusion/ej2-angular-grids';
import { FormGroup, AbstractControl, FormControl, Validators } from '@angular/forms';
import IRow from 'src/models/Row.interface';
import { AppService } from 'src/service/app.service';
import { sampleData } from '../../service/db';
import { EditService, PageService, ToolbarService, TreeGridComponent as TreeGridComp } from '@syncfusion/ej2-angular-treegrid';
import { ClickEventArgs } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'app-tree-grid',
  templateUrl: './tree-grid.component.html',
  styleUrls: ['./tree-grid.component.less'],
  providers: [AppService, ToolbarService, EditService, PageService]
})
export class TreeGridComponent implements OnInit {
  public data: object[] = [];
  public editSettings: EditSettingsModel | any;
  public toolbar: any[];
  public pageSettings: PageSettingsModel;
  public taskForm: FormGroup;
  public progressDistinctData: Array<any>;
  public priorityDistinctData: Array<any>;
  public submitClicked = false;
  public selectionOptions: SelectionSettingsModel;
  // public pp: ContextMenuItem
  rows: IRow[];

  @ViewChild('treegrid')
  public treeGridObj: TreeGridComp;

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

    // toolbar init
    this.toolbar = [
      {
        text: 'Add Parent',
        tooltipText: 'Add Parent',
        id: 'addParent'
      },
      {
        text: 'Add Child',
        tooltipText: 'Add Child',
        id: 'addChild'
      },
     'Add',
     'Edit',
     'Delete',
     'Cut',
     { text: 'Copy', target: '.e-content', id: 'customCopy'},
     { text: 'Paste', target: '.e-content', id: 'customPaste'},
    ];

    // treegrid
    this.pageSettings = { pageCount: 5 };
    this.progressDistinctData = DataUtil.distinct(sampleData, 'progress', true);
    this.priorityDistinctData = DataUtil.distinct(sampleData, 'priority', true);
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
      if (this.treeGridObj.getSelectedRecords().length) {
        // if the 'Add Parent' or 'Add Child' option is choose,
        // setting newRowPosition accordingly and calling 'addRecord' method
        this.treeGridObj.editSettings.newRowPosition = (args.item.text === 'Add Parent') ? 'Below' : 'Child';
        this.treeGridObj.addRecord();
      } else if (args.item.text === 'Add Parent') {
        this.treeGridObj.editSettings.newRowPosition = 'Below';
        this.treeGridObj.addRecord();
      } else {
        // for adding with 'Child' newRowPosition, a record should be choosen. If not, showing alert
        alert('No record selected for Add Operation');
      }
    }
    if (args.item.id === 'customCopy') {
      rowIndex = this.treeGridObj.selectedRowIndex;
      cellIndex = this.treeGridObj.getSelectedRowCellIndexes;

      this.treeGridObj.copy();
    } else if (args.item.id === 'customPaste') {
      // @ts-ignore: Unreachable code error
      const copiedData = this.treeGridObj.clipboardModule.copyContent;

      this.treeGridObj.paste(copiedData, rowIndex, cellIndex);
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
