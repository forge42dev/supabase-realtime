/*
  Warnings:

  - You are about to drop the `_ActivePlayerToRoom` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ActivePlayerToRoom" DROP CONSTRAINT "_ActivePlayerToRoom_A_fkey";

-- DropForeignKey
ALTER TABLE "_ActivePlayerToRoom" DROP CONSTRAINT "_ActivePlayerToRoom_B_fkey";

-- DropForeignKey
ALTER TABLE "active_players" DROP CONSTRAINT "active_players_player_id_fkey";

-- DropIndex
DROP INDEX "active_players_player_id_key";

-- AlterTable
ALTER TABLE "active_players" ADD COLUMN     "playerid" TEXT;

-- DropTable
DROP TABLE "_ActivePlayerToRoom";

-- CreateIndex
CREATE INDEX "active_players_player_id_room_id_idx" ON "active_players"("player_id", "room_id");

-- AddForeignKey
ALTER TABLE "active_players" ADD CONSTRAINT "active_players_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "active_players" ADD CONSTRAINT "active_players_playerid_fkey" FOREIGN KEY ("playerid") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
