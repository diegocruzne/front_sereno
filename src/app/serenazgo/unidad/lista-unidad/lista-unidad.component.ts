import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { UnidadService } from '../services/unidad.service';
import { Unidad } from 'src/app/interfaces/unidad.interface';
import { Observable } from 'rxjs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-lista-unidad',
  templateUrl: './lista-unidad.component.html',
  styleUrls: ['./lista-unidad.component.css'],
})
export class ListaUnidadComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  obs!: Observable<any>;
  dataSource!: MatTableDataSource<Unidad>;
  pageEvent!: PageEvent;
  accent: string = 'accent';

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private unidadService: UnidadService
  ) {}

  ngOnInit(): any {
    this.listarUnidades();
  }

  ngOnDestroy() {
    if (this.dataSource) {
      this.dataSource.disconnect();
    }
  }

  listarUnidades() {
    this.unidadService.getUnidades().subscribe((res: Unidad[]) => {
      this.dataSource = new MatTableDataSource<Unidad>(res);
      this.changeDetectorRef.detectChanges();
      this.dataSource.paginator = this.paginator;
      this.obs = this.dataSource.connect();
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}