import { Product } from '../../products/entities/product.entity';
import { Technician } from './technician.entity';
import { User } from '../../user/dto/entities/user.entity';
export declare class Movement {
    id: number;
    productoId: number;
    producto: Product;
    tipo: string;
    cantidad: number;
    nota: string;
    nuevoStock?: number;
    costoUnitario?: number;
    referencia?: string;
    usuarioId: number;
    usuario?: User;
    technicianId?: number;
    technician?: Technician;
    almacenOrigen: string;
    almacenDestino: string;
    createdAt: Date;
}
