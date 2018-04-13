import { Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { Regola, Condizione } from '../regole.model';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { RegoleService } from '../../regole.service';

@Component({
  selector: 'app-regola-detail',
  templateUrl: './regola-detail.component.html',
  styleUrls: ['./regola-detail.component.css']
})
export class RegolaDetailComponent implements OnInit, OnChanges {

  
  regolaForm:FormGroup;
  @Input() regola:Regola ;
  @Input() categories:Object[] = [];
  @Output() newRuleAdded:EventEmitter<Regola> = new EventEmitter<Regola>();

  fields = [{
    display: 'Causale',
    value: 'CAUSALE'
  }, {
    display: 'Descrizione',
    value: 'DESCRIZIONE'
  }]

  operators = [{
    display: 'Uguale',
    value: 'EQUALS'
  }, {
    display: 'Contiene',
    value: 'CONTAINS'
  }]

  constructor(private fb: FormBuilder, private regoleService:RegoleService) {
    this.createForm();
   }

  ngOnInit() {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ( this.regola ) {
      this.resetForm();
    }
    
  }

  setCondizioni(condizioni: Condizione[]) {
    const condizioniFGs = condizioni.map(condizione => this.fb.group(condizione));
    const condizioniFormArray = this.fb.array(condizioniFGs);
    this.regolaForm.setControl('condizioni', condizioniFormArray);
  }

  createForm() {
    this.regolaForm = this.fb.group({
      name: '',
      category: '',
      condizioni: this.fb.array([])
    })
  }

  resetForm() {
    this.regolaForm.reset({
      name: this.regola.name,
      category: this.regola.category_id
    });
    this.setCondizioni(this.regola.conditions);
  }

  get condizioni(): FormArray {
    return this.regolaForm.get('condizioni') as FormArray;
  }

  addCondizione() {
    this.condizioni.push(this.fb.group(new Condizione()));
  }

  onSubmit() {
    this.regola = this.prepareSaveRegola();
    let newrule:boolean = this.regola.id == null;
    this.regoleService.saveOrUpdateRegola(this.regola).subscribe(
      data => {
        if ( newrule) {
          this.newRuleAdded.emit(this.regola);
        }
      }
    )
  }

  prepareSaveRegola(): Regola {
    const formModel = this.regolaForm.value;

    // deep copy of form model lairs
    const conditionsDeepCopy: Condizione[] = formModel.condizioni.map(
      (condizione: Condizione) => Object.assign({}, condizione)
    );

    // return new `Hero` object containing a combination of original hero value(s)
    // and deep copies of changed form model values
    let saveRegola = new Regola(this.regola.id, formModel.category as number,formModel.name as string );
    saveRegola.conditions = conditionsDeepCopy;

    return saveRegola;
  }

  removeCondition(i:number) {
    this.condizioni.removeAt(i);
    this.condizioni.markAsDirty();
  }

}
