/*
  Warnings:

  - Added the required column `explicitness` to the `Podcast` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feedUrl` to the `Podcast` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryGenre` to the `Podcast` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "explicitness" TEXT NOT NULL,
ADD COLUMN     "feedUrl" TEXT NOT NULL,
ADD COLUMN     "genres" TEXT[],
ADD COLUMN     "primaryGenre" TEXT NOT NULL,
ALTER COLUMN "trackId" SET DATA TYPE TEXT;
