import { Component, OnInit, Input } from '@angular/core';
import { MovimentoServiceService } from '../movimento-service.service';
import { ActivatedRoute } from '@angular/router';
import { Movimento } from '../movimento.model';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.css']
})
export class UploaderComponent implements OnInit {

  fileToUpload: File = null;
  fileType: string = "CONTO";
  showSuccessAlert:Boolean = false;
  showErrorAlert:Boolean = false;

  idConto:number;

  movimentiCaricati:Movimento[] = [];
  categorie:Object[] = [];

  constructor(private _service:MovimentoServiceService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.parent.params.subscribe(
      params => {this.idConto = params.idConto;}
    )
    this._service.allCategories.subscribe(
      value => {
        this.categorie = value;
      }
    );
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  uploadFileToActivity() {
    this._service.uploadFile(this.idConto, this.fileToUpload, this.fileType).subscribe(data => {
      // do something, if upload success
        let lista_movimenti = data as Object[];
        this.movimentiCaricati.length = 0;
        for ( let d of lista_movimenti){
          let movimento = new Movimento(d);
          this.movimentiCaricati.push(movimento);
        }
        this.showSuccessAlert = true;
        setTimeout(() => {
          this.showSuccessAlert = false;
        },3000);
      }, error => {
        this.showErrorAlert = true;
        setTimeout(() => {
          this.showErrorAlert = false;
        },3000);
      });
  }

}
