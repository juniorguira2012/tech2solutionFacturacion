import { Product } from '../../products/entities/product.entity';
import { User } from '../../user/dto/entities/user.entity';
export declare class Comodato {
    id: number;
    productoId: number;
    producto: Product;
    responsable: string;
    nota: string;
    fechaEntrega: Date;
    fechaLimite: Date;
    fechaDevolucion: Date;
    usuarioId: number;
    usuario: User;
    estado: string;
    fechaCreacion: Date;
    fechaActualizacion: Date;
}
