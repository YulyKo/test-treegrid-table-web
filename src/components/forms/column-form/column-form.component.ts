import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DialogComponent} from '@syncfusion/ej2-angular-popups';
import {UploaderComponent} from '@syncfusion/ej2-angular-inputs';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {EmitType} from '@syncfusion/ej2-base';
import {DropDownListComponent} from '@syncfusion/ej2-angular-dropdowns';
import {DataType} from '../../../models/enums/DataType.enum';
import {BehaviorSubject, Subscription} from 'rxjs';
import {Column} from '@syncfusion/ej2-angular-treegrid';
import {ColumnService} from '../../../service/column.service';
import IColumn from '../../../models/Column.interface';
import {Alignment} from '../../../models/enums/Alignment.enum';

@Component({
  selector: 'app-column-form',
  templateUrl: './column-form.component.html',
  styleUrls: ['./column-form.component.less']
})
export class ColumnFormComponent implements OnInit, OnDestroy {
  @ViewChild('defaultupload')
  public uploadObj!: UploaderComponent;
  @ViewChild('Dialog')
  public dialogObj!: DialogComponent;
  @ViewChild('dropDownComponent')
  public dropDownComponent!: DropDownListComponent;

  public dataType = DataType;
  public form!: FormGroup;
  public width = '335px';
  public multiple = false;
  public formHeader = 'Success';
  public target = '#reactDialog';
  public animationSettings: any = {
    effect: 'Zoom'
  };
  private formSubmitAttempt = false;
  public uploadInput = '';
  isFormVisible = false;
  public dlgButtons: any[] = [];
  public fields = { text: 'type', value: 'id' };
  private subsription: Subscription = new Subscription();
  public alignmentValues: ({ id: string; type: string })[];
  public dataTypeValues: ({ id: string; type: string })[];
  dropdownValuesSubject = new BehaviorSubject([]);

  public dlgBtnClick: EmitType<object> = () => {
    this.dialogObj.hide();
  }

  constructor(
    @Inject(FormBuilder) public formBuilder: FormBuilder,
    private columnService: ColumnService
  ) {
    this.alignmentValues = [
      {id: 'right', type: 'Right'},
      {id: 'left', type: 'Left'},
      {id: 'Center', type: 'Center'}
    ];

    this.dataTypeValues = [
      {id: this.dataType.BOOLEAN, type: this.dataType.BOOLEAN},
      {id: this.dataType.DATE, type: this.dataType.DATE},
      {id: this.dataType.DROPDOWN, type: this.dataType.DROPDOWN},
      {id: this.dataType.NUMBER, type: this.dataType.NUMBER},
      {id: this.dataType.TEXT, type: this.dataType.TEXT},
    ];

    this.form = this.formBuilder.group({
      name: [null, Validators.required],
      dataType: [null, Validators.required],
      defaultValue: [null],
      minWidth: [null, Validators.min(10)],
      fontSize: [null, Validators.min(10)],
      fontColor: [null],
      backgroundColor: [null],
      alignment: [Alignment.center],
      textWrap: [null],
      dropdownValues: new FormArray([])
    });
    this.addDropdownValue();
  }

  ngOnDestroy(): void {
    this.subsription.unsubscribe();
  }

  ngOnInit(): void {
    this.dlgButtons.push({
      click: this.dlgBtnClick.bind(this),
      buttonModel: { content: 'Ok', isPrimary: true }
    });
  }

  addDropdownValue(): void {
    const control = new FormControl('Item Name');
    const item = {
      id: Date.now(),
      type: control.value
    };
    this.dropdownValuesSubject.next([...this.dropdownValuesSubject.value, item]);
    const dropdownValuesControl = this.form.controls.dropdownValues as FormArray;
    dropdownValuesControl.push(control);
    const subscription = control.valueChanges.subscribe((title) => {
      console.log('dskhdfjkfd');
      const values = this.dropdownValuesSubject.value;
      const index = values.findIndex(i => i.id === item.id);
      values.splice(index, 1, {
        id: item.id,
        type: title
      });
      this.dropdownValuesSubject.next(values);
    });
    this.subsription.add(subscription);
  }

