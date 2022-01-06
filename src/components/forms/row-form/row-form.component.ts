import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DialogComponent} from '@syncfusion/ej2-angular-popups';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ColumnService} from '../../../service/column.service';

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

  // @Input()
  // private formFields: object;

  constructor(
    private formBuilder: FormBuilder,
    private columnService: ColumnService
  ) {
    this.createForm();
  }

  onSubmit(): void {
    console.log('erhfkfek');
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      name: [null]
    });
  }

  public showDialog(rowStatus: string, path: string[]): void {
    this.createForm();
    this.rowDialog.show();
  }

  public hideDialog(): void {
    this.rowDialog.hide();
  }
}
