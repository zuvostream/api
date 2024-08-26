/*
  Warnings:

  - You are about to drop the column `About` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Banner` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Discord` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `SpotifyExpiresIn` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `SpotifyRefreshToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `SpotifyToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "About",
DROP COLUMN "Avatar",
DROP COLUMN "Banner",
DROP COLUMN "Discord",
DROP COLUMN "SpotifyExpiresIn",
DROP COLUMN "SpotifyRefreshToken",
DROP COLUMN "SpotifyToken";

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "Creator" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_Creator_fkey" FOREIGN KEY ("Creator") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
