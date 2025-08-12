import type { PieceSize } from "../types/PieceSize";
import { Player } from "./Player";

export class GamePiece {
    public readonly size: PieceSize;
    public readonly owner: Player;
  
    constructor(size: PieceSize, owner: Player) {
      this.size = size;
      this.owner = owner;
    }
  }
  