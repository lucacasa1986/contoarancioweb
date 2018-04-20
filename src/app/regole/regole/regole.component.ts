import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MovimentoServiceService } from '../../movimenti/movimento-service.service';
import { RegoleService } from '../../regole.service';
import { Regola, Condizione } from '../regole.model';
import { ActivatedRoute } from '@angular/router';
import { ListaRegoleComponent } from '../lista-regole/lista-regole.component';

@Component({
  selector: 'app-regole',
  templateUrl: './regole.component.html',
  styleUrls: ['./regole.component.css']
})
export class RegoleComponent implements OnInit {

  categorie:Object[] = []
  regole:Regola[] = []
  selectedRegola:Regola;
  idConto:number;

  @ViewChild(ListaRegoleComponent) listaRegole:ListaRegoleComponent;

  constructor(private _service:MovimentoServiceService,
     private ruleService:RegoleService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.parent.params.subscribe(
      params => {this.idConto = params.idConto;}
    )
    this._service.allCategories.subscribe(
      value => {
        this.categorie = value;
      }
    );
    this.ruleService.getRegole().subscribe(
      data => {
        let rules:Regola[] = [];
        let rules_json = data as Object[];
        rules_json.forEach(
          rule_json => {
            let rule = new Regola(rule_json["id"], rule_json["category_id"], rule_json["subcategory_id"], rule_json["name"]);
            let conditions_json = rule_json["conditions"];
            conditions_json.forEach(
              condition_json => {
                let condition = new Condizione();
                condition.value = condition_json["value"];
                condition.operator = condition_json["operator"];
                condition.field = condition_json["field"];
                rule.addCondizione(condition);
              }
            )
            rules.push(rule);
          }
        )
        this.regole = rules;
      }
    )
    let regola = new Regola(null,null,null,'');
    regola.addCondizione(new Condizione());
    this.changeSelectedRegola(regola);
  }

  changeSelectedRegola(regola:Regola){
    this.selectedRegola = regola;
  }

  addRegolaToList(regola:Regola) {
    this.listaRegole.addRuleToList(regola);
  }

}
