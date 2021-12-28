import { Component, OnInit, ViewChild } from '@angular/core';
import { DataUtil, WebApiAdaptor, Query, ReturnOption, DataManager } from '@syncfusion/ej2-data';
import {
  EditSettingsModel,
  PageSettingsModel,
  SaveEventArgs,
  SelectionSettingsModel
} from '@syncfusion/ej2-angular-grids';
import { FormGroup, AbstractControl, FormControl, Validators } from '@angular/forms';
import Row from 'src/models/Row.interface';
import { AppService } from 'src/service/app.service';
import { sampleData } from '../../service/db';
import {
  ContextMenuService,
  EditService,
  PageService,
  ToolbarService,
  TreeGridComponent as TreeGridComp
} from '@syncfusion/ej2-angular-treegrid';
import Treerow from '../../models/Treerow.class';
import { v4 as uuidv4 } from "uuid";
import Column from '../../models/Column.interface';
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
  rows: Row[];
  selectedRow: Row | HTMLElement | any;

  @ViewChild('treeGridObj')
  public treeGridObj: TreeGridComp;
  public contextMenuItems: object[];
  public templateOptions: object;

  copiedRow: Row | any;
  public cutRowBool: boolean = false;

  public dataManager: DataManager = new DataManager({
    url: "https://vom-app.herokuapp.com/tasks?limit=14000",
    updateUrl: "https://vom-app.herokuapp.com/tasks",
    insertUrl: "https://vom-app.herokuapp.com/tasks",
    removeUrl: "https://vom-app.herokuapp.com/tasks",
    crossDomain: true,
    adaptor: new WebApiAdaptor()
  });
  rowIndex: number;
  public MultiSelect: boolean = false;
  fields = new FormGroup({});

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
      showDeleteConfirmDialog: true
      // newRowPosition: 'Child'
    };

    this.selectionOptions = {
      persistSelection: false,
      enableToggle: true
      // cellSelectionMode: 'Box'
    };

    this.contextMenuItems = [
      {
        text: 'Add/Delete/Edit (Dialog)',
        target: '.e-content',
        id: 'renderDialog'
      },
      {
        text: 'Copy',
        target: '.e-content',
        id: 'customCopy'
      },
      {
        text: 'Copy',
        target: '.e-content',
        id: 'customCopy'
      },
      {
        text: 'Paste Next',
        target: '.e-content',
        id: 'pasteNext'
      },
      {
        text: 'Paste Child',
        target: '.e-content',
        id: 'pasteChild'
      },
      {
        text: 'Delete',
        target: '.e-content',
        id: 'delete'
      }
    ];

    // toolbar init
    // treeGridObj
    this.pageSettings = { pageCount: 5 };
    this.progressDistinctData = DataUtil.distinct(sampleData, 'progress', true);
    this.priorityDistinctData = DataUtil.distinct(sampleData, 'priority', true);

    this.fields.forEach( x => {
      this.form.addControl(x.id,new FormControl(x.value,Validators.Required))
     });
  }

  createFormGroup(data: Row): FormGroup {
    return new FormGroup({
      startDate: new FormControl(data.startDate || '', this.dateValidator()),
      taskName: new FormControl(data.taskName || '', Validators.required),
      duration: new FormControl(data.duration || ''),
      progress: new FormControl(data.progress),
      priority: new FormControl(data.priority),
    });
  }

  createColumnFormGroup(data: Column): FormGroup {
    return new FormGroup({
      // rowID: new FormControl(data.taskID, Validators.required),
      name: new FormControl(data.name || '',  Validators.required),
      dataType: new FormControl(data.dataType || '', Validators.required),
      dafautValue: new FormControl(data.dafautValue || ''),
      backgoundColor: new FormControl(data.backgoundColor),
      fontColor: new FormControl(data.fontColor),
      alginment: new FormControl(data.alginment),
      minWidth: new FormControl(data.minWith)
    });
  }

  dateValidator(): any {
    return (control: FormControl): null | object  => {
      return control.value && control.value.getFullYear &&
      (1900 <= control.value.getFullYear() && control.value.getFullYear()) ? null : { OrderDate: { value : control.value}};
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

  contextMenuClick(args): void {
    // this.MultiSelect = true;
    if (args.item.id == "rsibling") {
      if (this.cutRowBool == true) {
         // @ts-ignore: Unreachable code error
        let copyContent = this.treeGridObj.clipboardModule.copyContent;

        // this.treeGridObj.paste(copyContent, rowIndex);

        let stringArray = copyContent.split("\t");
        let newRecord: Treerow = new Treerow(
          stringArray[0],
          stringArray[1],
          stringArray[2],
          stringArray[3],
          stringArray[4],
          stringArray[5],
          stringArray[6],
          this.selectedRow.data.ParentItem
        );
        newRecord.children = [];
        newRecord.isParent = true;
        newRecord.id = uuidv4();
        const body = {
          TaskName: newRecord.TaskName,
          StartDate: newRecord.StartDate,
          EndDate: newRecord.EndDate,
          Duration: newRecord.Duration,
          Progress: newRecord.Progress,
          Priority: newRecord.Priority,
          isParent: newRecord.isParent,
          ParentItem: newRecord.ParentItem
        };

        // this.http delete item
        // this.http set new

        // this.treeGridObj.addRecord(newRecord, 0, 'Above');

        this.cutRowBool = false;
        this.copiedRow.setAttribute("style", "background:white;");
      } else {
        // @ts-ignore: Unreachable code error
        let copyContent = this.treeGridObj.clipboardModule.copyContent;

        // this.treeGridObj.paste(copyContent, rowIndex);

        let stringArray = copyContent.split("\t");
        let newRecord: Treerow = new Treerow(
          stringArray[0],
          stringArray[1],
          stringArray[2],
          stringArray[3],
          stringArray[4],
          stringArray[5],
          stringArray[6],
          this.selectedRow.data.ParentItem
        );
        newRecord.children = [];
        newRecord.isParent = true;
        newRecord.id = uuidv4();
        const body = {
          TaskID: newRecord.TaskID,
          TaskName: newRecord.TaskName,
          StartDate: newRecord.StartDate,
          EndDate: newRecord.EndDate,
          Duration: newRecord.Duration,
          Progress: newRecord.Progress,
          Priority: newRecord.Priority,
          isParent: newRecord.isParent,
          ParentItem: newRecord.ParentItem
        };

        // this.http
        //   .post<any>("https://vom-app.herokuapp.com/tasks", body)
        //   .subscribe((data) => {
        //     console.log("post:------------------2", data);
        //     this.dataManager
        //       .executeQuery(new Query())
        //       .then(
        //         (e: ReturnOption) => (this.data = e.result.data as object[])
        //       )
        //       .catch((e) => true);
        //   });
        this.dataManager
          .executeQuery(new Query())
          // @ts-ignore: Unreachable code error
          .then((e: ReturnOption) => (this.data = e.result.data as object[]))
          .catch((e) => true);
        // this.treeGridObj.addRecord(newRecord, 0, 'Above');

        this.copiedRow.setAttribute("style", "background:white;");
      }
    }

    if (args.item.id == "rchild") {
      // @ts-ignore: Unreachable code error
      let copyContent = this.treeGridObj.clipboardModule.copyContent;
      let stringArray = copyContent.split("\t");
      let newRecord: Treerow = new Treerow(
        stringArray[0],
        stringArray[1],
        stringArray[2],
        stringArray[3],
        stringArray[4],
        stringArray[5],
        stringArray[6],
        this.selectedRow.data.TaskID
      );
      newRecord.children = [];
      newRecord.isParent = false;
      newRecord.id = uuidv4();
      const body = {
        TaskID: newRecord.TaskID,
        TaskName: newRecord.TaskName,
        StartDate: newRecord.StartDate,
        EndDate: newRecord.EndDate,
        Duration: newRecord.Duration,
        Progress: newRecord.Progress,
        Priority: newRecord.Priority,
        isParent: newRecord.isParent,
        ParentItem: newRecord.ParentItem
      };

      // this.http
      //   .post<any>("https://vom-app.herokuapp.com/tasks", body)
      //   .subscribe((data) => {
      //     console.log("post:------------------4", data);
      //     this.dataManager
      //       .executeQuery(new Query())
      //       .then(
      //         (e: ReturnOption) => (this.data = e.result.data as object[])
      //       )
      //       .catch((e) => true);
      //   });

      // this.treeGridObj.addRecord(newRecord, this.selectedRow.row.rowIndex,'Child');
      this.copiedRow.setAttribute("style", "background:white;");
    } else if (args.item.id === "rcopy") {
      this.MultiSelect = true;

      this.editSettings = {
        allowEditing: true,
        allowAdding: true,
        allowDeleting: true,

        newRowPosition: "Child",
        mode: "Batch"
      };
      this.copiedRow = this.treeGridObj.getRowByIndex(this.rowIndex);

      this.treeGridObj.copyHierarchyMode = "None";
      this.treeGridObj.copy();
      this.copiedRow.setAttribute("style", "background:#FFC0CB;");
    }
  }

  contextMenuOpen(args?): void {
    console.log('contextMenuOpen');

    // let rowIndex: number[];
    let cellIndex: any;
    // let elem: Element;

    let rowIndex: number[] = args.rowInfo.rowIndex;
    let elem: Element = args.event.target as Element;
    console.log(rowIndex, elem);
    
/*

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

  // rowIndex = this.treeGridObj.getRowInfo().rowIndex; // args.rowInfo.rowIndex;
  // cellIndex = this.treeGridObj.getRowInfo().cellIndex; // args.rowInfo.cellIndex;

  rowIndex = args.rowInfo.rowIndex; 
  elem = args.event.target as Element;
  this.treeGridObj.copy();
} else if (args.item.id === 'customPaste') {
  // @ts-ignore: Unreachable code error
  const copiedData = this.treeGridObj.clipboardModule.copyContent;

    // @ts-ignore: Unreachable code error
  this.treeGridObj.paste(copiedData, rowIndex, cellIndex);
}
*/
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
