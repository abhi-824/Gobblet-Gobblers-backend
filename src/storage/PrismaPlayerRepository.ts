import { PrismaClient } from "@prisma/client";
import { Player } from "../core/models/Player";
import { IPlayerRepository } from "./ports";

const prisma = new PrismaClient();

export class PrismaPlayerRepository implements IPlayerRepository {
  async savePlayer(player: Player): Promise<void> {
    await prisma.player.create({
      data: {
        id: player.id,
        type: player.type,
        name: player.name,
        gameId: "", // ⚠️ must be passed externally when saving players
      },
    });
  }

  async updatePlayer(partial: Partial<Player> & { id: string }): Promise<void> {
    await prisma.player.update({
      where: { id: partial.id },
      data: {
        type: partial.type,
        name: partial.name,
      },
    });
  }

  async getPlayerById(id: string): Promise<Player | null> {
    const db = await prisma.player.findUnique({
      where: { id },
      include: { pieces: true },
    });
    if (!db) return null;

    const player = new Player(db.id, db.type as "human" | "computer", db.name ?? undefined);
    // attach pieces
    db.pieces.forEach((p) => {
      const { GamePiece } = require("../core/models/GamePiece");
      player.addPiece(new GamePiece(p.size, player));
    });
    return player;
  }
}