  removeDropdownValue(index: number): void {
    const values = this.dropdownValuesSubject.value;
    values.splice(index, 1);
    this.dropdownValuesSubject.next(values);

    const dropdownValuesControl = this.form.controls.dropdownValues as FormArray;
    dropdownValuesControl.removeAt(index);
  }

  getDropdownControls(): FormControl[] {
    const formArray = this.form.controls.dropdownValues as FormArray;
    return formArray.controls as FormControl[];
  }

  public setFormData(columnData: IColumn): void {
    console.log(columnData);
    this.form.reset({
      name: columnData.name,
      dataType: columnData.dataType,
      defaultValue: columnData.defaultValue,
      minWidth: columnData.minWidth,
      fontSize: columnData.fontSize,
      fontColor: columnData.fontColor,
      backgroundColor: columnData.backgroundColor,
      alignment: columnData.alignment,
      textWrap: columnData.textWrap,
      dropdownValues: columnData.dropdownValues
    });
    this.form.setErrors(null);
  }

  setEmptyForm(): void {
    this.setFormData({
      name: '',
      dataType: null,
      defaultValue: '',
      minWidth: null,
      fontSize: null,
      fontColor: '',
      backgroundColor: '',
      alignment: '',
      textWrap: false,
      dropdownValues: []
    } as IColumn);
  }

  public showDialog(columnData?: Column): void {
    if (columnData) {
      const column = this.columnService.findByColumnField(columnData.field) as IColumn;
      this.setFormData(column);
    } else {
      this.setEmptyForm();
    }
    this.dialogObj.show();
    this.dialogObj.refreshPosition();
  }

  public hideDialog(): void {
    this.dialogObj.hide();
  }

  public close(): void {
    this.dialogObj.hide();
    this.isFormVisible = false;
  }

  public getFieldTypeData(): DataType {
    return this.form.controls.dataType.value;
  }

  public Submit(): void {
    this.onFormSubmit();
  }

  public onFormSubmit(): void {
    /*
    * alignment: ""
      backgroundColor: ""
      dataType: "Text"
      defaultValue: "ddd"
      dropdownValues: [null]
      fontColor: ""
      fontSize: null
      minWidth: null
      name: "dsdsdsds"
      textWrap: true
    * */
    console.log('sum ???');
    this.formSubmitAttempt = true;
    if (this.form.valid) {
      console.log('sum ???', this.form.value);
      this.hideDialog();
      this.form.reset();
    } else {
      this.validateAllFormFields(this.form);
    }
  }

  // universal validation
  isFieldValid(field: string): any {
    return ((!this.form.get(field)?.valid && this.form.get(field)?.touched) ||
      (this.form.get(field)?.untouched && this.formSubmitAttempt));
  }

