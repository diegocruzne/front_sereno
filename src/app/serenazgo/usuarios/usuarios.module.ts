import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsuariosRoutingModule } from './usuarios-routing.module';
import { HomeComponent } from './home/home.component';
import { ListUsersComponent } from './list-users/list-users.component';
import { MaterialModule } from 'src/app/material/material.module';
import { UserAgePipe } from '../pipes/user-age.pipe';
import { UserTipouserPipe } from '../pipes/user-tipouser.pipe';
import { EditUserComponent } from './edit-user/edit-user.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NewUsuarioComponent } from './new-usuario/new-usuario.component';

@NgModule({
  declarations: [
    HomeComponent,
    ListUsersComponent,
    UserAgePipe,
    UserTipouserPipe,
    EditUserComponent,
    NewUsuarioComponent,
  ],
  imports: [
    CommonModule,
    UsuariosRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
})
export class UsuariosModule {}
