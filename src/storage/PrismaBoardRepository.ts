import { PrismaClient } from "@prisma/client";
import { IBoardRepository } from "./ports";
import { Board } from "../core/models/Board";

const prisma = new PrismaClient();

export class PrismaBoardRepository implements IBoardRepository {
  async saveBoard(gameId: string, board: Board): Promise<void> {
    await prisma.board.create({
      data: {
        id: crypto.randomUUID(),
        gameId,
        state: { grid: board.grid.map((row) =>
          row.map((c) => c.getStack().map((p) => p.id))
        ) },
      },
    });
  }

  async getBoardByGameId(gameId: string): Promise<Board | null> {
    const db = await prisma.board.findUnique({ where: { gameId } });
    if (!db) return null;

    const board = new Board(3);
    // Board state is JSON of piece ids, you’d need to replay moves or hydrate pieces later.
    return board;
  }

  async updateBoard(gameId: string, board: Board): Promise<void> {
    await prisma.board.update({
      where: { gameId },
      data: {
        state: { grid: board.grid.map((row) =>
          row.map((c) => c.getStack().map((p) => p.id))
        ) },
      },
    });
  }
}
