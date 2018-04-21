import { Component, AfterContentInit, Input, SimpleChanges, OnChanges, AfterContentChecked, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Movimento, Categoria } from '../movimento.model';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-grafico',
  templateUrl: './grafico.component.html',
  styleUrls: ['./grafico.component.css']
})
export class GraficoComponent implements OnChanges, AfterViewInit {

  @Input() title:string;
  @Input() public movimenti:Movimento[];
  @Input() public categorie:Categoria[];
  @Output() detailSelected:EventEmitter<Categoria> = new EventEmitter<Categoria>();
  @ViewChild('theCanvas') canvas: ElementRef;
  chart:Chart;
  private stateDetail:boolean = false; //detail

  constructor() { }

  ngAfterViewInit() {
      let ctx = this.canvas.nativeElement.getContext('2d');
      this.canvas.nativeElement.onclick = evt => {
        if ( !this.stateDetail) {
          
          var activePoints = this.chart.getElementsAtEvent(evt);
          if (activePoints[0]) {
            var chartData = activePoints[0]['_chart'].config.data;
            var idx = activePoints[0]['_index'];
    
            var label = chartData.labels[idx];
            var value = chartData.datasets[0].data[idx];
            let categoriaSelezionata:Categoria;
            for ( let currCategoria of this.categorie){
              if (currCategoria.descrizione === label){
                categoriaSelezionata = currCategoria;
                break;
              }
            }
            if(categoriaSelezionata) {
              this.categorie.forEach(element => {
                element["selected"] = false;
              });
              categoriaSelezionata["selected"] = true;
              this.detailSelected.emit(categoriaSelezionata);
              this.updateChartPerCategoria(categoriaSelezionata);
            }
          }
        }
        
      }
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
            display: false,
            responsive: true,
            text: this.title
          }
        }
      });
      if( this.movimenti) {
        this.updateChart();
      }
  }

  lightenDarkenColor = function (col, amt) {
    var usePound = false;
    if (col[0] == "#") {
      col = col.slice(1);
      usePound = true;
    }
    var num = parseInt(col, 16);
    var r = (num >> 16) + amt;
    if (r > 255) {
      r = 255;
    } else if (r < 0) {
      r = 0;
    }
    var b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) {
      b = 255;
    } else if (b < 0) {
      b = 0;
    }
    var g = (num & 0x0000FF) + amt;
    if (g > 255) {
      g = 255;
    } else if (g < 0) {
      g = 0;
    }
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
  }

  updateChartPerCategoria(categoriaSelezionata:Categoria) {
    this.stateDetail = true;
    this.chart.data.labels = [];
    this.chart.data.datasets[0].backgroundColor = [];
    this.chart.data.datasets[0].data = [];
    if( categoriaSelezionata) {
      this.chart.data.labels.push("Altro");
      this.chart.data.datasets[0].backgroundColor.push(categoriaSelezionata.colore);
      this.chart.data.datasets[0].data.push(0);
      for ( let m of this.movimenti) {
        let categoria_movimento = m.categoria_id; 
        if( categoria_movimento === categoriaSelezionata.id) {
          //movimento della categoria selezionata
          //vediamo se e assegnato ad una sottocategoria
          if (m.sottocategoria_id) {
            for ( let c of categoriaSelezionata.sottocategorie) {
              if( c.id == m.sottocategoria_id) {
                //taac
                let index = this.chart.data.labels.indexOf(c.descrizione);
                if ( index > -1 )
                {
                  let current_amount = this.chart.data.datasets[0].data[index];
                  let new_amount = current_amount + m.getAbsAmount();
                  this.chart.data.datasets[0].data[index] = new_amount;
                }else {
                  let new_size = this.chart.data.labels.push(c.descrizione);
                  let index = new_size - 1;
                  let col_modifier = 40 * ( index % 2 == 0 ? -1 : 1)
                  let colore_mod = this.lightenDarkenColor(categoriaSelezionata.colore, col_modifier );
                  this.chart.data.datasets[0].backgroundColor.push(colore_mod);
                  this.chart.data.datasets[0].data.push(m.getAbsAmount());
                }
              }
            }
          }else {
            // non sottocategorizzato
            let current_amount = this.chart.data.datasets[0].data[0];
            let new_amount = current_amount + m.getAbsAmount();
            this.chart.data.datasets[0].data[0] = new_amount;
          }
          
        }
      }
    }
    
    this.chart.update();
  }

  updateChart() {
    this.stateDetail = false;
    this.chart.data.labels = [];
    this.chart.data.datasets[0].backgroundColor = [];
    this.chart.data.datasets[0].data = [];
    for ( let m of this.movimenti) {
      let categoria = m.categoria_id;
      
      for ( let c of this.categorie) {
        if( c['id'] == categoria && m.tipo === c['tipo']) {
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
    this.chart.update();
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    
    if (changes["movimenti"] && this.chart) {
      this.updateChart();
    }

  }


}
