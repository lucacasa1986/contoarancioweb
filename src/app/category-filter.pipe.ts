import { Pipe, PipeTransform } from '@angular/core';
import { Movimento } from './movimenti/movimento.model';

@Pipe({
  name: 'categoryFilter'
})
export class CategoryFilterPipe implements PipeTransform {

  transform(value: any[], arg1: any, arg2: any, arg3:any): any {
    if (!value || !arg1) {
      return value;
    }
    
    let filtered_categories:any[];
    if( arg2) {
      filtered_categories = value.filter(item => {
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
      filtered_categories = value.filter(item => item["tipo"] == arg1 );
    }
    if (arg3) {
      //return all categories if none is selected, only selected otherwise
      let any_selected = filtered_categories.filter(item => {
        return item.selected;
      })
      if ( any_selected.length){
        return any_selected;
      }else {
        return filtered_categories;
      }
    }else {
      return filtered_categories;
    }
    
  }

}
