import { Component, OnInit } from '@angular/core';

import { Browser } from '@syncfusion/ej2-base';
import { DataUtil } from '@syncfusion/ej2-data';
import { DialogEditEventArgs, EditSettingsModel, PageSettingsModel, SaveEventArgs, SelectionSettingsModel, ToolbarItems } from '@syncfusion/ej2-angular-grids';
import { FormGroup, AbstractControl, FormControl, Validators } from '@angular/forms';
import Row from 'src/models/Row.interface';
import { AppService } from 'src/service/app.service';
import { sampleData } from '../../service/db';
import { EditService, PageService, ToolbarService } from '@syncfusion/ej2-angular-treegrid';
import { Dialog } from '@syncfusion/ej2-angular-popups';

@Component({
  selector: 'app-tree-grid',
  templateUrl: './tree-grid.component.html',
  styleUrls: ['./tree-grid.component.less'],
  providers: [AppService, ToolbarService, EditService, PageService]
})
export class TreeGridComponent implements OnInit {
  public data: object[] = [];
  public editSettings: EditSettingsModel;
  public toolbar: ToolbarItems|object[];
  public pageSettings: PageSettingsModel;
  public taskForm: FormGroup;
  public progressDistinctData: Array<any>;
  public priorityDistinctData: Array<any>;
  public submitClicked = false;
  public selectionOptions: SelectionSettingsModel;
  rows: Row[];

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
      newRowPosition: 'Bottom',
      showDeleteConfirmDialog: true
    };

    this.selectionOptions = {
      persistSelection: false,
      enableToggle: true
    };

    // toolbar init
    this.toolbar = ['Add', 'Edit', 'Delete'];

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

  actionComplete(args: DialogEditEventArgs): void {
    if ((args.requestType === 'beginEdit' || args.requestType === 'add')) {
      if (Browser.isDevice) {
        args.dialog.height = window.innerHeight - 90 + 'px';
        // tslint:disable
        (<Dialog> args.dialog).dataBind();
        // tslint:enable
      }
      // Set initail Focus
      if (args.requestType === 'beginEdit') {
        (args.form.elements.namedItem('taskName') as HTMLInputElement).focus();
      } else if (args.requestType === 'add') {
        (args.form.elements.namedItem('taskID') as HTMLInputElement).focus();
      }
    }
  }

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
