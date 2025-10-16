/*
  Warnings:

  - The values [CANCLED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The `payment` column on the `order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `actual_area` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `battery_type` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `capacity` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `cleaning` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `correction_factor` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `estimated_area` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `panel_info` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `power_out_voltage` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `power_out_watt` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `reserve_power_for` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `sun_direction` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `sun_hour_average` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `sun_hour_monsoon` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `sun_hour_summer` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `sun_hour_winter` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `total_sun_power_need` on the `project` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('SOLAR', 'WIND', 'HYDRO', 'TIDAL');

-- CreateEnum
CREATE TYPE "PreferredResource" AS ENUM ('WIND', 'SOLAR', 'TIDAL');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('ORDERED', 'CANALED', 'PENDING', 'ON_HOLD', 'PAYMENT_DONE');
ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "full_payment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quote_data" JSONB,
ADD COLUMN     "reason" TEXT,
DROP COLUMN "payment",
ADD COLUMN     "payment" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "project" DROP COLUMN "actual_area",
DROP COLUMN "battery_type",
DROP COLUMN "capacity",
DROP COLUMN "cleaning",
DROP COLUMN "correction_factor",
DROP COLUMN "estimated_area",
DROP COLUMN "panel_info",
DROP COLUMN "power_out_voltage",
DROP COLUMN "power_out_watt",
DROP COLUMN "reserve_power_for",
DROP COLUMN "sun_direction",
DROP COLUMN "sun_hour_average",
DROP COLUMN "sun_hour_monsoon",
DROP COLUMN "sun_hour_summer",
DROP COLUMN "sun_hour_winter",
DROP COLUMN "total_sun_power_need",
ADD COLUMN     "preferred_resource" "PreferredResource",
ADD COLUMN     "type" "ProjectType" NOT NULL DEFAULT 'SOLAR';

-- CreateTable
CREATE TABLE "project_info" (
    "id" TEXT NOT NULL,
    "area" DOUBLE PRECISION,
    "power_out_watt" DOUBLE PRECISION,
    "power_out_voltage" DOUBLE PRECISION,
    "reserve_power_for" DOUBLE PRECISION,
    "tidal_range" DOUBLE PRECISION,
    "tidal_currents" DOUBLE PRECISION,
    "tidal_cycle_duration" DOUBLE PRECISION,
    "bathymetry_data" TEXT,
    "water_density" DOUBLE PRECISION,
    "seabed_conditions" TEXT,
    "flow_rate" DOUBLE PRECISION,
    "head" DOUBLE PRECISION,
    "reservoir_capacity" DOUBLE PRECISION,
    "water_quality" TEXT,
    "environmental_impact" TEXT,
    "roof_area" DOUBLE PRECISION,
    "roof_orientation" TEXT,
    "shading_factors" TEXT,
    "electrical_capacity" TEXT,
    "solar_irradiance" DOUBLE PRECISION,
    "temperature_data" TEXT,
    "terrain_elevation" DOUBLE PRECISION,
    "terrain_roughness" TEXT,
    "obstacle_data" TEXT,
    "wind_measurements" JSONB,
    "environmental_data" TEXT,
    "project_id" TEXT NOT NULL,

    CONSTRAINT "project_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_services" (
    "id" TEXT NOT NULL,
    "project_id" TEXT,

    CONSTRAINT "project_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_document" (
    "id" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "description" TEXT,
    "vendor_id" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_info_id_key" ON "project_info"("id");

-- CreateIndex
CREATE UNIQUE INDEX "project_info_project_id_key" ON "project_info"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_services_id_key" ON "project_services"("id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_document_id_key" ON "vendor_document"("id");

-- AddForeignKey
ALTER TABLE "project_info" ADD CONSTRAINT "project_info_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_services" ADD CONSTRAINT "project_services_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_document" ADD CONSTRAINT "vendor_document_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
