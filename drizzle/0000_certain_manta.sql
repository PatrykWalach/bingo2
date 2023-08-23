DO $$ BEGIN
 CREATE TYPE "Role" AS ENUM('GAME_MASTER', 'PLAYER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "State" AS ENUM('SETUP', 'LOCKED', 'RUNNING', 'DONE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "WinCondition" AS ENUM('FIRST_ROW', 'ALL_ROWS');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Room" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text,
	"state" "State" DEFAULT 'SETUP',
	"isWithFreeTile" boolean DEFAULT false,
	"isWithHiddenBoards" boolean DEFAULT false,
	"winCodition" "WinCondition" DEFAULT 'FIRST_ROW'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_BoardTileToRow" (
	"rowId" uuid,
	"boardTileId" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BoardTile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tileId" uuid,
	"playerRoomCode" text,
	"playerUserSecret" text,
	"index" integer,
	CONSTRAINT "BoardTile_playerRoomCode_playerUserSecret_index_key" UNIQUE("playerRoomCode","playerUserSecret","index"),
	CONSTRAINT "BoardTile_playerRoomCode_playerUserSecret_tileId_key" UNIQUE("playerRoomCode","playerUserSecret","tileId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Player" (
	"roomCode" text,
	"userSecret" text,
	"name" text,
	"color" text DEFAULT 'red',
	"avatar" text DEFAULT '/wolf_64.png',
	"role" "Role" DEFAULT 'PLAYER',
	CONSTRAINT Player_roomCode_userSecret PRIMARY KEY("roomCode","userSecret")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BoardRow" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Tile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"content" text,
	"isComplete" boolean DEFAULT false,
	"roomCode" text,
	"userSecret" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" uuid PRIMARY KEY NOT NULL,
	"secret" text,
	CONSTRAINT "User_secret_key" UNIQUE("secret")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_BoardTileToRow_rowId_boardTileId_key" ON "_BoardTileToRow" ("rowId","boardTileId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_BoardTileToRow" ADD CONSTRAINT "_BoardTileToRow_rowId_BoardRow_id_fk" FOREIGN KEY ("rowId") REFERENCES "BoardRow"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_BoardTileToRow" ADD CONSTRAINT "_BoardTileToRow_boardTileId_BoardTile_id_fk" FOREIGN KEY ("boardTileId") REFERENCES "BoardTile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BoardTile" ADD CONSTRAINT "BoardTile_tileId_Tile_id_fk" FOREIGN KEY ("tileId") REFERENCES "Tile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BoardTile" ADD CONSTRAINT "BoardTile_playerRoomCode_playerUserSecret_Player_roomCode_userSecret_fk" FOREIGN KEY ("playerRoomCode","playerUserSecret") REFERENCES "Player"("roomCode","userSecret") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Player" ADD CONSTRAINT "Player_roomCode_Room_code_fk" FOREIGN KEY ("roomCode") REFERENCES "Room"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Player" ADD CONSTRAINT "Player_userSecret_User_secret_fk" FOREIGN KEY ("userSecret") REFERENCES "User"("secret") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Tile" ADD CONSTRAINT "Tile_roomCode_userSecret_Player_roomCode_userSecret_fk" FOREIGN KEY ("roomCode","userSecret") REFERENCES "Player"("roomCode","userSecret") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
