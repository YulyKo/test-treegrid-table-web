import { Component } from '@angular/core';
import { AppService } from '../../service/app.service';
import Task from '../../models/Tasks.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'web';
  tasks: Task[];

  constructor(
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.appService.fetchAll().subscribe((res) => this.tasks = res);
    
  }
}
