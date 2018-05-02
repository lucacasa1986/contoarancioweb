import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Movimento, Tag, Categoria } from '../movimento.model';
import { MovimentoServiceService } from '../movimento-service.service';
import { TagService } from '../../tag.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

export function amountSumValidator(amount: number): ValidatorFn {
  return (control: FormArray): {[key: string]: any} => {
    let totatAmount = 0;
    for ( let category of control.controls) {
      let categoryFb = category as FormGroup;
      totatAmount += categoryFb.controls.amount.value;
    }
    if ( totatAmount === amount ){
      return null;
    }else {
      return {'wrongAmount': {value: totatAmount}}
    }
    
  };
}

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

  movimentoSplitForm:FormGroup;

  constructor(private _service:MovimentoServiceService, private tagService:TagService, private fb: FormBuilder) { 
  }

  ngOnInit() {
    this.subcategories = this.tagService.allTags;
    this.categoriaSelezionata = this.getCategoria();
    this.createForm();
  }

  createForm() {
    this.movimentoSplitForm = this.fb.group({
      otherCategories: this.fb.array([this.fb.group({ 
        category: [this.categoriaSelezionata, [Validators.required]],
        subCategory: [this.getSottoCategoria()],
        amount: [this.movimento.absAmount, [Validators.required, Validators.min(0.01), Validators.max(this.movimento.absAmount)]]
      })], amountSumValidator(this.movimento.absAmount)
    )})
  }

  buildItems() {
    let totalAmount = 0;
    for ( let category of this.otherCategories.controls){
      let categoryFb = category as FormGroup;
      totalAmount = totalAmount + categoryFb.controls.amount.value;
    }
    let remainingAmount = this.movimento.absAmount - totalAmount;
    return this.fb.group({ 
      category: [null, [Validators.required]],
      subCategory: [null],
      amount: [remainingAmount > 0 ? remainingAmount : 0, [Validators.required, Validators.min(0.01)]]
    });
  }

  get otherCategories(): FormArray {
    return this.movimentoSplitForm.get('otherCategories') as FormArray;
  }

  addNewCategory() {
    this.otherCategories.push(this.buildItems());
  }

  onSubmit() {
    if( this.movimentoSplitForm.valid) {
      this._service.splitMovimento(this.movimento, 1, this.otherCategories.value).subscribe(data => {
        console.log(data);
      })
    }
    
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

  getSottoCategoria() {
    if ( this.categoriaSelezionata) {
      for(let categoria of this.categoriaSelezionata.sottocategorie)
      {
        if (categoria['id'] == this.movimento.sottocategoria_id)
        {
          return categoria;
        }
      }
      return null;
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

  ignoreMovimento(){
    this.movimento.ignored = true;
    this._service.updateMovimento(this.movimento).subscribe(
      data => { this.movimentoUpdate.emit(this.movimento);}
    )
  }

}
