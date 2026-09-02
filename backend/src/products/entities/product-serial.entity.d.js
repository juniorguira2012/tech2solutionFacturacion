import { Product } from './product.entity';
export declare enum SerialStatus {
    DISPONIBLE = "disponible",
    VENDIDO = "vendido",
    EN_REPARACION = "en_reparacion",
    DESCARTADO = "descartado",
    EN_COMODATO = "en_comodato",
    ASIGNADO_TECNICO = "asignado_tecnico"
}
export declare class ProductSerial {
    id: number;
    serialNumber: string;
    producto: Product;
    productoId: number;
    status: SerialStatus;
    almacen: string;
    nota: string;
    lastReturnNote: string | null;
    createdAt: Date;
    updatedAt: Date;
}
