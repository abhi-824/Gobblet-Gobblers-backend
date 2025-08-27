-- CreateTable
CREATE TABLE "public"."Game" (
    "id" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "difficulty" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'in_progress',

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Player" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "gameId" TEXT NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Piece" (
    "id" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,

    CONSTRAINT "Piece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Board" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "state" JSONB NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Move" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "pieceId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "from" JSONB,
    "to" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Move_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Board_gameId_key" ON "public"."Board"("gameId");

-- AddForeignKey
ALTER TABLE "public"."Player" ADD CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Piece" ADD CONSTRAINT "Piece_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Piece" ADD CONSTRAINT "Piece_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Board" ADD CONSTRAINT "Board_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Move" ADD CONSTRAINT "Move_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Move" ADD CONSTRAINT "Move_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "public"."Piece"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Move" ADD CONSTRAINT "Move_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
