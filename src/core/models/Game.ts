import { Board } from "./Board";
import { Player } from "./Player";
import { Move } from "./Move";

export type GameStatus = "in_progress" | "win" | "draw";

export class Game {
  private moves: Move[] = [];
  public status: GameStatus = "in_progress";

  constructor(
    public readonly board: Board,
    public readonly players: [Player, Player],
    public currentPlayer: Player
  ) {}

  getOpponent(): Player {
    return this.players.find(p => p !== this.currentPlayer)!;
  }

  makeMove(move: Move): boolean {
    if (move.player !== this.currentPlayer) throw new Error("Not your turn.");
    const success = this.board.applyMove(move);
    move.player.removePiece(move.piece);
    if (!success) return false;

    this.moves.push(move);

    if (this.board.checkWin(this.currentPlayer)) {
      this.status = "win";
    } else if (this.moves.length >= 9) {
      this.status = "draw";
    } else {
      this.currentPlayer = this.getOpponent();
    }

    return true;
  }
}
