/*
  Warnings:

  - The `product_image` column on the `inventory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `sn` on the `quote` table. All the data in the column will be lost.
  - You are about to drop the `component_connection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_component` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `component` to the `equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `quote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "component_connection" DROP CONSTRAINT "component_connection_component_from_id_fkey";

-- DropForeignKey
ALTER TABLE "component_connection" DROP CONSTRAINT "component_connection_component_to_id_fkey";

-- DropForeignKey
ALTER TABLE "component_connection" DROP CONSTRAINT "component_connection_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "component_connection" DROP CONSTRAINT "component_connection_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_component" DROP CONSTRAINT "project_component_project_id_fkey";

-- DropIndex
DROP INDEX "quote_sn_key";

-- AlterTable
ALTER TABLE "equipment" ADD COLUMN     "ampere" DOUBLE PRECISION,
ADD COLUMN     "component" TEXT NOT NULL,
ADD COLUMN     "connection" TEXT DEFAULT 'parallel',
ADD COLUMN     "set_name" TEXT,
ADD COLUMN     "voltage" DOUBLE PRECISION,
ADD COLUMN     "watt" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "inventory" DROP COLUMN "product_image",
ADD COLUMN     "product_image" JSONB;

-- AlterTable
ALTER TABLE "quote" DROP COLUMN "sn",
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "component_connection";

-- DropTable
DROP TABLE "project_component";

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
