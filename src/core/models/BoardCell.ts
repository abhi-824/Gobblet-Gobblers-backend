import { GamePiece } from "./GamePiece";

export class BoardCell {
  private stack: GamePiece[] = [];

  top(): GamePiece | null {
    return this.stack[this.stack.length - 1] ?? null;
  }

  canPlace(piece: GamePiece): boolean {
    const top = this.top();
    return !top || piece.size > top.size;
  }

  place(piece: GamePiece): boolean {
    if (!this.canPlace(piece)) return false;
    this.stack.push(piece);
    return true;
  }

  removeTop(): GamePiece | null {
    return this.stack.pop() ?? null;
  }

  getStack(): GamePiece[] {
    return [...this.stack];
  }

  contains(piece: GamePiece): boolean {
    return this.stack.some(p => p.id === piece.id);
  }
}
