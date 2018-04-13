import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Regola } from '../regole.model';

@Component({
  selector: 'app-regola',
  templateUrl: './regola.component.html',
  styleUrls: ['./regola.component.css']
})
export class RegolaComponent implements OnInit {

  @Input() regola:Regola;
  @Output() selectedRegola:EventEmitter<Regola> = new  EventEmitter<Regola>();

  constructor() { }

  ngOnInit() {
  }

  selectRegola() {
    this.selectedRegola.emit(this.regola);
  }

}
