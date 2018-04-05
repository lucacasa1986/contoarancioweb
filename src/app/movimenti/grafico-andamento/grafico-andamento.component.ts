import { Component, AfterContentInit, Input, SimpleChanges, OnChanges, AfterContentChecked, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Movimento } from '../movimento.model';
import { Chart } from 'chart.js';
import * as moment from 'moment';


@Component({
  selector: 'app-grafico-andamento',
  templateUrl: './grafico-andamento.component.html',
  styleUrls: ['./grafico-andamento.component.css']
})
export class GraficoAndamentoComponent implements OnChanges, AfterViewInit {

  @Input() title:string;
  @Input() rilevazioni:{};
  @ViewChild('theCanvas') canvas: ElementRef;
  chart:Chart;

  constructor() { }

  ngAfterViewInit() {
      let ctx = this.canvas.nativeElement.getContext('2d');
      this.chart = new Chart(ctx, {
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
            text: this.title
          }
        }
      });
      if( this.rilevazioni) {
        this.updateGraficoAndamento();
      }
  }

  updateGraficoAndamento() {
    let date = this.rilevazioni["date"];
    let date_from = moment( date[0], "DD-MM-YYYY");
    let date_to = moment( date[date.length-1], "DD-MM-YYYY");
    let diff_days = date_to.diff(date_from, 'days');
    if ( diff_days <= 15 ) {
      this.chart.options.scales.xAxes[0].time.unit = 'day';
    }
    else if ( diff_days > 15 && diff_days < 60 ){
      this.chart.options.scales.xAxes[0].time.unit = 'week';
    }else {
      this.chart.options.scales.xAxes[0].time.unit = 'month';
    }

    this.chart.data.labels = this.rilevazioni["date"];
    
    this.chart.data.datasets[0].data = this.rilevazioni["valori"];

    this.chart.update();
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    
    if (changes["rilevazioni"] && this.chart) {
      this.updateGraficoAndamento();
    }

  }


}
