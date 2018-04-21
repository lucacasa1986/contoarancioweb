import { Component, OnInit, AfterContentInit, AfterViewInit, Injectable, Input } from '@angular/core';
import { Movimento, Categoria } from '../movimento.model';
import { MovimentoServiceService } from '../movimento-service.service';
import { Chart } from 'chart.js';
import { NgbDateStruct, NgbDateAdapter, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

@Injectable()
export class NgbDateNativeAdapter extends NgbDateAdapter<Date> {

  fromModel(date: Date): NgbDateStruct {
    return (date && date.getFullYear) ? {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()} : null;
  }

  toModel(date: NgbDateStruct): Date {
    return date ? new Date(date.year, date.month - 1, date.day) : null;
  }
}


@Component({
  selector: 'app-lista-movimenti',
  templateUrl: './lista-movimenti.component.html',
  styleUrls: ['./lista-movimenti.component.css'],
  providers: [{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class ListaMovimentiComponent implements OnInit {

  @Input() idConto: number;

  dateFrom: Date = new Date();
  dateTo: Date = new Date();
  dateFromModel: NgbDateStruct;
  dateToModel: NgbDateStruct;
  public movimenti:Movimento[] = [];

  public uscite:Movimento[] = [];
  public entrate:Movimento[] = [];
  public categorie;
  public categorieSelezionate:object[] = [];
  andamenti:{};

  selectedOutTab = 'GRAPHS'; //LIST
  selectedInTab = 'GRAPHS';

  /* pagination*/
  uscitePage:number = 1;
  entratePage:number = 1;

  selectedSearch:string = "month";

  allCategoriesWithMovements:boolean = true;
  allInCategoriesWithMovements:boolean = true;

  constructor(private _service:MovimentoServiceService) { }

  ngOnInit() {
    this.changePeriod(this.selectedSearch);
    this.firstLoad();
  }

  firstLoad() {
    this._service.allCategories.subscribe(
      value => {
        this.categorie = value;
      }
    );
    this.getMovimenti();
    this.getAndamento();
  }

  changePeriod(period:string) {
     if ( period == 'month') {
      this.dateTo = new Date();
      this.dateFrom = new Date();
      this.dateFrom.setMonth ( this.dateTo.getMonth() -1);
    } else if ( this.selectedSearch == '3months') {
      this.dateTo = new Date();
      this.dateFrom = new Date();
      this.dateFrom.setMonth ( this.dateTo.getMonth() -3);
    } else if ( this.selectedSearch == '6months') {
      this.dateTo = new Date();
      this.dateFrom = new Date();
      this.dateFrom.setMonth ( this.dateTo.getMonth() -6);
    }
  }

  doSearch(){
    this.getMovimenti();
    this.getAndamento();
  }

  getMovimenti() {

    this._service.getMovements(this.dateFrom, this.dateTo, this.idConto).subscribe(
      data => { 
        let lista_movimenti = data as Object[];
        this.movimenti.length = 0;
        this.uscite.length = 0;
        this.entrate.length = 0;
        for ( let d of lista_movimenti){
          let movimento = new Movimento(d);

          this.movimenti.push(movimento);
          /*
          let category = this.getCategoryById(movimento.categoria_id);
          if ( category ) {
            category["selected"] = true;
          }*/
          if ( movimento.amount > 0 )
          {
            this.entrate.push(movimento);
          }else {
            this.uscite.push(movimento);
          }
        }
        this.movimenti = this.movimenti.slice(0);
        this.uscite = this.uscite.slice(0);
        this.entrate = this.entrate.slice(0);
      },
      err => console.error(err),
      () => {}

    );
  }

  getAndamento() {
    this._service.getAndamento(this.dateFrom, this.dateTo, this.idConto).subscribe(
      data => { 
        this.andamenti = data as Object;
      },
      err => console.error(err),
      () => {}

    );
  }

  onDateFromChange(event) {
    this.dateFrom = event.target.valueAsDate;
  }

  onDateToChange(event) {
    this.dateTo = event.target.valueAsDate;
  }

  getTotaleEntrate() {
    return this.entrate.reduce<number>(function(a,b){
      return a + b.getAbsAmount();
    }, 0);
  }

  getTotaleUscite() {
    return this.uscite.reduce<number>(function(a,b){
      return a + b.getAbsAmount();
    }, 0);
  }

  onMovimentoUpdated (movimento:Movimento) {
    if( movimento.amount <= 0)
      this.uscite = this.uscite.slice(0);
    else this.entrate = this.entrate.slice(0);
    this.movimenti = this.movimenti.slice(0);
  }

  getCategoryById(category_id:Number){
    let categoria = null;
    this.categorie.forEach(element => {
      if( element["id"] === category_id){
        categoria = element;
      }
    });
    return categoria;
  }

  toggleCategory(categoria:Categoria, append = true ) {
    if (!append ){
      this.categorie.forEach(element => {
        element["selected"] = false;
      });
      categoria["selected"]= true
    }else {
      categoria["selected"] = !categoria["selected"];
    }
    if( categoria.tipo === 'OUT') {
      this.allCategoriesWithMovements = false;
    }else {
      this.allInCategoriesWithMovements = false;
    }
    this.applyCategoryFilter();
  }

  toggleAllCategories(tipo:string = 'OUT') {
    this.categorie.forEach(element => {
      if (element.tipo === tipo)
        element["selected"] = false;
    });
    if( tipo === 'OUT')
      this.allCategoriesWithMovements = true;
    else {
      this.allInCategoriesWithMovements = true;
    }
    this.applyCategoryFilter();
  }

  applyCategoryFilter() {
    this.categorieSelezionate = this.getSelectedCategories();
    this.uscite.length = 0;
    this.entrate.length = 0;
    if ( this.isAnyCategorySelected('OUT')) {
      this.uscite = this.movimenti.filter( 
        movimento => {
          let categoria = this.getCategoryById(movimento.categoria_id);
          return categoria && categoria["selected"] && movimento.amount <= 0;
        }
      )
    }else {
      this.uscite = this.movimenti.filter( 
        movimento => {
          return movimento.amount <= 0;
        }
      )
    }
    
    if ( this.isAnyCategorySelected('IN')) {
      this.entrate = this.movimenti.filter( 
        movimento => {
          let categoria = this.getCategoryById(movimento.categoria_id);
          return categoria && categoria["selected"] && movimento.amount > 0;
        }
      )
    } else {
      this.entrate = this.movimenti.filter( 
        movimento => {
          return movimento.amount > 0;
        }
      )
    }
  }

  getSelectedCategories():Array<{}> {
    return this.categorie.filter(function(categoria, index, array) {
      return categoria["selected"];
    });
  }

  isAnyCategorySelected(type:string):boolean {
    return this.categorie.some(category => {
      return category["selected"] && category["tipo"] === type;
    })
   }

}
