/*
  Warnings:

  - The primary key for the `Company` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `companyName` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `creationDate` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `id_Company` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `legalId` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `mainAdministrator` on the `Company` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[taxId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mainAdminId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `legalName` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxId` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('COMPANY_ADMIN', 'EMPLOYEE', 'SUPPORT_TECH');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TechStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('JUNIOR', 'MID', 'SENIOR', 'EXPERT');

-- DropIndex
DROP INDEX "Company_legalId_key";

-- AlterTable
ALTER TABLE "Company" DROP CONSTRAINT "Company_pkey",
DROP COLUMN "companyName",
DROP COLUMN "creationDate",
DROP COLUMN "id_Company",
DROP COLUMN "legalId",
DROP COLUMN "mainAdministrator",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "legalName" TEXT NOT NULL,
ADD COLUMN     "mainAdminId" INTEGER,
ADD COLUMN     "taxId" TEXT NOT NULL,
ADD CONSTRAINT "Company_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Area" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "phone" TEXT,
    "accountStatus" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" INTEGER NOT NULL,
    "areaId" INTEGER,
    "experienceLevel" "ExperienceLevel",
    "techStatus" "TechStatus",

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TechSpecialization" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TechSpecialization_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "_TechSpecialization_B_index" ON "_TechSpecialization"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Company_taxId_key" ON "Company"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_mainAdminId_key" ON "Company"("mainAdminId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_mainAdminId_fkey" FOREIGN KEY ("mainAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TechSpecialization" ADD CONSTRAINT "_TechSpecialization_A_fkey" FOREIGN KEY ("A") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TechSpecialization" ADD CONSTRAINT "_TechSpecialization_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
