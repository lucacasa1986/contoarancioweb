import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ListaContiComponent } from '../conti/lista-conti/lista-conti.component';
import { ContoComponent } from '../conti/conto/conto.component';
import { LoginComponent } from '../login/login/login.component';
import { AuthGuardService } from '../login/auth-guard.service';

const routes: Routes = [
  {
      path: '',
      component: ListaContiComponent,
      canActivate: [AuthGuardService]
  },
  {
    path: 'conto/:idConto',
    component: ContoComponent,
    canActivate: [AuthGuardService] 
  },
  {
    path: 'login',
    component: LoginComponent
  }
];

@NgModule({
  imports: [
    CommonModule, RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }
