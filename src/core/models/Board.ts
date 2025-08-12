import { BoardCell } from "./BoardCell";
import type { GamePiece } from "./GamePiece";
import type { Move } from "./Move";
import type { Player } from "./Player";

export class Board {
  grid: BoardCell[][];

  constructor(public size = 3) {
    this.grid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(null).map(() => new BoardCell()));
  }

  getCell(row: number, col: number): BoardCell {
    return this.grid[row]![col]!;
  }

  isValidMove(row: number, col: number, piece: GamePiece): boolean {
    return this.getCell(row, col).canPlace(piece);
  }

  applyMove(move: Move): boolean {
    const { from, to, piece } = move;
    if (!this.isValidMove(to[0], to[1], piece)) return false;
    if (from) this.getCell(from[0], from[1]).removeTop();
    this.getCell(to[0], to[1]).place(piece);
    return true;
  }

  checkWin(player: Player): boolean {
    // placeholder for win-check logic
    
    return false;
  }
}
