import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Tag } from './movimenti/movimento.model';
import { environment } from '../environments/environment';
@Injectable()
export class TagService {
  URL_BASE = environment.API_URL;
  allTags:Tag[] = [];

  constructor(private http:HttpClient) { }

  init() {
    this.http.get(this.URL_BASE +"/api/tags").subscribe(
      data => {
        this.allTags = (data as any[]).map(function(element){
          return new Tag(element);
        });
      }
    );
  }

  getAllTags() {
    return this.allTags;
  }

  addNewTag(movimento_id: number, tag_value:string) {
    let tag_exists:boolean = this.allTags.some(function(tag: Tag, index: number, array: Tag[]):boolean {
      return tag.value == tag_value;
    })
    if ( !tag_exists ) {
      let new_tag:Tag = new Tag({
        "display": tag_value,
        "value": tag_value
      });
      this.allTags.push(new_tag);
    }
    return this.http.put(this.URL_BASE +"/api/tag/"+movimento_id+"/" + tag_value,{});
  }

  deleteTag(movimento_id: number, tag_value:string) {
    return this.http.delete(this.URL_BASE +"/api/tag/"+movimento_id+"/" + tag_value);
  }

  getTagForMovimento(movimento_id: number) {
    return this.http.get(this.URL_BASE +"/api/tag/"+movimento_id);
  }

}