  validateAllFormFields(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  // public saveColumn(event: Event): void {
  //   console.log('bdfd HERE');
  //   if (this.checkNewEdit === 'edit') {
  //     console.log('this.checkNewEdit:', this.checkNewEdit);
  //
  //     // let colorP = 'yellow';
  //     let catched = false;
  //     // myArray.forEach(val => myClonedArray.push(Object.assign({}, val)));
  //     this.listHeaders.forEach((a: any) => {
  //       delete a.customAttributes;
  //     });
  //     this.listHeaders.forEach((r: any) => {
  //       if (!catched) {
  //         console.log('catched:', catched);
  //         catched = true;
  //         const style = document.createElement('style');
  //         style.type = 'text/css';
  //         style.innerHTML = `.e-treegrid .e-headercell.cssClassaa { background-color: ${this.ColBColor};
  //           color:${this.ColFColor};
  //         }`;
  //         document.body.append(style);
  //       }
  //
  //       if (r.field === this.columnField) {
  //         console.log('r.field:', r.field, 'columnField:', this.columnField);
  //         r.headerText = this.ColName;
  //         r.type = this.ColType;
  //         r.textAlign = this.ColAlign;
  //         r.minWidth = this.ColMinWidth;
  //         r.customAttributes = { class: 'cssClassaa' };
  //       }
  //     });
  //
  //     // console.log('------listHeadersC-------:', this.listHeadersC);
  //     // console.log('this.listHeadersC.map((object) => ({ ...object })) bbbbbbbbbbbbbb:',b);
  //     // this.treeColumns = [];
  //     // console.log('tre', this.treeColumns);
  //     // this.treegrid.refreshColumns();
  //     // let c = [...this.listHeadersC.map((object) => ({ ...object }))];
  //     // console.log('------b-------:', b);
  //     // console.log('------c-------:', c);
  //     //  let g=this.listHeadersC;
  //     //  console.log('g:',g)
  //
  //     // this.treegrid.refreshColumns();
  //     this.treeColumns = [];
  //     // this.treegrid.refreshColumns();
  //
  //     this.treeColumns = this.listHeaders;
  //     // this.treeColumns = [...c]; //this.listHeadersC;
  //     console.log('------[this.treeColumns]-------:', this.treeColumns);
  //
  //     this.treegrid.refreshColumns();
  //     this.textWrap = this.ColChecked;
  //   }
  //   if (this.checkNewEdit === 'add') {
  //     // let column: any = { field: this.ColName, headerText: this.ColName, width: this.ColMinWidth, };
  //     // this.treeColumns.push(column);
  //     this.listHeaders.forEach((a: any) => {
  //       delete a.customAttributes;
  //     });
  //     if (this.ColBColor !== '' && this.ColFColor !== '') {
  //       console.log
  //         'this.ColBColor.charAt(5)+this.ColBColor.charAt(4)+this.ColBColor.charAt(3) +
  //         this.ColFColor.charAt(3)+this.ColFColor.charAt(4)+this.ColFColor.charAt(5):',
  //
  //         this.ColBColor.charAt(5) +
  //         this.ColBColor.charAt(4) +
  //         this.ColBColor.charAt(3) +
  //         this.ColFColor.charAt(3) +
  //         this.ColFColor.charAt(4) +
  //         this.ColFColor.charAt(5)
  //       );
  //       const style = document.createElement('style');
  //       style.type = 'text/css';
  //       style.innerHTML = `.e-treegrid .e-headercell.cssClassaa${
  //         this.ColBColor.charAt(5) +
  //         this.ColBColor.charAt(4) +
  //         this.ColBColor.charAt(3) +
  //         this.ColFColor.charAt(3) +
  //         this.ColFColor.charAt(4) +
  //         this.ColFColor.charAt(5)
  //       } { background-color: ${this.ColBColor};
  //           color:${this.ColFColor};
  //         }`;
  //       document.body.append(style);
  //       this.listHeaders.push({
  //         field: this.ColName,
  //         headerText: this.ColName,
  //         type: this.ColType,
  //         textAlign: this.ColAlign,
  //         minWidth: this.ColMinWidth,
  //         customAttributes: {
  //           class: `cssClassaa${
  //             this.ColBColor.charAt(5) +
  //             this.ColBColor.charAt(4) +
  //             this.ColBColor.charAt(3) +
  //             this.ColFColor.charAt(3) +
  //             this.ColFColor.charAt(4) +
  //             this.ColFColor.charAt(5)
  //           }`
  //         }
  //       });
  //       console.log('@@@@@@@this.listHeaders:@@@@@@@@@', this.listHeaders);
  //     } else {
  //       this.listHeaders.push({
  //         field: this.ColName,
  //         headerText: this.ColName,
  //         type: this.ColType,
  //         textAlign: this.ColAlign,
  //         minWidth: this.ColMinWidth
  //       });
  //     }
  //
  //     // const b = this.listHeadersC.map((object) => ({ ...object }));
  //
  //     // this.treeColumns = b;
  //     this.treeColumns = [];
  //     this.treeColumns = this.listHeaders;
  //
  //     this.textWrap = this.ColChecked;
  //     this.treegrid.refreshColumns();
  //     // console.log('AddColumn:', this.treeColumns);
  //     // this.treegrid.refreshColumns();
  //   }
  //
  //   this.showEditColumn = false;
  //
  //   this.ejDialog.hide();
  //   //  this.hideDialog();
  //
  //   // this.treegrid.refreshColumns();
  // }
}
