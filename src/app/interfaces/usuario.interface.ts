export interface Usuario {
  id_usuario?: number;
  dni: string;
  nombre: string;
  apellido: string;
  nacimiento: string;
  contrasena?: string;
  correo?: string;
  direccion?: string;
  telefono?: string;
  sexo: string;
  adicional?: string;
  foto?: string;
  tipo_us?: number;
}
