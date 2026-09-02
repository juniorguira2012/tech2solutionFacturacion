declare class SaleItemDto {
    productoId: number;
    cantidad: number;
    precio: number;
}
export declare class CreateSaleDto {
    cliente: string;
    rnc?: string;
    subtotal: number;
    descuento?: number;
    itbis: number;
    total: number;
    vendedorId?: string;
    items: SaleItemDto[];
}
export {};
