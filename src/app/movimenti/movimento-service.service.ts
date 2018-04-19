import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Movimento, Categoria, SottoCategoria } from './movimento.model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class MovimentoServiceService {

  private _categories: BehaviorSubject<Categoria[]> = new BehaviorSubject([]);

  public readonly allCategories: Observable<Categoria[]> = this._categories.asObservable();


  constructor(private http:HttpClient) { }

  init() {
    this.getAllCategories().subscribe(data => {
      let categories = (data as any[]).map(function(element){
        let id = element["id"];
        let descrizione = element["descrizione"];
        let icon_class = element["icon_class"];
        let colore = element["colore"];
        let tipo = element["tipo"];
        let categoria = new Categoria(id, descrizione, colore, icon_class, tipo, []);
        for (let subelement in element["sottocategorie"]){
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

  getAllCategories() {
    return this.http.get("/api/categories");
  }

  updateCategory(category:Object) {
    return this.http.post("/api/categories", category);
  }

  updateMovimento(movimento:Movimento) {
    return this.http.put("/api/movimento", movimento);
  }

  uploadFile(idConto:number,file:File, type:string)
  {
    const endpoint = '/api/parse/'+idConto;
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
