-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GAME_MASTER', 'PLAYER');

-- CreateEnum
CREATE TYPE "State" AS ENUM ('SETUP', 'LOCKED', 'RUNNING', 'DONE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "roomCode" TEXT NOT NULL,
    "userSecret" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'red',
    "avatar" TEXT NOT NULL DEFAULT '/wolf_64.png',
    "role" "Role" NOT NULL DEFAULT 'PLAYER',

    CONSTRAINT "Player_pkey" PRIMARY KEY ("roomCode","userSecret")
);

-- CreateTable
CREATE TABLE "BoardTile" (
    "id" SERIAL NOT NULL,
    "tileId" TEXT NOT NULL,
    "playerRoomCode" TEXT NOT NULL,
    "playerUserSecret" TEXT NOT NULL,

    CONSTRAINT "BoardTile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tile" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "roomCode" TEXT NOT NULL,
    "userSecret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" "State" NOT NULL DEFAULT 'SETUP',

    CONSTRAINT "Room_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_secret_key" ON "User"("secret");

-- CreateIndex
CREATE UNIQUE INDEX "BoardTile_playerRoomCode_playerUserSecret_tileId_key" ON "BoardTile"("playerRoomCode", "playerUserSecret", "tileId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_roomCode_fkey" FOREIGN KEY ("roomCode") REFERENCES "Room"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userSecret_fkey" FOREIGN KEY ("userSecret") REFERENCES "User"("secret") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardTile" ADD CONSTRAINT "BoardTile_tileId_fkey" FOREIGN KEY ("tileId") REFERENCES "Tile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardTile" ADD CONSTRAINT "BoardTile_playerRoomCode_playerUserSecret_fkey" FOREIGN KEY ("playerRoomCode", "playerUserSecret") REFERENCES "Player"("roomCode", "userSecret") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tile" ADD CONSTRAINT "Tile_roomCode_userSecret_fkey" FOREIGN KEY ("roomCode", "userSecret") REFERENCES "Player"("roomCode", "userSecret") ON DELETE RESTRICT ON UPDATE CASCADE;
