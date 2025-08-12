import { GamePiece } from "./GamePiece";
import { Player } from "./Player";

export class Move {
  constructor(
    public readonly player: Player,
    public readonly from: [number, number] | null,
    public readonly to: [number, number],
    public readonly piece: GamePiece
  ) {}
}
