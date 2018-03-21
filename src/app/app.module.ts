import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';  // replaces previous Http service
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // this is needed!

import { MovimentoServiceService } from './movimenti/movimento-service.service';

import { AppComponent } from './app.component';
import { ListaMovimentiComponent } from './movimenti/lista-movimenti/lista-movimenti.component';
import { MovimentoComponent } from './movimenti/movimento/movimento.component';
import { TabComponent } from './tabs/tab/tab.component';
import { TabsComponent } from './tabs/tabs/tabs.component';
import { UploaderComponent } from './movimenti/uploader/uploader.component';
import { TagService } from './tag.service';
import { ListaContiComponent } from './conti/lista-conti/lista-conti.component';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { ContoComponent } from './conti/conto/conto.component';
import { ContoEditComponent } from './conti/conto-edit/conto-edit.component';
import { LoginComponent } from './login/login/login.component';
import { AuthService } from './login/auth.service';
import { AuthGuardService } from './login/auth-guard.service';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';

export function tokenGetter() {
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [
    AppComponent,
    ListaMovimentiComponent,
    MovimentoComponent,
    TabComponent,
    TabsComponent,
    UploaderComponent,
    ListaContiComponent,
    ContoComponent,
    ContoEditComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule, FormsModule, HttpClientModule, NgbModule.forRoot(), TagInputModule, BrowserAnimationsModule, ReactiveFormsModule, AppRoutingModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: new Array(new RegExp('^null$'))
      },
    })
  ],
  providers: [MovimentoServiceService, TagService, AuthService, AuthGuardService, JwtHelperService],
  bootstrap: [AppComponent]
})
export class AppModule { }
