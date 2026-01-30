/*
  Warnings:

  - The primary key for the `Company` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `legalName` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `taxId` on the `Company` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[legalId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyName` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `legalId` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Company_taxId_key";

-- AlterTable
ALTER TABLE "Company" DROP CONSTRAINT "Company_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "legalName",
DROP COLUMN "taxId",
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id_Company" SERIAL NOT NULL,
ADD COLUMN     "legalId" TEXT NOT NULL,
ADD CONSTRAINT "Company_pkey" PRIMARY KEY ("id_Company");

-- CreateIndex
CREATE UNIQUE INDEX "Company_legalId_key" ON "Company"("legalId");
