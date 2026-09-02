export declare class CreateProductDto {
    nombre: string;
    codigo?: string;
    modelo?: string;
    serie?: string;
    categoria?: string;
    precio: number;
    stock: number;
    stockMinimo?: number;
    isSerialized?: boolean;
    imagen?: string;
    almacen?: string;
    pasillo?: string;
    fila?: string;
    ubicacion?: string;
    unidadMedida?: string;
    movimientoInventario?: string;
    descripcion?: string;
    camposPersonalizados?: Array<Record<string, unknown>>;
    vendidos?: number;
    isActive?: boolean;
    proveedorId?: number;
    correo?: string;
    nota?: string;
    serials?: string[];
}
