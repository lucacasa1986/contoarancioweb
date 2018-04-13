import { Component, OnInit } from '@angular/core';
import { RegoleComponent } from '../../regole/regole/regole.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-conto',
  templateUrl: './conto.component.html',
  styleUrls: ['./conto.component.css']
})
export class ContoComponent implements OnInit {

  idConto:number;

  constructor(private route: ActivatedRoute) {
    this.route.parent.params.subscribe(
      params => {this.idConto = params.idConto;}
    )
  }

  ngOnInit() {
    this.route.parent.params.subscribe(
      params => {this.idConto = params.idConto;}
    )
  }

}
