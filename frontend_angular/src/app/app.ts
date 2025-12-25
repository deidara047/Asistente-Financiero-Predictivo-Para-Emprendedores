import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { AlertsComponent } from './components/alerts/alerts';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, AlertsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
