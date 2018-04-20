import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Regola, Condizione } from '../regole.model';
import { RegoleService } from '../../regole.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-lista-regole',
  templateUrl: './lista-regole.component.html',
  styleUrls: ['./lista-regole.component.css']
})
export class ListaRegoleComponent implements OnInit {
  @Input() idConto:number;
  @Input() regole:Regola[];
  currentRegola:Regola;
  @Output() selectedRegola:EventEmitter<Regola> = new EventEmitter<Regola>();
  closeResult: boolean;

  constructor(private ruleService:RegoleService, private modalService: NgbModal) { }

  ngOnInit() {
  }

  selectRegola(regola:Regola){
    this.currentRegola = regola;
    this.selectedRegola.emit(regola);
  }

  resetRegola() {
    this.currentRegola = new Regola(null,null,null,'');
    this.currentRegola.addCondizione(new Condizione());
    this.selectedRegola.emit(this.currentRegola);
  }

  applyRules() {
    this.ruleService.applyRules(this.idConto).subscribe(
      data => {}
    )
  }

  deleteRule(regola:Regola) {
    this.ruleService.deleteRule(regola).subscribe(
      data => {
        this.regole.splice(this.regole.indexOf(regola),1);
        this.resetRegola();
      }
    )
  }

  askForDelete(content, regola:Regola) {
    this.modalService.open(content).result.then((result) => {
      this.closeResult = result;
      if ( this.closeResult) {
        this.deleteRule(regola);
      }
    }, (reason) => {
      this.closeResult = false;
    });
  }

  addRuleToList(regola:Regola) {
    this.regole.push(regola);
    this.selectRegola(regola);
  }
}


