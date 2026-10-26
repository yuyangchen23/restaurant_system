CREATE UNIQUE INDEX "DiningSession_one_per_table"
ON "DiningSession" ("tableId")
WHERE "closeAt" IS NULL;