import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DialogComponent} from '@syncfusion/ej2-angular-popups';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ColumnService} from '../../../service/column.service';
import {IColumn} from '../../../models/Column.interface';

@Component({
  selector: 'app-row-form',
  templateUrl: './row-form.component.html',
  styleUrls: ['./row-form.component.less']
})
export class RowFormComponent {
  @ViewChild('rowDialog')
  public rowDialog!: DialogComponent;
  public form: FormGroup;
  public isFormVisible = false;

  constructor(
    private formBuilder: FormBuilder,
    private columnService: ColumnService
  ) {
    this.createForm();
  }

  onSubmit(): void {
    console.log('erhfkfek');
  }

  get columns(): IColumn[] {
    return this.columnService.columns;
  }

  get addedColumns(): IColumn[] {
    return this.columns.filter(column => this.form.get(column.field.toString()));
  }

  createForm(): void {
    this.form = this.formBuilder.group({});

    for (const column of this.columns) {
      const control = this.formBuilder.control(column.defaultValue);
      this.form.addControl(column.field.toString(), control);
    }
  }

  public showDialog(rowStatus: string, path: string[]): void {
    this.createForm();
    this.rowDialog.show();
  }

  public hideDialog(): void {
    this.rowDialog.hide();
  }
}
