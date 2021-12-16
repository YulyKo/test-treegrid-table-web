import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddRowComponent } from './components/forms/add-row/add-row.component';
import { TableComponent } from './components/table/table.component';


const routes: Routes = [
  {
    path: '',
    component: TableComponent
  },
  {
    path: 'add-row',
    component: AddRowComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
