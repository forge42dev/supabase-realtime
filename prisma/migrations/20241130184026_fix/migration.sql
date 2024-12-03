/*
  Warnings:

  - You are about to drop the column `playerid` on the `active_players` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "active_players" DROP CONSTRAINT "active_players_playerid_fkey";

-- AlterTable
ALTER TABLE "active_players" DROP COLUMN "playerid";

-- AddForeignKey
ALTER TABLE "active_players" ADD CONSTRAINT "active_players_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
