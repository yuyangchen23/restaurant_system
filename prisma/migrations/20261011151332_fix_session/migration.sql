/*
  Warnings:

  - You are about to drop the column `tokeHash` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokenHash` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Session_tokeHash_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "tokeHash",
ADD COLUMN     "tokenHash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "sessionId";

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
