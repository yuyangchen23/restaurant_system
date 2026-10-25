CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Reservation"
  ADD CONSTRAINT "reservation_valid_time"
    CHECK ("endTime" > "startTime"),

  ADD CONSTRAINT "reservation_no_overlap"
    EXCLUDE USING gist (
      "tableId" WITH =,
      tsrange("startTime", "endTime", '[)') WITH &&
    )
  WHERE (status IN ('PENDING', 'CONFIRMED'));
  