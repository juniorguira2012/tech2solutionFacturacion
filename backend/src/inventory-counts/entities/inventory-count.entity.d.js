import { CountItem } from './count-item.entity';
export declare enum ConteoEstado {
    EN_PROGRESO = "EN_PROGRESO",
    AJUSTES_PUBLICADOS = "Ajustes Publicados",
    CANCELADO = "CANCELADO"
}
export declare class InventoryCount {
    id: number;
    almacen: string;
    descripcion: string;
    estado: ConteoEstado;
    totalProductos: number;
    totalVariacion: number;
    items: CountItem[];
    createdAt: Date;
}
