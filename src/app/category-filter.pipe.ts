import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'categoryFilter'
})
export class CategoryFilterPipe implements PipeTransform {

  transform(value: any[], args?: any): any {
    if (!value || !args) {
      return value;
    }
    return value.filter(item => item["tipo"] == args );
  }

}
