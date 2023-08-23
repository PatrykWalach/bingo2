ALTER TABLE "_BoardTileToRow" DROP CONSTRAINT "_BoardTileToRow_rowId_BoardRow_id_fk";
--> statement-breakpoint
ALTER TABLE "BoardTile" DROP CONSTRAINT "BoardTile_tileId_Tile_id_fk";
--> statement-breakpoint
ALTER TABLE "Player" DROP CONSTRAINT "Player_roomCode_Room_code_fk";
--> statement-breakpoint
ALTER TABLE "Tile" DROP CONSTRAINT "Tile_roomCode_userSecret_Player_roomCode_userSecret_fk";
--> statement-breakpoint
ALTER TABLE "BoardTile" DROP CONSTRAINT "BoardTile_playerRoomCode_playerUserSecret_index_key";--> statement-breakpoint
ALTER TABLE "BoardTile" DROP CONSTRAINT "BoardTile_playerRoomCode_playerUserSecret_tileId_key";--> statement-breakpoint
ALTER TABLE "User" DROP CONSTRAINT "User_secret_key";--> statement-breakpoint
DROP INDEX IF EXISTS "_BoardTileToRow_rowId_boardTileId_key";--> statement-breakpoint
ALTER TABLE "Room" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Room" ALTER COLUMN "state" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Room" ALTER COLUMN "isWithFreeTile" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Room" ALTER COLUMN "isWithHiddenBoards" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Room" ALTER COLUMN "winCodition" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "_BoardTileToRow" ALTER COLUMN "rowId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "_BoardTileToRow" ALTER COLUMN "rowId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "_BoardTileToRow" ALTER COLUMN "boardTileId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "_BoardTileToRow" ALTER COLUMN "boardTileId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "BoardTile" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "BoardTile" ALTER COLUMN "tileId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "BoardTile" ALTER COLUMN "tileId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "BoardTile" ALTER COLUMN "playerRoomCode" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "BoardTile" ALTER COLUMN "playerUserSecret" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "BoardTile" ALTER COLUMN "index" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "BoardTile" ALTER COLUMN "index" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Player" ALTER COLUMN "roomCode" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Player" ALTER COLUMN "userSecret" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Player" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Player" ALTER COLUMN "color" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Player" ALTER COLUMN "avatar" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Player" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "BoardRow" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Tile" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "Tile" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Tile" ALTER COLUMN "isComplete" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Tile" ALTER COLUMN "roomCode" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Tile" ALTER COLUMN "userSecret" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Tile" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3);--> statement-breakpoint
ALTER TABLE "Tile" ALTER COLUMN "createdAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "secret" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "BoardTile_playerRoomCode_playerUserSecret_index_key" ON "BoardTile" ("playerRoomCode","playerUserSecret","index");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "BoardTile_playerRoomCode_playerUserSecret_tileId_key" ON "BoardTile" ("tileId","playerRoomCode","playerUserSecret");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_BoardTileToRow_rowId_boardTileId_key" ON "_BoardTileToRow" ("boardTileId","rowId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_BoardTileToRow" ADD CONSTRAINT "_BoardTileToRow_rowId_BoardRow_id_fk" FOREIGN KEY ("rowId") REFERENCES "BoardRow"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BoardTile" ADD CONSTRAINT "BoardTile_tileId_Tile_id_fk" FOREIGN KEY ("tileId") REFERENCES "Tile"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Player" ADD CONSTRAINT "Player_roomCode_Room_code_fk" FOREIGN KEY ("roomCode") REFERENCES "Room"("code") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Tile" ADD CONSTRAINT "Tile_roomCode_userSecret_Player_roomCode_userSecret_fk" FOREIGN KEY ("roomCode","userSecret") REFERENCES "Player"("roomCode","userSecret") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
