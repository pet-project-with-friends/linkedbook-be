/*
  Warnings:

  - You are about to drop the column `hashEmail` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_hashEmail_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "hashEmail";
