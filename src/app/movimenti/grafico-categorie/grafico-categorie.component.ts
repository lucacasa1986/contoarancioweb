import { Component, AfterContentInit, Input, SimpleChanges, OnChanges, AfterContentChecked, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Movimento, Categoria } from '../movimento.model';
import { Chart } from 'chart.js';
import { MovimentoServiceService } from '../movimento-service.service';


@Component({
  selector: 'app-grafico-categorie',
  templateUrl: './grafico-categorie.component.html',
  styleUrls: ['./grafico-categorie.component.css']
})
export class GraficoCategorieComponent implements OnChanges, AfterViewInit {

  @Input() title:string;
  @Input() dateFrom:Date;
  @Input() dateTo:Date;
  @Input() contoId:number;
  @ViewChild('theCanvas') canvas: ElementRef;
  chart:Chart;
  @Input("categorie") public categorieSelezionate:Categoria[] = [];
  @Input("movimenti") public movimenti:Movimento[];

  constructor(private _service:MovimentoServiceService) { }

  ngAfterViewInit() {
      let ctx = this.canvas.nativeElement.getContext('2d');

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: []
        },
        options: {
          scales: {
            xAxes: [{
              stacked: true,
              type: 'time',
              distribution: 'series',
              ticks: {
                source: 'data'
              },
              time: {
                parser: 'YYYY-MM-DD',
                unit: 'month'
              }
            }],
            yAxes: [{
              stacked: true,
              ticks: {
                beginAtZero: true
              }
						}]
          },
          title: {
            display: true,
            responsive: true,
            text: this.title
          }
        }
      });
  }

  updateChart() {
    this.chart.update();
  }

  generateData(rilevazioni:Array<Object>){
    let data = [];
    rilevazioni.forEach(
      rilevazione => {
        data.push({
          t: rilevazione["month"],
          y: Math.abs(rilevazione["importo"])
        });
      }
    )
    return data;
  }

  transformToIndex(minYear:number, minMonth:number ) {}

  monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  }

  updateDatiGrafico() {
    this.chart.data.datasets.length = 0;
    
    let numDataSet = this.categorieSelezionate.length;
    if(!this.movimenti.length || !numDataSet) {
      this.chart.update();
      return;
    }
    let minDate = this.dateFrom;
    let maxDate = this.dateTo;
    //quanti mesi
    let minMonth = minDate.getMonth();
    let minYear = minDate.getFullYear();

    let maxMonth = maxDate.getMonth();
    let maxYear = maxDate.getFullYear();

    let monthDiff = this.monthDiff(minDate, maxDate) +2;

    
    for( let categoria of this.categorieSelezionate){
      let movimenti_cat = this.movimenti.filter(movimento => {
        return movimento.categoria_id === categoria.id && movimento.tipo === categoria.tipo;
      });

      let dataset = {
        backgroundColor: categoria.colore,
        borderColor: categoria.colore,
        data: [],
        label: categoria.descrizione
      }

      for( let i=0; i<monthDiff; i++)
      {
        let startMonth:number = minMonth;
        let startYear:number = minYear;
        startMonth = minMonth + i;
        if( startMonth > 11)
        {
          startMonth = startMonth % 12;
          let addYear:number = Math.floor(startMonth/12);
          startYear = startYear + addYear;
        }

        let monthBegin:Date = new Date(startYear,startMonth,1);
        let monthEnd:Date = new Date(startYear,startMonth,1);
        monthEnd.setMonth(monthEnd.getMonth() +1);
        
        let movimenti_by_month = movimenti_cat.filter(movimento => {
          return movimento.data_movimento.getTime() >= monthBegin.getTime() && movimento.data_movimento.getTime() < monthEnd.getTime();
        });
        const reducer = (accumulator:number, currentValue:Movimento) => accumulator + Math.abs(currentValue.amount);
        let total_by_month:number = movimenti_by_month.reduce(reducer, 0);
        dataset.data.push({
          t: monthBegin,
          y: total_by_month
        });
      }

      this.chart.data.datasets.push(dataset);

    }
    this.chart.update();
    
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    if ( this.chart) {
      this.updateDatiGrafico();
    }
  }

}
