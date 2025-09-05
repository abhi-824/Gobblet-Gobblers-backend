import { PrismaClient } from "@prisma/client";
import { IMoveRepository } from "./ports";
import { Move } from "../core/models/Move";
import { Player } from "../core/models/Player";
import { GamePiece } from "../core/models/GamePiece";

const prisma = new PrismaClient();

export class PrismaMoveRepository implements IMoveRepository {
  async append(gameId: string, move: Move): Promise<void> {
    await prisma.move.create({
      data: {
        id: crypto.randomUUID(),
        playerId: move.player.id,
        pieceId: move.piece.id,
        gameId,
        from: move.from ?? undefined,
        to: move.to,
      },
    });
  }

  async getAll(gameId: string): Promise<Move[]> {
    const moves = await prisma.move.findMany({
      where: { gameId },
      include: { player: true, piece: true },
      orderBy: { createdAt: "asc" },
    });

    return moves.map((m) => {
      const pl = new Player(m.player.id, m.player.type as "human" | "computer", m.player.name ?? undefined);
      // Preserve piece id used in the move
      const gp = new GamePiece(m.piece.size as any, pl, m.piece.id);
      return new Move(pl, (m.from as [number, number]) ?? null, m.to as [number, number], gp);
    });
  }
}
