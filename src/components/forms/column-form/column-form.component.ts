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
import {IColumn} from '../../../models/Column.interface';
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
  requestMode: 'update' | 'create';
  columnID: string;

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
    this.setEmptyForm();
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

  createDropdownValue(): void {
    this.addDropdownValue({
      id: Date.now(),
      type: 'Item Name'
    });
  }

  addDropdownValue(item: { id: number, type: string }): void {
    const control = new FormControl(item.type);
    this.dropdownValuesSubject.next([...this.dropdownValuesSubject.value, item]);
    const dropdownValuesControl = this.form.controls.dropdownValues as FormArray;
    dropdownValuesControl.push(control);
    const subscription = control.valueChanges.subscribe((title) => {
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

  initForm(formData: IColumn): void {
    console.log('formData', formData);
    this.form = this.formBuilder.group({
      name: [ formData.name, Validators.required],
      dataType: [formData.dataType, Validators.required],
      defaultValue: [formData.defaultValue],
      minWidth: [formData.minWidth, Validators.min(10)],
      fontSize: [formData.fontSize, Validators.min(10)],
      fontColor: [formData.fontColor],
      backgroundColor: [formData.backgroundColor],
      alignment: [formData.alignment],
      textWrap: [formData.textWrap],
      dropdownValues: new FormArray( [])
    });
    // this.clearDropDownValues();
    for (const dropdownValue of formData.dropdownValues) {
      this.addDropdownValue(dropdownValue);
    }

    this.form.controls.dataType.valueChanges.subscribe(() => {
      this.clearDropDownValues();
    });
  }

  clearDropDownValues(): void {
    const formArray = this.form.controls.dropdownValues as FormArray;
    formArray.clear();
    this.dropdownValuesSubject.next([]);
    this.form.controls.defaultValue.setValue(null);
  }

  setEmptyForm(): void {
    this.initForm({
      name: '',
      dataType: null,
      defaultValue: null,
      minWidth: null,
      fontSize: null,
      fontColor: '#FFFFFF',
      backgroundColor: '#000000',
      alignment: '',
      textWrap: false,
      dropdownValues: []
    } as IColumn);
    this.createDropdownValue();
  }

  public showDialog(columnData?: Column): void {
    if (columnData) {
      const column = this.columnService.findByColumnField(columnData.field) as IColumn;
      this.initForm(column);
      this.requestMode = 'update';
      this.columnID = column.id;
    } else {
      this.setEmptyForm();
      this.requestMode = 'create';
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

  public onSubmit(): void {
    this.formSubmitAttempt = true;
    if (this.form.valid) {
      this.saveData();
      this.hideDialog();
    } else {
      this.validateAllFormFields(this.form);
    }
  }

  saveData(): void {
    switch (this.requestMode) {
      case 'create':
        this.columnService.createColumn({
          ...this.form.value,
          dropdownValues: this.dropdownValuesSubject.value
        });
        break;
      case 'update':
        this.columnService.updateColumn(this.columnID, {
          ...this.form.value,
          dropdownValues: this.dropdownValuesSubject.value
        });
        break;
    }
  }

  // universal validation
  isFieldValid(field: string): any {
    return ((this.form.get(field)?.invalid && this.form.get(field)?.touched) ||
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
}
