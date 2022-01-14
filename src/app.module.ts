import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { SortService, FilterService, ReorderService, TreeGridModule} from '@syncfusion/ej2-angular-treegrid';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { ContextMenuModule, ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListAllModule  } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxAllModule, RadioButtonModule } from '@syncfusion/ej2-angular-buttons';

import { AppService } from './service/app.service';
import { AppComponent } from './components/app/app.component';
import { TreeGridComponent } from './components/tree-grid/tree-grid.component';
import { FrozenTreeGridComponent } from './components/frozen-tree-grid/frozen-tree-grid.component';
import { ColumnFormComponent } from './components/forms/column-form/column-form.component';
import { ErrorMessageComponent } from './components/forms/error-message/error-message.component';
import { DataInputComponent } from './components/forms/data-input/data-input.component';
import { ColumnService } from './service/column.service';
import { RowFormComponent } from './components/forms/row-form/row-form.component';
import {RowService} from './service/row.service';
import {WindowService} from './service/window.service';
// import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  declarations: [
    AppComponent,
    TreeGridComponent,
    ColumnFormComponent,
    ErrorMessageComponent,
    DataInputComponent,
    RowFormComponent,
    FrozenTreeGridComponent
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
    ContextMenuModule,
    CheckBoxAllModule,
    RadioButtonModule,
    DropDownListAllModule,
    // ScrollingModule
  ],
  providers: [
    AppService,
    ColumnService,
    RowService,
    WindowService,
    ReorderService,
    FilterService,
    SortService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
