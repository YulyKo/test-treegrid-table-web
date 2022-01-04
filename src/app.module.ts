import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { TreeGridModule } from '@syncfusion/ej2-angular-treegrid';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { ContextMenuModule, ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import {CheckBoxAllModule, RadioButtonModule} from '@syncfusion/ej2-angular-buttons';

import { AppService } from './service/app.service';
import { AppComponent } from './components/app/app.component';
import { TreeGridComponent } from './components/tree-grid/tree-grid.component';
import { ColumnFormComponent } from './components/forms/column-form/column-form.component';
import { ErrorMessageComponent } from './components/forms/error-message/error-message.component';
import { DataInputComponent } from './components/forms/data-input/data-input.component';

@NgModule({
  declarations: [
    AppComponent,
    TreeGridComponent,
    ColumnFormComponent,
    ErrorMessageComponent,
    DataInputComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TreeGridModule,
    DropDownListModule,
    DatePickerModule,
    NumericTextBoxModule,
    ReactiveFormsModule,
    ToolbarModule,
    DialogModule,
    ContextMenuModule
    CheckBoxAllModule,
    RadioButtonModule
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
