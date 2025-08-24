import type { Request, Response } from "express";
import { GameService } from "../services/GameService";
import { z } from "zod";
import { BotDifficulty } from "../core/types/BotDifficulty";

const CreateGameSchema = z.object({
    mode: z.enum(["pvp", "pvc"]),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});
const JoinGameSchema = z.object({ playerName: z.string().min(1) });
const MakeMoveSchema = z.object({
    playerId: z.string().min(1),
    pieceId: z.string().min(1),
    to: z.tuple([z.number().int().min(0).max(2), z.number().int().min(0).max(2)]),
});

export class GameController {
    constructor(private svc: GameService) { }

    createGame = async (req: Request, res: Response) => {
        const body = CreateGameSchema.parse(req.body);
        const difficulty: BotDifficulty =
            body.difficulty
                ? BotDifficulty[body.difficulty.toUpperCase() as keyof typeof BotDifficulty]
                : BotDifficulty.EASY;

        const game = await this.svc.createGame(body.mode, difficulty);
        res.status(201).json(game);
    };

    joinGame = async (req: Request, res: Response) => {
        const { id } = req.params;
        const body = JoinGameSchema.parse(req.body);
        const game = await this.svc.joinGame(id, body.playerName);
        res.json(game);
    };

    startGame = async (req: Request, res: Response) => {
        const { id } = req.params;
        const game = await this.svc.startGame(id);
        res.json(game);
    };

    getGameState = async (req: Request, res: Response) => {
        const { id } = req.params;
        const game = await this.svc.getGameState(id);
        res.json(game);
    };

    makeMove = async (req: Request, res: Response) => {
        const { id } = req.params;
        const body = MakeMoveSchema.parse(req.body);
        const updated = await this.svc.makeMove(id, body.playerId, body.pieceId, body.to);
        res.json(updated);
    };

    getMoveHistory = async (req: Request, res: Response) => {
        const { id } = req.params;
        const moves = await this.svc.getMoveHistory(id);
        res.json(moves);
    };

    getPieces = async (req: Request, res: Response) => {
        const { id } = req.params;
        const pieces = await this.svc.getPieces(id);
        res.json(pieces);
    };
}
