CREATE TABLE IF NOT EXISTS fiber_projects (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  descripcion TEXT,
  cliente VARCHAR(160),
  zona VARCHAR(160),
  estado VARCHAR(40) NOT NULL DEFAULT 'planificado',
  presupuesto NUMERIC(14, 2) NOT NULL DEFAULT 0,
  inversion NUMERIC(14, 2) NOT NULL DEFAULT 0,
  "kilometrosPlanificados" NUMERIC(12, 3) NOT NULL DEFAULT 0,
  "kilometrosInstalados" NUMERIC(12, 3) NOT NULL DEFAULT 0,
  "tipoFibra" VARCHAR(120),
  "cantidadFibraPlanificada" INTEGER NOT NULL DEFAULT 0,
  "cantidadFibraUsada" INTEGER NOT NULL DEFAULT 0,
  "fechaInicio" DATE,
  "fechaFin" DATE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);