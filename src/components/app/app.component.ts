import { Component, OnInit } from '@angular/core';
import { AppService } from '../../service/app.service';
import Row from '../../models/Row.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = 'web';
  tasks: Row[];

  constructor(
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.appService.fetchAll().subscribe((res) => this.tasks = res);
  }
}
