import { PrismaClient } from "@prisma/client";
import { IPieceRepository } from "./ports";
import { Player } from "../core/models/Player";
import { GamePiece } from "../core/models/GamePiece";

const prisma = new PrismaClient();

export class PrismaPieceRepository implements IPieceRepository {
  async saveInitialPieces(gameId: string, players: Player[]): Promise<void> {
    await prisma.piece.createMany({
      data: players.flatMap((pl) =>
        pl.getAvailablePieces().map((gp) => ({
          id: gp.id,
          size: gp.size,
          ownerId: pl.id,
          gameId,
        }))
      ),
    });
  }

  async getByGame(gameId: string): Promise<GamePiece[]> {
    const pieces = await prisma.piece.findMany({
      where: { gameId },
      include: { owner: true },
    });

    return pieces.map((p) => {
      const owner = new Player(p.owner.id, p.owner.type as "human" | "computer", p.owner.name ?? undefined);
      return new GamePiece(p.size, owner);
    });
  }

  async getPieceById(id: string): Promise<GamePiece | null> {
    const piece = await prisma.piece.findUnique({ where: { id }, include: { owner: true } });
    if (!piece) return null;
    const owner = new Player(piece.owner.id, piece.owner.type as "human" | "computer", piece.owner.name ?? undefined);
    return new GamePiece(piece.size, owner);
  }
}
