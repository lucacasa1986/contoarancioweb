import { TagModel } from "ngx-chips/core/accessor";

export class Movimento {
    id: number;
    type: string;
    description: string;
    amount: number;
    data_movimento: Date;
    categoria_id: Number;
    tags: Tag[] = [];

    constructor( json_o: Object){
        this.amount = json_o["amount"];
        this.type = json_o["type"];
        this.description = json_o["description"];
        this.data_movimento = json_o["date"];
        this.categoria_id = json_o["categoria_id"];
        this.id = json_o["id"][0];
        json_o["tags"].forEach(element => {
            this.tags.push( new Tag(element));
        });
    }

    getAbsAmount() {
        return Math.abs(this.amount);
    }
}

export class Tag {
    display: string;
    value: string;

    constructor( json_o: Object){
        this.display = json_o["name"];
        this.value = json_o["value"]; 
    }
}