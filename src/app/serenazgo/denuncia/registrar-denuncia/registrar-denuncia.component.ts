import { Component, OnInit } from '@angular/core';
import { DelitoService } from 'src/app/services/delito.service';
import { Loader } from '@googlemaps/js-api-loader';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { RegisDenuncia } from 'src/app/interfaces/regisDenuncia.interface';
import { LoginService } from 'src/app/auth/services/login.service';
import { DenunciaService } from 'src/app/services/denuncia.service';

export interface CaterogiaDelito {
  tipo_delito: string;
  delito: Delito[];
}

export interface Delito {
  id: number;
  nombre: string;
}

export interface MapGeocoderResponse {
  status: google.maps.GeocoderStatus;
  results: google.maps.GeocoderResult[];
}

@Component({
  selector: 'app-registrar-denuncia',
  templateUrl: './registrar-denuncia.component.html',
  styleUrls: ['./registrar-denuncia.component.css'],
})
export class RegistrarDenunciaComponent implements OnInit {
  api_maps = environment.api_maps;
  date = new FormControl(moment().toDate());
  grupos_delitos: CaterogiaDelito[] = [];
  map!: google.maps.Map;
  service!: google.maps.places.PlacesService;
  infowindow!: google.maps.InfoWindow;
  markers: google.maps.Marker[] = [];
  formulario: FormGroup;
  userSystem: number = 0;
  statusButton: boolean = false;

  constructor(
    private delitoService: DelitoService,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    private loginService: LoginService,
    private denunciaService: DenunciaService
  ) {
    this.formulario = new FormGroup({
      fecha: new FormControl(moment().toDate(), Validators.required),
      dni: new FormControl('', [
        Validators.minLength(8),
        Validators.maxLength(8),
      ]),
      tipo_delito: new FormControl('', Validators.required),
      agraviado: new FormControl(),
      detalles: new FormControl(''),
      direccion: new FormControl(''),
      lat: new FormControl(''),
      lng: new FormControl(''),
    });
  }

  ngOnInit() {
    this.getInfoUserSystem();
    const loader = new Loader({
      apiKey: this.api_maps,
      libraries: ['places'],
    });
    loader.importLibrary('maps').then(() => {
      this.inicioMapa();
    });

    this.getDelitosPorCategoria();
  }

  registerDenuncia() {
    if (
      this.formulario.value['lat'].length === 0 ||
      this.formulario.value['lng'].length === 0
    ) {
      return this._snackBar.open('Seleccione un punto en el mapa', 'Ok', {
        duration: 2500,
      });
    }

    let copyData: RegisDenuncia = {
      detalles: this.formulario.value['detalles'],
      direccion: this.formulario.value['direccion'],
      lat: this.formulario.value['lat'],
      lng: this.formulario.value['lng'],
      fecha: moment(this.formulario.value['fecha']).format('YYYY-MM-DD'),
      delito: this.formulario.value['tipo_delito'],
      denunciante: this.formulario.value['agraviado'] ?? null,
      usuario: this.userSystem,
    };

    this.statusButton = true;

    this.denunciaService.registerDenuncia(copyData).subscribe({
      next: (res) => {
        this._snackBar.open(res.msg, 'Ok', {
          duration: 2500,
        });
        this.formulario.controls['tipo_delito'].reset();
        this.statusButton = false;
      },
      error: (err) => {
        this._snackBar.open(err, 'Error', {
          duration: 2500,
        });
        console.log(err);
      },
    });

    return true;
  }

  getInfoUserSystem() {
    this.loginService.getDataUser().subscribe((res) => {
      this.userSystem = res.usuario.id_usuario || 0;
    });
  }

  inicioMapa() {
    const chiclayo = new google.maps.LatLng(-6.77104628635, -79.846746053);
    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        center: chiclayo,
        zoom: 15,
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        draggableCursor: 'default',
      }
    );
    const input = document.getElementById('pac-input') as HTMLInputElement;
    const searchBox = new google.maps.places.SearchBox(input);
    this.map.addListener('bounds_changed', () => {
      searchBox.setBounds(this.map.getBounds() as google.maps.LatLngBounds);
    });
    let markers: google.maps.Marker[] = [];
    let myMarker: google.maps.Marker | null = null;
    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places!.length == 0) return;
      markers.forEach((marker) => marker.setMap(null));
      markers = [];
      const bounds = new google.maps.LatLngBounds();
      places!.forEach((place) => {
        if (!place.geometry || !place.geometry.location) {
          console.log('Returned place contains no geometry');
          return;
        }
        /* myMarker = new google.maps.Marker({
          position: place.geometry.location,
          map: this.map,
        }); */
        markers.push(
          new google.maps.Marker({
            map: this.map,
            title: place.name,
            position: place.geometry.location,
            draggable: false,
            icon: {
              url: './assets/marker_verde.png',
              scaledSize: new google.maps.Size(30, 30),
            },
          })
        );
        if (place.geometry.viewport) bounds.union(place.geometry.viewport);
        else bounds.extend(place.geometry.location);
      });
      this.map.fitBounds(bounds);
    });

    this.map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (myMarker) myMarker.setMap(null);
      myMarker = new google.maps.Marker({ position: e.latLng, map: this.map });
      this.map.panTo(e.latLng!);

      this.formulario.controls['lat'].setValue(e.latLng!.toJSON().lat);
      this.formulario.controls['lng'].setValue(e.latLng!.toJSON().lng);
    });
  }

  getDelitosPorCategoria() {
    this.delitoService
      .getDelitosPorCategoria()
      .subscribe((delito_res: CaterogiaDelito[]) => {
        this.grupos_delitos = delito_res;
      });
  }
}
