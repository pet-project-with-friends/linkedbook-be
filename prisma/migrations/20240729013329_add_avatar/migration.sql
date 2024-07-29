/*
  Warnings:

  - You are about to drop the column `userId` on the `Image` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[avatarId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `avatarId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_userId_fkey";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_avatarId_key" ON "User"("avatarId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
