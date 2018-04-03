import { Component, OnInit, AfterContentInit, AfterViewInit, Injectable, Input } from '@angular/core';
import { Movimento } from '../movimento.model';
import { MovimentoServiceService } from '../movimento-service.service';
import { Chart } from 'chart.js';
import { NgbDateStruct, NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';

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
export class ListaMovimentiComponent implements OnInit, AfterContentInit {

  @Input() idConto: number;

  dateFrom: Date = new Date();
  dateTo: Date = new Date();
  dateFromModel: NgbDateStruct;
  dateToModel: NgbDateStruct;
  public movimenti:Movimento[] = [];

  public uscite:Movimento[] = [];
  public entrate:Movimento[] = [];
  public categorie;
  chartUscite: Chart;
  chartEntrate: Chart;
  chartAndamento: Chart;

  selectedTab = "OUT";

  /* pagination*/
  uscitePage:number = 1;
  entratePage:number = 1;

  selectedSearch:string = "month";

  constructor(private _service:MovimentoServiceService) { }

  ngOnInit() {
    this.changePeriod(this.selectedSearch);
    this.firstLoad();
  }

  ngAfterContentInit() {
    this.chartUscite = new Chart('canvas_uscite', {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [
          {
            label: "Totale per categoria",
            backgroundColor: [],
            data: []
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Spese'
        }
      }
    });

    this.chartEntrate = new Chart('canvas_entrate', {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [
          {
            label: "Totale per categoria",
            backgroundColor: [],
            data: []
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Spese'
        }
      }
    });

    this.chartAndamento = new Chart('canvas_andamento', {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: "Andamento",
            borderColor: "#3e95cd",
            fill: false,
            data: []
          }
        ]
      },
      options: {
        scales: {
          xAxes: [{
            type: 'time',
            distribution: 'series',
            ticks: {
              source: 'auto'
            },
            time: {
              parser: 'DD-MM-YYYY',
              unit: 'week',
              displayFormats: {
                'day': 'DD MMM',
              }
            }
          }],
        },
        title: {
          display: true,
          text: 'Andamento nel periodo selezionato'
        }
      }
    });
  }

  firstLoad() {
    this._service.getAllCategories().subscribe(
      data => {
        this.categorie = data
        this.getMovimenti();
        this.getAndamento();
      }
    )
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

    this._service.getMovements(this.dateFrom, this.dateTo, this.idConto, this.getSelectedCategories()).subscribe(
      data => { 
        let lista_movimenti = data as Object[];
        this.movimenti.length = 0;
        this.uscite.length = 0;
        this.entrate.length = 0;
        for ( let d of lista_movimenti){
          let movimento = new Movimento(d);
          this.movimenti.push(movimento);
          if ( movimento.amount > 0 )
          {
            this.entrate.push(movimento);
          }else {
            this.uscite.push(movimento);
          }
        }
        this.buildChart(this.chartUscite, this.uscite);
        this.buildChart(this.chartEntrate, this.entrate);
      },
      err => console.error(err),
      () => {}

    );
  }

  getAndamento() {
    this._service.getAndamento(this.dateFrom, this.dateTo, this.idConto).subscribe(
      data => { 
        let lista_movimenti = data as Object;
        this.updateGraficoAndamento(lista_movimenti)
      },
      err => console.error(err),
      () => {}

    );
  }

  buildChart(chart:Chart, movimenti:Movimento[]) {
    chart.data.labels = [];
    chart.data.datasets[0].backgroundColor = [];
    chart.data.datasets[0].data = [];
    for ( let m of movimenti) {
      let categoria = m.categoria_id;
      
      if (!categoria ){
          let index = chart.data.labels.indexOf('Spese non categorizzate');
          if ( index > -1 )
          {
            let current_amount = chart.data.datasets[0].data[index];
            let new_amount = current_amount + m.getAbsAmount();
            chart.data.datasets[0].data[index] = new_amount;
          }else {
            let new_size = chart.data.labels.push('Spese non categorizzate');
            let index = new_size - 1;
            chart.data.datasets[0].backgroundColor.push('grey');
            chart.data.datasets[0].data.push(m.getAbsAmount());
          }
      }
      for ( let c of this.categorie) {
        if( c['id'] == categoria) {
          //taac
          let index = chart.data.labels.indexOf(c['descrizione']);
          if ( index > -1 )
          {
            let current_amount = chart.data.datasets[0].data[index];
            let new_amount = current_amount + m.getAbsAmount();
            chart.data.datasets[0].data[index] = new_amount;
          }else {
            let new_size = chart.data.labels.push(c['descrizione']);
            let index = new_size - 1;
            chart.data.datasets[0].backgroundColor.push(c['colore']);
            chart.data.datasets[0].data.push(m.getAbsAmount());
          }
        }
      }
    }
    chart.update();
  }

  updateGraficoAndamento(rilevazioni:Object) {
    this.chartAndamento.data.labels = rilevazioni["date"];
    
    this.chartAndamento.data.datasets[0].data = rilevazioni["valori"];

    this.chartAndamento.update();
  }

  getCategorie() {
    this._service.getAllCategories().subscribe(
      data => {this.categorie = data }
    )
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
      this.buildChart(this.chartUscite, this.uscite);
    else this.buildChart(this.chartEntrate, this.entrate);
  }

  toggleCategory(categoria:{}) {
    categoria["selected"] = !categoria["selected"];
  }

  getSelectedCategories():Array<{}> {
    return this.categorie.filter(function(categoria, index, array) {
      if( categoria["selected"]) {
        return true;
      }
      else {
        return false;
      }
    });
  }

  onSelectedTab(tabId:string){
    this.selectedTab = tabId;
  }

}
