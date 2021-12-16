import { Component, OnInit } from '@angular/core';
import Row from 'src/models/Row.interface';
import { AppService } from 'src/service/app.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.less']
})
export class TableComponent implements OnInit {
  title = 'web';
  tasks: Row[];

  constructor(
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.appService.fetchAll().subscribe((res) => this.tasks = res);
  }
}
