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
        console.log("hey")
        const requestId = (req as any).requestId;
        try {
            const body = CreateGameSchema.parse(req.body);
            const difficulty: BotDifficulty =
                body.difficulty
                    ? BotDifficulty[body.difficulty.toUpperCase() as keyof typeof BotDifficulty]
                    : BotDifficulty.EASY;
            console.log(`[GameController:createGame] ${requestId} mode=${body.mode} difficulty=${difficulty}`);
            const game = await this.svc.createGame(body.mode, difficulty);
            res.status(201).json(game);
        } catch (err: any) {
            err.statusCode = err.statusCode || 400;
            throw err;
        }
    };

    joinGame = async (req: Request, res: Response) => {
        const requestId = (req as any).requestId;
        try {
            const { id } = req.params;
            const body = JoinGameSchema.parse(req.body);
            console.log(`[GameController:joinGame] ${requestId} id=${id} playerName=${body.playerName}`);
            const game = await this.svc.joinGame(id, body.playerName);
            res.json(game);
        } catch (err: any) {
            err.statusCode = err.statusCode || 400;
            throw err;
        }
    };

    startGame = async (req: Request, res: Response) => {
        const requestId = (req as any).requestId;
        try {
            const { id } = req.params;
            console.log(`[GameController:startGame] ${requestId} id=${id}`);
            const game = await this.svc.startGame(id);
            res.json(game);
        } catch (err: any) {
            err.statusCode = err.statusCode || 400;
            throw err;
        }
    };

    getGameState = async (req: Request, res: Response) => {
        const requestId = (req as any).requestId;
        try {
            const { id } = req.params;
            console.log(`[GameController:getGameState] ${requestId} id=${id}`);
            const game = await this.svc.getGameState(id);
            res.json(game);
        } catch (err: any) {
            err.statusCode = err.statusCode || 400;
            throw err;
        }
    };

    makeMove = async (req: Request, res: Response) => {
        console.log("hey")
        const requestId = (req as any).requestId;
        try {
            const { id } = req.params;
            const body = MakeMoveSchema.parse(req.body);
            console.log(`[GameController:makeMove] ${requestId} id=${id} playerId=${body.playerId} pieceId=${body.pieceId} to=${body.to}`);
            const updated = await this.svc.makeMove(id, body.playerId, body.pieceId, body.to);
            res.json(updated);
        } catch (err: any) {
            err.statusCode = err.statusCode || 400;
            throw err;
        }
    };

    getMoveHistory = async (req: Request, res: Response) => {
        const requestId = (req as any).requestId;
        try {
            const { id } = req.params;
            console.log(`[GameController:getMoveHistory] ${requestId} id=${id}`);
            const moves = await this.svc.getMoveHistory(id);
            res.json(moves);
        } catch (err: any) {
            err.statusCode = err.statusCode || 400;
            throw err;
        }
    };

    getPieces = async (req: Request, res: Response) => {
        const requestId = (req as any).requestId;
        try {
            const { id } = req.params;
            console.log(`[GameController:getPieces] ${requestId} id=${id}`);
            const pieces = await this.svc.getPieces(id);
            res.json(pieces);
        } catch (err: any) {
            err.statusCode = err.statusCode || 400;
            throw err;
        }
    };
}
