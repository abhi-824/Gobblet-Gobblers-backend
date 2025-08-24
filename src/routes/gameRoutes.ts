import { Router } from "express";
import { InMemoryBoardRepository, InMemoryMoveRepository, InMemoryGameRepository, InMemoryPieceRepository, InMemoryPlayerRepository } from "../storage/inmemory";
import { BotStrategyFactory } from "../core/bot/BotStartegyFactory";
import { GameService } from "../services/GameService";
import { GameController } from "../controllers/GameController";

const gameRepo = new InMemoryGameRepository();
const playerRepo = new InMemoryPlayerRepository();
const pieceRepo = new InMemoryPieceRepository();
const boardRepo = new InMemoryBoardRepository();
const moveRepo = new InMemoryMoveRepository();
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
