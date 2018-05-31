import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Regola } from './regole/regole.model';
import { environment } from '../environments/environment';

@Injectable()
export class RegoleService {
  URL_BASE = environment.API_URL;
  constructor(private http:HttpClient) { }

  getRegole() {
    return this.http.get(this.URL_BASE +"/api/regole");
  }

  saveOrUpdateRegola(regola:Regola ) {
    return this.http.post(this.URL_BASE +"/api/regole", regola);
  }

  applyRules(contoId:number) {
    const endpoint = this.URL_BASE +"/api/regole/" + contoId;
    return this.http.put(endpoint,{});
  }

  deleteRule(regola:Regola) {
    const endpoint = this.URL_BASE +"/api/regole/" + regola.id;
    return this.http.delete(endpoint);
  }

}
