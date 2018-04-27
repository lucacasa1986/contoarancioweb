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
  andamenti:{};

  selectedOutTab = 'GRAPHS'; //LIST
  selectedInTab = 'GRAPHS';

  /* pagination*/
  uscitePage:number = 1;
  entratePage:number = 1;

  searchOptions:Array<{value:string, display:string}>= [{
    value: 'month',
    display: 'Ultimo mese'
  },{
    value: '3months',
    display: 'Ultimi 3 mesi'
  },{
    value: '6months',
    display: 'Ultimi 6 mesi'
  },{
    value: 'custom',
    display: 'Personalizzato'
  }];

  selectedSearch:{value:string, display:string} = this.searchOptions[0];
  startingDay:number = 1;

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

  getDateFrom(dateTo:Date, period:number, startingDay:number = 1):Date {
    let date =  new Date( dateTo.getTime());
    if ( date.getDate() !== startingDay ) {
      period = period - 1;
    }
    date.setMonth ( date.getMonth() - period);
    let y = date.getFullYear();
    let m = date.getMonth();
    let retDate = new Date();
    retDate.setFullYear(y,m,startingDay)
    return retDate;
  }

  changePeriod(period:{value:string, display:string}) {
    this.selectedSearch = period;
     if ( period.value == 'month') {
      this.dateTo = new Date();
      this.dateFrom = this.getDateFrom(this.dateTo, 1, this.startingDay);
      this.doSearch();
    } else if ( period.value == '3months') {
      this.dateTo = new Date();
      this.dateFrom = this.getDateFrom(this.dateTo, 3, this.startingDay);
      this.doSearch();
    } else if ( period.value == '6months') {
      this.dateTo = new Date();
      this.dateFrom = this.getDateFrom(this.dateTo, 6, this.startingDay);
      this.doSearch();
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
        this.toggleAllCategories('IN');
        this.toggleAllCategories('OUT');
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
    if(!movimento.ignored) {
      if( movimento.amount <= 0)
        this.uscite = this.uscite.slice(0);
      else this.entrate = this.entrate.slice(0);
      this.movimenti = this.movimenti.slice(0);
    }
    else {
      this.movimenti.splice( this.movimenti.indexOf(movimento),1);
      if( movimento.amount <= 0)
        this.uscite.splice(this.uscite.indexOf(movimento),1);
      else this.entrate.splice(this.entrate.indexOf(movimento),1);
    }
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
    this.categorie = this.categorie.splice(0);
    this._service.updateCategories(this.categorie);
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
