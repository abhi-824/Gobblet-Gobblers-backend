import { Router } from "express";
import { PrismaGameRepository } from "../storage/PrismaGameRepository";
import { PrismaPlayerRepository } from "../storage/PrismaPlayerRepository";
import { PrismaPieceRepository } from "../storage/PrismaPieceRepository";
import { PrismaBoardRepository } from "../storage/PrismaBoardRepository";
import { PrismaMoveRepository } from "../storage/PrismaMoveRepository";
import { BotStrategyFactory } from "../core/bot/BotStartegyFactory";
import { GameService } from "../services/GameService";
import { GameController } from "../controllers/GameController";

const gameRepo = new PrismaGameRepository();
const playerRepo = new PrismaPlayerRepository();
const pieceRepo = new PrismaPieceRepository();
const boardRepo = new PrismaBoardRepository();
const moveRepo = new PrismaMoveRepository();
const botFactory = BotStrategyFactory;

const service = new GameService(
  gameRepo,
  playerRepo,
  pieceRepo,
  boardRepo,
  moveRepo,
  botFactory
);
const controller = new GameController(service);

export const gameRouter = Router();

// Game Lifecycle
gameRouter.post("/", controller.createGame);
gameRouter.post("/:id/join", controller.joinGame);
gameRouter.post("/:id/start", controller.startGame);

// Gameplay
gameRouter.get("/:id", controller.getGameState);
gameRouter.post("/:id/moves", controller.makeMove);
gameRouter.get("/:id/moves", controller.getMoveHistory);
gameRouter.get("/:id/pieces", controller.getPieces);
