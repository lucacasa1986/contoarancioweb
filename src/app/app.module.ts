import { BrowserModule } from '@angular/platform-browser';
import { NgModule, InjectionToken, Injectable, Inject } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpInterceptor, HttpHandler, HttpEvent, HttpRequest } from '@angular/common/http';  // replaces previous Http service
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // this is needed!

import { MovimentoServiceService } from './movimenti/movimento-service.service';

import { AppComponent } from './app.component';
import { ListaMovimentiComponent } from './movimenti/lista-movimenti/lista-movimenti.component';
import { MovimentoComponent } from './movimenti/movimento/movimento.component';
import { UploaderComponent } from './movimenti/uploader/uploader.component';
import { TagService } from './tag.service';
import { ListaContiComponent } from './conti/lista-conti/lista-conti.component';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { ContoComponent } from './conti/conto/conto.component';
import { ContoEditComponent } from './conti/conto-edit/conto-edit.component';
import { LoginComponent } from './login/login/login.component';
import { AuthService } from './login/auth.service';
import { AuthGuardService } from './login/auth-guard.service';
import { JwtHelperService, JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { CategoryFilterPipe } from './category-filter.pipe';
import { SignupComponent } from './login/signup/signup.component';
import { GraficoComponent } from './movimenti/grafico/grafico.component';
import { GraficoAndamentoComponent } from './movimenti/grafico-andamento/grafico-andamento.component';
import { GraficoCategorieComponent } from './movimenti/grafico-categorie/grafico-categorie.component';

import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { RegoleComponent } from './regole/regole/regole.component';
import { ListaRegoleComponent } from './regole/lista-regole/lista-regole.component';
import { RegolaComponent } from './regole/regola/regola.component';
import { RegoleService } from './regole.service';
import { RegolaDetailComponent } from './regole/regola-detail/regola-detail.component';
import { ContoContainerComponent } from './conti/conto-container/conto-container.component';
import { CategorieComponent } from './categorie/categorie/categorie.component';
import 'chart.piecelabel.js';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs/Observable';

registerLocaleData(localeIt, 'it');

export function jwtOptionsFactory(tokenService) {
  return {
    tokenGetter: () => {
      return localStorage.getItem('token');
    },
    whitelistedDomains: [ /^null$/ , "lucacasa1986.pythonanywhere.com"]
  }
}

export const API_URL = new InjectionToken<string>('apiUrl');

@Injectable()
export class ApiUrlInterceptor implements HttpInterceptor {
    constructor(@Inject(API_URL) private apiUrl: string) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        debugger;
        req = req.clone({url: this.prepareUrl(req.url)});
        return next.handle(req);
      }
    
      private isAbsoluteUrl(url: string): boolean {
        const absolutePattern = /^https?:\/\//i;
        return absolutePattern.test(url);
      }
    
      private prepareUrl(url: string): string {
        url = this.isAbsoluteUrl(url) ? url : this.apiUrl + '/' + url;
        return url.replace(/([^:]\/)\/+/g, '$1');
      }
}


@NgModule({
  declarations: [
    AppComponent,
    ListaMovimentiComponent,
    MovimentoComponent,
    UploaderComponent,
    ListaContiComponent,
    ContoComponent,
    ContoEditComponent,
    LoginComponent,
    CategoryFilterPipe,
    SignupComponent,
    GraficoComponent,
    GraficoAndamentoComponent,
    GraficoCategorieComponent,
    RegoleComponent,
    ListaRegoleComponent,
    RegolaComponent,
    RegolaDetailComponent,
    ContoContainerComponent,
    CategorieComponent
  ],
  imports: [
    BrowserModule, FormsModule, HttpClientModule, NgbModule.forRoot(), TagInputModule, BrowserAnimationsModule, ReactiveFormsModule, AppRoutingModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: []
      }
    })
  ],
  providers: [MovimentoServiceService, TagService, RegoleService, AuthService, AuthGuardService, JwtHelperService, 
  {provide: API_URL, useValue: environment.API_URL},
  {provide: HTTP_INTERCEPTORS, useClass: ApiUrlInterceptor, multi: true, deps: [API_URL]}
],
  entryComponents: [RegoleComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
