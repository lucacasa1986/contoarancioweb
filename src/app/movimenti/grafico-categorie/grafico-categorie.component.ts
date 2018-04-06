import { Component, AfterContentInit, Input, SimpleChanges, OnChanges, AfterContentChecked, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Movimento } from '../movimento.model';
import { Chart } from 'chart.js';
import { MovimentoServiceService } from '../movimento-service.service';


@Component({
  selector: 'app-grafico-categorie',
  templateUrl: './grafico-categorie.component.html',
  styleUrls: ['./grafico-categorie.component.css']
})
export class GraficoCategorieComponent implements OnChanges, AfterViewInit {

  @Input() title:string;
  @Input() public categorie;
  @Input() dateFrom:Date;
  @Input() dateTo:Date;
  @Input() contoId:number;
  @ViewChild('theCanvas') canvas: ElementRef;
  months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  chart:Chart;
  categorieSelezionate = [];

  constructor(private _service:MovimentoServiceService) { }

  ngAfterViewInit() {
      let ctx = this.canvas.nativeElement.getContext('2d');

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: []
        },
        options: {
          scales: {
            xAxes: [{
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

  updateDatiGrafico(){
    if( this.categorieSelezionate.length > 0 ) {
      this._service.getTotaliPerCategoria(this.dateFrom, this.dateTo, this.contoId, this.categorieSelezionate).subscribe(
        data => {
          //aggiornare i dataset del grafico
          this.chart.data.datasets.length = 0;
          this.chart.data.labels = [];
          (data as Array<Object>).forEach(element => {
            let dataset = {
              backgroundColor: element["colore"],
              borderColor: element["colore"],
              data: [],
              label: element["descrizione"],
              fill: false
            }
            dataset.data = this.generateData(element["rilevazioni"]);
            this.chart.data.datasets.push(dataset);
          });
          this.chart.update();
        }
      );
    } else {
      this.chart.data.datasets.length = 0;
      this.chart.data.labels = [];
      this.chart.update();
    }
    
  }

  toggleCategory(categoria:{}) {
    categoria["showGraph"] = !categoria["showGraph"];
    this.categorieSelezionate = this.categorie.filter(function(categoria, index, array) {
      if( categoria["showGraph"]) {
        return true;
      }
      else {
        return false;
      }
    });
    this.updateDatiGrafico();
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    if ( this.chart) {
      this.updateDatiGrafico();
    }
  }

}
