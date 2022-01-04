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

import { AppService } from './service/app.service';
import { AppComponent } from './components/app/app.component';
import { TreeGridComponent } from './components/tree-grid/tree-grid.component';

@NgModule({
  declarations: [
    AppComponent,
    TreeGridComponent
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
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
