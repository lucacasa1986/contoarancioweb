import { Component, AfterContentInit, Input, SimpleChanges, OnChanges, AfterContentChecked, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Movimento } from '../movimento.model';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-grafico',
  templateUrl: './grafico.component.html',
  styleUrls: ['./grafico.component.css']
})
export class GraficoComponent implements OnChanges, AfterViewInit {

  @Input() title:string;
  @Input() public movimenti:Movimento[];
  @Input() public categorie;
  @ViewChild('theCanvas') canvas: ElementRef;
  chart:Chart;

  constructor() { }

  ngAfterViewInit() {
      let ctx = this.canvas.nativeElement.getContext('2d');
      this.chart = new Chart(ctx, {
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
            responsive: true,
            text: this.title
          }
        }
      });
      if( this.movimenti) {
        this.updateChart();
      }
  }

  updateChart() {
    this.chart.data.labels = [];
    this.chart.data.datasets[0].backgroundColor = [];
    this.chart.data.datasets[0].data = [];
    for ( let m of this.movimenti) {
      let categoria = m.categoria_id;
      
      if (!categoria ){
          let index = this.chart.data.labels.indexOf('Spese non categorizzate');
          if ( index > -1 )
          {
            let current_amount = this.chart.data.datasets[0].data[index];
            let new_amount = current_amount + m.getAbsAmount();
            this.chart.data.datasets[0].data[index] = new_amount;
          }else {
            let new_size = this.chart.data.labels.push('Spese non categorizzate');
            let index = new_size - 1;
            this.chart.data.datasets[0].backgroundColor.push('grey');
            this.chart.data.datasets[0].data.push(m.getAbsAmount());
          }
      }
      for ( let c of this.categorie) {
        if( c['id'] == categoria) {
          //taac
          let index = this.chart.data.labels.indexOf(c['descrizione']);
          if ( index > -1 )
          {
            let current_amount = this.chart.data.datasets[0].data[index];
            let new_amount = current_amount + m.getAbsAmount();
            this.chart.data.datasets[0].data[index] = new_amount;
          }else {
            let new_size = this.chart.data.labels.push(c['descrizione']);
            let index = new_size - 1;
            this.chart.data.datasets[0].backgroundColor.push(c['colore']);
            this.chart.data.datasets[0].data.push(m.getAbsAmount());
          }
        }
      }
    }
    this.chart.resize();
    this.chart.update();
    
    
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    
    if (changes["movimenti"] && this.chart) {
      this.updateChart();
    }

  }


}
