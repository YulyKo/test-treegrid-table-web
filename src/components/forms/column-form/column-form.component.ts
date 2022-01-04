import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EmitType } from '@syncfusion/ej2-base';
import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { DataType } from '../../../models/enums/DataType.enum';

@Component({
  selector: 'app-column-form',
  templateUrl: './column-form.component.html'
})
export class ColumnFormComponent implements OnInit {
  @ViewChild('defaultupload')
  public uploadObj!: UploaderComponent;
  @ViewChild('Dialog')
  public dialogObj!: DialogComponent;
  @ViewChild('dropDownComponent')
  public dropDownComponent!: DropDownListComponent;

  // @Input()
  // private formFields: object;
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
  isFormVisible = true;
  public dlgButtons: any[] = [];
  public fields = { text: 'type', value: 'id' };

  public alignmentValues: ({ id: string; type: string })[];
  public dataTypeValues: ({ id: string; type: string })[];
  dropdownValues = [];

  public dlgBtnClick: EmitType<object> = () => {
    this.dialogObj.hide();
  }

  constructor(@Inject(FormBuilder) public formBuilder: FormBuilder) {
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
      defaultValue: [DataType.TEXT],
      minWidth: [null, Validators.min(10)],
      fontSize: [null, Validators.min(10)],
      fontColor: [null],
      backgroundColor: [null],
      alignment: [null],
      textWrap: [null],
      dropdownValues: new FormArray([])
    });
    this.addDropdownValue();
  }

  ngOnInit(): void {
    this.dlgButtons.push({
      click: this.dlgBtnClick.bind(this),
      buttonModel: { content: 'Ok', isPrimary: true }
    });
  }

  addDropdownValue(): void {
    const item = {
      id: Date.now(),
      control: new FormControl([''])
    };
    this.dropdownValues.push({ id: item.id, value: item.control.value});
    const dropdownValuesControl = this.form.controls.dropdownValues as FormArray;
    dropdownValuesControl.push(item.control);
  }

  removeDropdownValue(index: number): void {
    this.dropdownValues.splice(index, 1);

    const dropdownValuesControl = this.form.controls.dropdownValues as FormArray;
    dropdownValuesControl.removeAt(index);
  }

  public browseClick(): boolean {
    // document.getElementsByClassName('e-file-select-wrap')[0].querySelector('button').click();
    return false;
  }

  public showDialog(): void {
    this.dialogObj.show();
  }

  public hideDialog(): void {
    this.dialogObj.hide();
  }

  public close(): void {
    this.dialogObj.hide();
    this.isFormVisible = false;
  }

  public getDefaultInputData(): string {
    console.log(this.form.controls.defaultValue.value);

    return this.form.controls.defaultValue.value;
  }

  public getFieldTypeData(): string {
    return this.form.controls.dataType.value;
  }

  public Submit(): void {
    this.onFormSubmit();
  }

  public onFormSubmit(): void {
    console.log('sum ???');
    this.formSubmitAttempt = true;
    if (this.form.valid) {
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
