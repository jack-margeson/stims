import { AfterViewInit, Component } from '@angular/core';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-404',
  standalone: true,
  imports: [],
  templateUrl: './404.component.html',
  styleUrl: './404.component.scss',
})
export class App404Component implements AfterViewInit {
  constructor() {}

  ngAfterViewInit(): void {}
}
