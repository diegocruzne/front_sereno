import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LoginService } from 'src/app/auth/services/login.service';
import { Usuario } from 'src/app/interfaces/usuario.interface';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { UsuariosideditService } from '../../../services/usuariosidedit.service';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.css'],
})
export class ListUsersComponent implements OnInit {
  columnas = [
    'nombre',
    'apellido',
    'nacimiento',
    'sexo',
    'fk_tipo_us',
    'foto',
    'iconos',
  ];
  dataSource: MatTableDataSource<Usuario>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  myTypeUser!: number;

  constructor(
    private usuariosService: UsuariosService,
    private loginService: LoginService,
    private usuariosIdEditService: UsuariosideditService
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
    // todo: change latency on load myTypeUser
    this.getInfoMyUser();
    this.getAllUsuarios();
  }

  getAllUsuarios() {
    this.usuariosService.getAllUsers().subscribe((usuario: Usuario[]) => {
      usuario.forEach((user) => {
        console.log(this.myTypeUser);
        let available: boolean = false;
        if (this.myTypeUser === 1 && user.fk_tipo_us === 2) available = true;
        else if (this.myTypeUser === 1 && user.fk_tipo_us === 3)
          available = true;
        else if (this.myTypeUser === 2 && user.fk_tipo_us === 3)
          available = true;

        user.estado = available;
        // console.log(`Id: ${user.id_usuario} -Estado: ${user.estado} - Tipo de usuario: ${user.fk_tipo_us}`);
      });

      this.dataSource.data = usuario;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  getInfoMyUser() {
    this.loginService.getDataUser().subscribe((user: any) => {
      this.myTypeUser = user.usuario.fk_tipo_us;
    });
  }

  sendId(id: number){
    this.usuariosIdEditService.setId(id);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
