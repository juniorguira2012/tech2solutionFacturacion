CREATE UNIQUE INDEX IF NOT EXISTS "IDX_products_serie_unique"
ON products (UPPER(BTRIM(serie)))
WHERE serie IS NOT NULL AND BTRIM(serie) <> '';