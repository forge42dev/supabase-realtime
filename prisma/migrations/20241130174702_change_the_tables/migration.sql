/*
  Warnings:

  - You are about to drop the column `is_active` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `room_id` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `scroll_position` on the `players` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "players" DROP CONSTRAINT "players_room_id_fkey";

-- AlterTable
ALTER TABLE "players" DROP COLUMN "is_active",
DROP COLUMN "room_id",
DROP COLUMN "score",
DROP COLUMN "scroll_position";

-- CreateTable
CREATE TABLE "active_players" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "score" INTEGER NOT NULL DEFAULT 0,
    "scrollPosition" JSONB DEFAULT '{"x": 0, "y": 0}',

    CONSTRAINT "active_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PlayerToRoom" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PlayerToRoom_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PlayerToRoom_B_index" ON "_PlayerToRoom"("B");

-- AddForeignKey
ALTER TABLE "_PlayerToRoom" ADD CONSTRAINT "_PlayerToRoom_A_fkey" FOREIGN KEY ("A") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerToRoom" ADD CONSTRAINT "_PlayerToRoom_B_fkey" FOREIGN KEY ("B") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
