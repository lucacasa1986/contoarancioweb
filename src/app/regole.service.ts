import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Regola } from './regole/regole.model';

@Injectable()
export class RegoleService {

  constructor(private http:HttpClient) { }

  getRegole() {
    return this.http.get("/api/regole");
  }

  saveOrUpdateRegola(regola:Regola ) {
    return this.http.post("/api/regole", regola);
  }

  applyRules(contoId:number) {
    const endpoint = "/api/regole/" + contoId;
    return this.http.put(endpoint,{});
  }

  deleteRule(regola:Regola) {
    const endpoint = "/api/regole/" + regola.id;
    return this.http.delete(endpoint);
  }

}
