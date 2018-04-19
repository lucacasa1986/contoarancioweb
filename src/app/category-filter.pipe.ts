import { Pipe, PipeTransform } from '@angular/core';
import { Movimento } from './movimenti/movimento.model';

@Pipe({
  name: 'categoryFilter'
})
export class CategoryFilterPipe implements PipeTransform {

  transform(value: any[], arg1: any, arg2: any): any {
    if (!value || !arg1) {
      return value;
    }
    if( arg2) {
      return value.filter(item => {
          if (item["tipo"] == arg1){
            return arg2.some(movimento => {
              return movimento.categoria_id == item.id;
            })
          }else {
            return false;
          }
        } 
      );
    }else {
      return value.filter(item => item["tipo"] == arg1 );
    }
    
  }

}
