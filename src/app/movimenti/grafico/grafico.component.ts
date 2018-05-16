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
              this.updateChartPerCategoria(categoriaSelezionata);
              this.detailSelected.emit(categoriaSelezionata);
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
          showAllTooltips: true,
          legend: {
            display: false
         },
          title: {
            display: false,
            text: this.title
          }
        }
      });
      if( this.movimenti) {
        this.updateChart();
      }
  }

  ColorLuminance = function(hex, lum) {

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;
  
    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i*2,2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ("00"+c).substr(c.length);
    }
  
    return rgb;
  }

  updateChartPerCategoria(categoriaSelezionata:Categoria) {
    this.stateDetail = true;
    this.chart.data.labels = [];
    this.chart.data.datasets[0].backgroundColor = [];
    this.chart.data.datasets[0].data = [];
    if( categoriaSelezionata) {
      let add_sottocat_generica:boolean = false;
      let amount_sottocat_generica:number = 0;
      
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
                  let new_amount = current_amount + m.absAmount;
                  this.chart.data.datasets[0].data[index] = +new_amount.toFixed(2);
                }else {
                  let new_size = this.chart.data.labels.push(c.descrizione);
                  let index = new_size - 1;
                  let col_modifier = 0.1 * index * ( index % 2 == 0 ? -1 : 1)
                  let colore_mod = this.ColorLuminance(categoriaSelezionata.colore, col_modifier );
                  this.chart.data.datasets[0].backgroundColor.push(colore_mod);
                  this.chart.data.datasets[0].data.push(+m.absAmount.toFixed(2));
                }
              }
            }
          }else {
            // non sottocategorizzato
            add_sottocat_generica = true;
            let new_amount = amount_sottocat_generica + m.absAmount;
            amount_sottocat_generica = +new_amount.toFixed(2);
          }
        }
      }
      if ( add_sottocat_generica) {
        this.chart.data.labels.push("Altro");
        this.chart.data.datasets[0].backgroundColor.push(categoriaSelezionata.colore);
        this.chart.data.datasets[0].data.push(amount_sottocat_generica);
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
            let new_amount = current_amount + m.absAmount;
            this.chart.data.datasets[0].data[index] = +new_amount.toFixed(2);
          }else {
            let new_size = this.chart.data.labels.push(c['descrizione']);
            let index = new_size - 1;
            this.chart.data.datasets[0].backgroundColor.push(c['colore']);
            this.chart.data.datasets[0].data.push(+m.absAmount.toFixed(2));
          }
        }
      }
    }
    this.chart.update();
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    
    if (changes["movimenti"] && this.chart) {
      let categorieSelezionate = this.categorie.filter(categoria => {
        return categoria.selected;
      });

      if (categorieSelezionate.length === 1){
        this.updateChartPerCategoria(categorieSelezionate[0]);
      }else {
        this.updateChart();
      }
      
    }

  }


}
