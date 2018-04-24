import { TagModel } from "ngx-chips/core/accessor";

export class Movimento {
    id: number;
    type: string;
    description: string;
    amount: number;
    data_movimento: Date;
    categoria_id: Number;
    sottocategoria_id: Number;
    tags: Tag[] = [];
    tipo:string = "OUT";
    ignored:boolean = false;

    constructor( json_o: Object){
        this.amount = json_o["amount"];
        if ( this.amount > 0 ){
            this.tipo="IN";
        }
        this.type = json_o["type"];
        this.description = json_o["description"];
        this.data_movimento = new Date(json_o["date"]);
        this.categoria_id = json_o["categoria_id"];
        this.sottocategoria_id = json_o["sottocategoria_id"];
        let id = json_o["id"];
        if ( id instanceof Array){
            id = id[0];
        }
        this.id = id;
        json_o["tags"].forEach(element => {
            this.tags.push( new Tag(element));
        });
    }

    getAbsAmount() {
        return Math.abs(this.amount);
    }
}

export class Categoria {
    public selected:boolean = false;
    
    constructor(public id:number,
         public descrizione:string, 
         public colore:string, 
         public icon_class:string,
          public tipo:string,
        public sottocategorie:SottoCategoria[]) {
            this.sottocategorie.unshift(new SottoCategoria(null, this.id, "Altre "+this.descrizione));
        }

    

    addSottoCategoria(element:SottoCategoria)
    {
        this.sottocategorie.push(element);
    }
}

export class SottoCategoria {
    constructor(public id:number, public categoria_id:number, public descrizione:string) {}
}

export class Tag {
    display: string;
    value: string;

    constructor( json_o: Object){
        this.display = json_o["name"];
        this.value = json_o["value"]; 
    }
}

export class ImportiCategoriaRilevazione {
    importo:number;
    month:number;
    year:number;

    constructor(importo:number, month:number, year:number) {
        this.importo = importo;
        this.month = month;
        this.year  = year;
    }
}

export class ImportiCategoria {
    id:string;
    descrizione:string;
    colore:string;
    rilevazioni:ImportiCategoriaRilevazione[];

    constructor(id:string, descrizione:string, colore:string, rilevazioni:ImportiCategoriaRilevazione[]) {
        this.id = id;
        this.descrizione = descrizione;
        this.colore = colore;
        this.rilevazioni = rilevazioni;
    }
}