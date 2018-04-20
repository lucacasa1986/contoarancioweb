import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ListaContiComponent } from '../conti/lista-conti/lista-conti.component';
import { ContoComponent } from '../conti/conto/conto.component';
import { LoginComponent } from '../login/login/login.component';
import { AuthGuardService } from '../login/auth-guard.service';
import { SignupComponent } from '../login/signup/signup.component';
import { RegoleComponent } from '../regole/regole/regole.component';
import { ContoContainerComponent } from '../conti/conto-container/conto-container.component';
import { UploaderComponent } from '../movimenti/uploader/uploader.component';
import { CategorieComponent } from '../categorie/categorie/categorie.component';

const routes: Routes = [
  {
      path: '',
      component: ListaContiComponent,
      canActivate: [AuthGuardService]
  },
  {
    path: 'conto/:idConto',
    component: ContoContainerComponent,
    canActivate: [AuthGuardService],
    children: [
      { path: '', redirectTo: 'movimenti', pathMatch: 'full' },
      { path: 'regole', component: RegoleComponent },
      { path: 'movimenti', component: ContoComponent },
      { path: 'upload', component: UploaderComponent},
      { path: 'categorie', component: CategorieComponent}
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
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
