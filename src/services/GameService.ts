import { BotStrategyFactory } from "../core/bot/BotStartegyFactory";
import { Player } from "../core/models/Player";
import { BotDifficulty } from "../core/types/BotDifficulty";
import { IBoardRepository, IMoveRepository, IPieceRepository, IPlayerRepository } from "../storage/ports";
import { IGameRepository } from "../storage/ports";


import { Board } from "../core/models/Board";
import { GamePiece } from "../core/models/GamePiece";
import { PieceSize } from "../core/types/PieceSize";
import { Game } from "../core/models/Game";
import { toPublicGameDTO } from "../core/utils/mappers";
import { Move } from "../core/models/Move";
const uid = () => Math.random().toString(36).slice(2);

export class GameService {
  constructor(
    private games: IGameRepository,
    private players: IPlayerRepository,
    private pieces: IPieceRepository,
    private boards: IBoardRepository,
    private moves: IMoveRepository,
    private botFactory: typeof BotStrategyFactory
  ) {}

  async createGame(mode: "pvp" | "pvc", difficulty: BotDifficulty = BotDifficulty.EASY) {
    const id = uid();
    const board = new Board(3);
    const p1 = new Player(uid(), "human");
    const p2 =
      mode === "pvc" ? new Player(uid(), "computer") : new Player(uid(), "human");

    // 2 pieces of each size per player (like your CLI)
    ([PieceSize.SM, PieceSize.MD, PieceSize.LG] as const).forEach((s) => {
      p1.addPiece(new GamePiece(s, p1));
      p1.addPiece(new GamePiece(s, p1));
      p2.addPiece(new GamePiece(s, p2));
      p2.addPiece(new GamePiece(s, p2));
    });

    const game = new Game(board, [p1, p2], p1);
    await this.games.saveGame(id, game, { mode, difficulty, createdAt: Date.now() });
    await this.players.savePlayer(p1);
    await this.players.savePlayer(p2);
    await this.boards.saveBoard(id, board);
    await this.pieces.saveInitialPieces(id, [p1, p2]);

    return toPublicGameDTO(id, game);
  }

  async joinGame(gameId: string, playerName: string) {
    const { game } = await this.games.getGameById(gameId);
    if (!game) throw new Error("Game not found");
    // For PvP: attach a human name to the second player if unnamed
    const second = game.players[1];
    if (second.type !== "human") throw new Error("Game is not PvP");
    await this.players.updatePlayer({ id: second.id, name: playerName });
    return toPublicGameDTO(gameId, game);
  }

  async startGame(gameId: string) {
    const { game, meta } = await this.games.getGameById(gameId);
    if (!game || !meta) throw new Error("Game not found");
    await this.games.updateGame(gameId, game, { ...meta, startedAt: Date.now() });
    return toPublicGameDTO(gameId, game);
  }

  async getGameState(gameId: string) {
    const { game } = await this.games.getGameById(gameId);
    if (!game) throw new Error("Game not found");
    return toPublicGameDTO(gameId, game);
  }

  async makeMove(
    gameId: string,
    playerId: string,
    pieceId: string,
    to: [number, number]
  ) {
    const { game } = await this.games.getGameById(gameId);
    if (!game) throw new Error("Game not found");

    // Resolve player & piece from in-memory piece store
    const player = await this.players.getPlayerById(playerId);
    if (!player) throw new Error("Player not found");

    const piece = await this.pieces.getPieceById(pieceId);
    if (!piece) throw new Error("Piece not found");
    if (piece.owner.id !== playerId) throw new Error("Not your piece");

    const from = game.board.findPiecePosition(piece);

    const move = new Move(player, from, to, piece);
    const ok = game.makeMove(move);
    
    if (!ok) throw new Error("Invalid move");

    await this.moves.append(gameId, move);
    await this.boards.updateBoard(gameId, game.board);
    await this.games.updateGame(gameId, game);

    // If next is bot (PVC), auto-move bot
    const next = game.currentPlayer;
    if (next.type === "computer") {
      const { meta } = await this.games.getGameById(gameId);
      const strat = this.botFactory.create(
        (meta?.difficulty as BotDifficulty) ?? BotDifficulty.EASY
      );
      const botMove = strat.decideMove(game, next);
      const ok2 = game.makeMove(botMove);
      if (ok2) {
        await this.moves.append(gameId, botMove);
        await this.boards.updateBoard(gameId, game.board);
        await this.games.updateGame(gameId, game);
      }
    }

    return toPublicGameDTO(gameId, game);
  }

  async getMoveHistory(gameId: string) {
    return this.moves.getAll(gameId).then((ms) =>
      ms.map((m) => ({
        playerId: m.player.id,
        pieceSize: PieceSize[m.piece.size],
        to: m.to,
      }))
    );
  }

  async getPieces(gameId: string) {
    return this.pieces.getByGame(gameId).then((ps) =>
      ps.map((p) => ({
        id: p.id,
        ownerId: p.owner.id,
        size: PieceSize[p.size],
      }))
    );
  }
}
