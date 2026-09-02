"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
var typeorm_1 = require("typeorm");
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 5432,
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '24681357',
    database: process.env.DATABASE_NAME || 'tech_two_solution_db',
    // Ruta a tus entidades compiladas (importante para que el CLI las encuentre)
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    // Ruta donde se guardarán las migraciones
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false, // Siempre false al usar migraciones
    logging: true,
});
