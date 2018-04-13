export class Regola {
    conditions:Condizione[] = [];

    constructor(public id:number, public category_id:number, public name:string){
        
    }

    addCondizione(condizione:Condizione){
        this.conditions.push(condizione);
    }

}

export class Condizione {
    id:number;
    field:string = '';
    operator:string = '';
    value:string = '';
    constructor(){}
}