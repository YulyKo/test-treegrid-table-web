import {Component, ViewChild} from '@angular/core';
import {DialogComponent} from '@syncfusion/ej2-angular-popups';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ColumnService} from '../../../service/column.service';
import {IColumn} from '../../../models/Column.interface';
import IRow, {CellValue} from '../../../models/Row.interface';
import {DataType} from '../../../models/enums/DataType.enum';
import {RowService} from '../../../service/row.service';

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
  public rowStatus: string;
  public rowPath: string[];
  public requestMode: 'update' | 'create';

  constructor(
    private formBuilder: FormBuilder,
    private columnService: ColumnService,
    private rowService: RowService
  ) {}

  get columns(): IColumn[] {
    return this.columnService.columns;
  }

  get addedColumns(): IColumn[] {
    return this.columns.filter(column => this.form.get(column.field.toString()));
  }

  createForm(row: Partial<IRow> = {}): void {
    this.form = this.formBuilder.group({});

    for (const column of this.columns) {
      const field = column.field.toString();
      const value = row[field] ?? column.defaultValue;
      const control = this.formBuilder.control(this.formatValue(column, value));
      this.form.addControl(field, control);
    }
  }

  private formatValue(column: IColumn, value: CellValue): CellValue {
    if (column.dataType === DataType.DATE) {
      return new Date(value as number);
    }
    return value;
  }

  public showCreateDialog(status: string, path: string[]): void {
    this.requestMode = 'create';
    this.rowStatus = status;
    this.rowPath = path;

    this.createForm();
    this.rowDialog.show();
  }

  public showUpdateDialog(row: IRow, path: string[]): void {
    this.requestMode = 'update';
    this.rowPath = path;

    this.createForm(row);
    this.rowDialog.show();
  }

  public hideDialog(): void {
    this.rowDialog.hide();
    this.form = null;
  }

  onSubmit(): void {
    switch (this.requestMode) {
      case 'create':
        this.rowService.createRow(this.rowStatus, this.form.value, this.rowPath);
        break;
      case 'update':
        this.rowService.updateRow(this.form.value, this.rowPath);
        break;
    }
    this.hideDialog();
  }
}
