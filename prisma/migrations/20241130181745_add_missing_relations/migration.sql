/*
  Warnings:

  - A unique constraint covering the columns `[player_id]` on the table `active_players` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "_ActivePlayerToRoom" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActivePlayerToRoom_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ActivePlayerToRoom_B_index" ON "_ActivePlayerToRoom"("B");

-- CreateIndex
CREATE UNIQUE INDEX "active_players_player_id_key" ON "active_players"("player_id");

-- AddForeignKey
ALTER TABLE "active_players" ADD CONSTRAINT "active_players_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivePlayerToRoom" ADD CONSTRAINT "_ActivePlayerToRoom_A_fkey" FOREIGN KEY ("A") REFERENCES "active_players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivePlayerToRoom" ADD CONSTRAINT "_ActivePlayerToRoom_B_fkey" FOREIGN KEY ("B") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
