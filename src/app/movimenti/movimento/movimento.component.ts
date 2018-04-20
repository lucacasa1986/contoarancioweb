import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Movimento, Tag, Categoria } from '../movimento.model';
import { MovimentoServiceService } from '../movimento-service.service';
import { TagService } from '../../tag.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-movimento',
  templateUrl: './movimento.component.html',
  styleUrls: ['./movimento.component.css']
})
export class MovimentoComponent implements OnInit {

  @Input() movimento: Movimento;
  @Input() categorie: Categoria[];
  @Output() movimentoUpdate: EventEmitter<Movimento> = new EventEmitter<Movimento>();
  isVisible: Boolean = false;
  subcategories: Tag[];
  private categoriaSelezionata:Categoria;

  constructor(private _service:MovimentoServiceService, private tagService:TagService) { }

  ngOnInit() {
    this.subcategories = this.tagService.allTags;
    this.categoriaSelezionata = this.getCategoria();
  }

  cambiaCategoria(categoria:{})
  {
    this.movimento["categoria_id"] = categoria["id"];
    this.categoriaSelezionata = this.getCategoria();
    //update!
    this._service.updateMovimento(this.movimento).subscribe(
      data => { this.movimentoUpdate.emit(this.movimento);}
    )
  }

  getCategoria() {
    for(let categoria of this.categorie)
    {
      if (categoria['id'] == this.movimento['categoria_id'])
      {
        return categoria;
      }
    }
    return null;
  }

  getCategoriaColoreById()
  {
    let categoria = this.getCategoria();
    if ( categoria){
      return categoria['colore'];
    }
    return 'black';
  }

  getCategoriaIcon() {
    let categoria = this.getCategoria();
    if ( categoria){
      return categoria['icon_class'];
    }
    return 'fa fa-question';
  }

  getCategoriaDescription() {
    let categoria = this.getCategoria();
    if ( categoria){
      return categoria['descrizione'];
    }
    return '';
  }

  addTag(value:{}){
    this.tagService.addNewTag(this.movimento["id"], value["value"]).subscribe(
      data => {}
    )
  }

  removeTag(value:{})
  {
    let tag_value;
    if ('string' === typeof value) {
      tag_value = value;
    }
    else {
      tag_value = value["value"];
    }
    this.tagService.deleteTag(this.movimento["id"], tag_value).subscribe(
      data => {}
    )
  }

  changeSottocategoria(value:any) {
    this.movimento.sottocategoria_id = value;
    this._service.updateMovimento(this.movimento).subscribe(
      data => { this.movimentoUpdate.emit(this.movimento);}
    )
  }

}
