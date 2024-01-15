/*
  Warnings:

  - You are about to drop the column `description` on the `BitcoinPrice` table. All the data in the column will be lost.
  - You are about to drop the column `symbol` on the `BitcoinPrice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BitcoinPrice" DROP COLUMN "description",
DROP COLUMN "symbol";
