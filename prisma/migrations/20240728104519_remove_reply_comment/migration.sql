/*
  Warnings:

  - You are about to drop the `ReplyComment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReplyComment" DROP CONSTRAINT "ReplyComment_commentId_fkey";

-- DropForeignKey
ALTER TABLE "ReplyComment" DROP CONSTRAINT "ReplyComment_userId_fkey";

-- DropTable
DROP TABLE "ReplyComment";
