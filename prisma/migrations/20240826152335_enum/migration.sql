/*
  Warnings:

  - Added the required column `Visibility` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "Visibility" "ProjectVisibility" NOT NULL;
