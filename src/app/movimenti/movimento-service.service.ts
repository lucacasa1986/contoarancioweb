import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Movimento, Categoria, SottoCategoria } from './movimento.model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';

@Injectable()
export class MovimentoServiceService {

  private _categories: BehaviorSubject<Categoria[]>;

  public readonly allCategories: Observable<Categoria[]>;


  constructor(private http:HttpClient) { 
    this._categories = new BehaviorSubject([]);
    this.allCategories = this._categories.asObservable();
  }

  init() {
    this.getCategories().subscribe(data => {
      let categories = (data as any[]).map(function(element){
        let id = element["id"];
        let descrizione = element["descrizione"];
        let icon_class = element["icon_class"];
        let colore = element["colore"];
        let tipo = element["tipo"];
        let categoria = new Categoria(id, descrizione, colore, icon_class, tipo, []);
        for (let subelement of element["sottocategorie"]){
          let subCategory = new SottoCategoria(subelement["id"], id, subelement["descrizione"]);
          categoria.addSottoCategoria(subCategory);
        }
        return categoria;
      });

      categories.unshift(new Categoria(null, "Non categorizzate", "black", "fa fa-question", "OUT", []));
      categories.unshift(new Categoria(null, "Non categorizzate", "black", "fa fa-question", "IN", []));
      this._categories.next(categories);
      
    });

  }

  updateCategories(categorie:Categoria[]) {
    this._categories.next(categorie);
  }

  getConti() {
    return this.http.get("/api/conti");
  }

  creaNuovoConto(titolare:string, descrizione:string) {
    let body = {
      "titolare": titolare,
      "descrizione": descrizione
    };

    return this.http.post('/api/conto', body);
  }

  getMovements(dateFrom: Date, dateTo:Date, contoId: number) {
    let params = {
      from_date: this.formatDate(dateFrom),
      to_date:  this.formatDate(dateTo)
    }
    return this.http.get("/api/"+contoId, {
      params: params
    });
  }

  getAndamento(dateFrom: Date, dateTo:Date, contoId: number) {
    let params = {
      from_date: this.formatDate(dateFrom),
      to_date:  this.formatDate(dateTo)
    }
    return this.http.get("/api/"+contoId + "/andamento", {
      params: params
    });
  }

  getTotaliPerCategoria(dateFrom: Date, dateTo:Date, contoId: number, selectedCategories:Array<{}>) {
    let params = {
      from_date: this.formatDate(dateFrom),
      to_date:  this.formatDate(dateTo)
    }
    if ( selectedCategories )
    {
      params["category"] = selectedCategories.map(function(category:{}){
        return category["id"];
      });
    }
    return this.http.get("/api/"+contoId + "/parziali", {
      params: params
    });
  }

  getCategories() {
    return this.http.get("/api/categories");
  }

  updateSubCategory(category:SottoCategoria) {
    return this.http.post("/api/subcategories", category);
  }

  updateMovimento(movimento:Movimento) {
    return this.http.put("/api/movimento", movimento);
  }

  splitMovimento(movimento:Movimento, others: Array<{category:Categoria, subCategory:SottoCategoria, amount:number}>) {
    let origCategory = others[0];
    movimento.categoria_id = origCategory.category.id;
    if ( origCategory.subCategory) {
      movimento.sottocategoria_id = origCategory.subCategory.id;
    } else {
      movimento.sottocategoria_id = null;
    }
    if( movimento.tipo === 'OUT') {
      movimento.amount = origCategory.amount * -1;

    }else {
      movimento.amount = origCategory.amount;
    }
    others.shift();
    if ( movimento.tipo === 'OUT') {
      for( let other of others ){
        other.amount = other.amount * -1;
      }
    }
    

    let data = {
      movimento: movimento,
      others: others
    }
    return this.http.post("/api/movimento", data)
  }

  uploadFile(idConto:number,file:File, type:string)
  {
    const endpoint ='/api/parse/'+idConto;
    const formData: FormData = new FormData();
    formData.append('excel_file', file, file.name);
    formData.append('type', type);
    return this.http
      .post(endpoint, formData);
  }

  formatDate(date:Date)
  {
    return date.getFullYear()+"-"+ (date.getMonth()+1) + "-" + date.getDate()
  }
}
