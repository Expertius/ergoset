/*
  Warnings:

  - You are about to drop the column `supabaseId` on the `users` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_supabaseId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "supabaseId",
ADD COLUMN     "passwordHash" TEXT NOT NULL;
