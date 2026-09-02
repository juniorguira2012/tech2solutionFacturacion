export declare class BulkMovementItemDto {
    productoId: number;
    cantidad?: number;
    almacen?: string;
    lote?: string;
    serials?: string[];
}
export declare class CreateBulkMovementDto {
    tipo: string;
    nota: string;
    items: BulkMovementItemDto[];
    usuarioId?: number;
    referencia?: string;
}
