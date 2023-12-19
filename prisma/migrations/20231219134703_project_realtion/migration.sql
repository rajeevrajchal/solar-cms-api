/*
  Warnings:

  - You are about to drop the column `user_id` on the `customer_electric_load` table. All the data in the column will be lost.
  - You are about to drop the column `quoteId` on the `project` table. All the data in the column will be lost.
  - The `latitude` column on the `project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `longitude` column on the `project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `project_id` to the `customer_electric_load` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `customer_electric_load` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "customer_electric_load" DROP CONSTRAINT "customer_electric_load_user_id_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_quoteId_fkey";

-- AlterTable
ALTER TABLE "customer_electric_load" DROP COLUMN "user_id",
ADD COLUMN     "project_id" TEXT NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "project" DROP COLUMN "quoteId",
ADD COLUMN     "creator_id" TEXT,
DROP COLUMN "latitude",
ADD COLUMN     "latitude" DOUBLE PRECISION,
DROP COLUMN "longitude",
ADD COLUMN     "longitude" DOUBLE PRECISION,
ALTER COLUMN "customer_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "reset_token" TEXT;

-- AddForeignKey
ALTER TABLE "customer_electric_load" ADD CONSTRAINT "customer_electric_load_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
