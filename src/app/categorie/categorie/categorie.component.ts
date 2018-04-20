import { Component, OnInit } from '@angular/core';
import { MovimentoServiceService } from '../../movimenti/movimento-service.service';
import { Categoria, SottoCategoria } from '../../movimenti/movimento.model';

@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.css']
})
export class CategorieComponent implements OnInit {

  constructor(private _service:MovimentoServiceService) { }

  categorie:Categoria[] = [];

  categoriaSelezionata: Categoria;

  ngOnInit() {
    this._service.allCategories.subscribe(
      value => {
        this.categorie = value;
      }
    );
  }

  selectCategory(value:Categoria) {
    this.categoriaSelezionata = value;
  }

  update(value:string, sottocategoria:SottoCategoria) {
    sottocategoria.descrizione = value;
    //update
    this._service.updateSubCategory(sottocategoria).subscribe(
      data => {
        if (!sottocategoria.id) {
          sottocategoria.id = data["id"];
        }
      }
    )
  }

  addSottocategoria() {
    let sottocategoria = new SottoCategoria(null,this.categoriaSelezionata.id, '');
    this.categoriaSelezionata.sottocategorie.push(sottocategoria);
  }

}
