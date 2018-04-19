import { Component } from '@angular/core';
import { TagService } from './tag.service';
import { MovimentoServiceService } from './movimenti/movimento-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor( private _tagService: TagService, private _movimentoService: MovimentoServiceService)
  {
    _tagService.init();
    _movimentoService.init();
  }
}
