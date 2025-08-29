import { PrismaClient } from "@prisma/client";
import { GameMeta, IGameRepository } from "./ports";
import { Game } from "../core/models/Game";
import { Player } from "../core/models/Player";
import { Board } from "../core/models/Board";
import { Move } from "../core/models/Move";
import { GamePiece } from "../core/models/GamePiece";

const prisma = new PrismaClient();

export class PrismaGameRepository implements IGameRepository {
    async saveGame(id: string, game: Game, meta: GameMeta): Promise<void> {
        await prisma.game.create({
            data: {
                id,
                mode: meta.mode,
                difficulty: meta.difficulty,
                createdAt: new Date(meta.createdAt),
                startedAt: meta.startedAt ? new Date(meta.startedAt) : null,
                status: game.status,
                players: {
                    create: game.players.map((p) => ({
                        id: p.id,
                        type: p.type,
                        name: p.name,
                        pieces: {
                            create: p.getAvailablePieces().map((gp) => ({
                                id: gp.id,
                                size: gp.size,
                                game: { connect: { id } }, // connect piece to the game
                            })),
                        },
                    })),
                },
                board: {
                    create: {
                        id: crypto.randomUUID(),
                        state: {
                            grid: game.board.grid.map((row) =>
                                row.map((c) => c.getStack().map((p) => p.id))
                            ),
                        },
                    },
                },
            },
        });
    }

    async getGameById(id: string): Promise<{ game: Game | null; meta?: GameMeta }> {
        const dbGame = await prisma.game.findUnique({
            where: { id },
            include: {
                players: { include: { pieces: true } },
                board: true,
                moves: { include: { player: true, piece: true } },
            },
        });

        if (!dbGame) return { game: null };

        // --- Reconstruct domain models ---
        const players = dbGame.players.map(
            (p) => new Player(p.id, p.type as "human" | "computer", p.name ?? undefined)
        );

        // Reconstruct pieces with correct IDs
        dbGame.players.forEach((p, i) => {
            p.pieces.forEach((piece) => {
                const gp = new GamePiece(piece.size, players[i]);
                gp.id = piece.id; // ✅ preserve DB identity
                players[i].addPiece(gp);
            });
        });

        const board = new Board(3);
        const game = new Game(board, players as [Player, Player], players[0]);
        game.id = dbGame.id;
        game.status = dbGame.status as any;

        // Replay moves to rebuild state
        dbGame.moves.forEach((m) => {
            const pl = players.find((pl) => pl.id === m.playerId)!;
            const pc = pl.getAvailablePieces().find((p) => p.id === m.pieceId)!;
            if (pc) {
                const move = new Move(
                    pl,
                    (m.from as [number, number]) ?? null,
                    m.to as [number, number],
                    pc
                );
                game.makeMove(move);
            }
        });


        const meta: GameMeta = {
            mode: dbGame.mode as "pvp" | "pvc",
            difficulty: dbGame.difficulty as any,
            createdAt: dbGame.createdAt.getTime(),
            startedAt: dbGame.startedAt?.getTime(),
        };

        return { game, meta };
    }

    async updateGame(id: string, game: Game, meta?: GameMeta): Promise<void> {
        await prisma.game.update({
            where: { id },
            data: {
                status: game.status,
                startedAt: meta?.startedAt ? new Date(meta.startedAt) : undefined,
                board: {
                    update: {
                        state: {
                            grid: game.board.grid.map((row) =>
                                row.map((c) => c.getStack().map((p) => p.id))
                            ),
                        },
                    },
                },
            },
        });
    }
}
