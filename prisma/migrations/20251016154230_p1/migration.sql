/*
  Warnings:

  - You are about to drop the column `preferred_resource` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `roof_area` on the `project_info` table. All the data in the column will be lost.
  - You are about to drop the column `roof_orientation` on the `project_info` table. All the data in the column will be lost.
  - The `shading_factors` column on the `project_info` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `electrical_capacity` column on the `project_info` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[code]` on the table `project` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_customer_id_fkey";

-- AlterTable
ALTER TABLE "project" DROP COLUMN "preferred_resource",
ADD COLUMN     "code" SERIAL NOT NULL,
ADD COLUMN     "grid_connectivity" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "start_date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "customer_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "project_info" DROP COLUMN "roof_area",
DROP COLUMN "roof_orientation",
ADD COLUMN     "orientation" TEXT,
ADD COLUMN     "panel_type" TEXT,
ADD COLUMN     "tilt_angle" DOUBLE PRECISION,
DROP COLUMN "shading_factors",
ADD COLUMN     "shading_factors" DOUBLE PRECISION,
DROP COLUMN "electrical_capacity",
ADD COLUMN     "electrical_capacity" DOUBLE PRECISION;

-- DropEnum
DROP TYPE "PreferredResource";

-- CreateIndex
CREATE UNIQUE INDEX "project_code_key" ON "project"("code");

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
