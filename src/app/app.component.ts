import { Component } from '@angular/core';
import { AppService } from '../service/app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'web';
  tasks: any;

  constructor(
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.appService.fetchAll().subscribe((res) => this.tasks = res);
    
  }
}
