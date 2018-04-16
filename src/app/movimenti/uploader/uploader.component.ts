import { Component, OnInit, Input } from '@angular/core';
import { MovimentoServiceService } from '../movimento-service.service';
import { ActivatedRoute } from '@angular/router';

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

  constructor(private _service:MovimentoServiceService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.parent.params.subscribe(
      params => {this.idConto = params.idConto;}
    )
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  uploadFileToActivity() {
    this._service.uploadFile(this.idConto, this.fileToUpload, this.fileType).subscribe(data => {
      // do something, if upload success
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
