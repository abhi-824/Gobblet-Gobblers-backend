import { Game } from "./core/models/Game.ts";
import { Player } from "./core/models/Player.ts";
import { Board } from "./core/models/Board.ts";
import { GamePiece } from "./core/models/GamePiece.ts";
import { BotDifficulty } from "./core/types/BotDifficulty.ts";
import { BotStrategyFactory } from "./core/bot/BotStartegyFactory.ts";
import { PieceSize } from "./core/types/PieceSize.ts";
import { Move } from "./core/models/Move.ts";
import promptSync from "prompt-sync";
const prompt = promptSync();

console.log("Starting game...");

// Create players
const human = new Player("p1", "human");
const bot = new Player("p2", "computer");

console.log("Creating players...");

// Give 2 pieces of each size to both
([PieceSize.SM, PieceSize.MD, PieceSize.LG]).forEach((size: PieceSize) => {
    human.addPiece(new GamePiece(size, human));
    human.addPiece(new GamePiece(size, human));
    bot.addPiece(new GamePiece(size, bot));
    bot.addPiece(new GamePiece(size, bot));
});

console.log("Creating game...");

const game = new Game(new Board(), [human, bot], human);

console.log("Creating bot strategy...");

const botStrategy = BotStrategyFactory.create(BotDifficulty.EASY);

console.log("Starting game loop...");
while (game.status === "in_progress") {
    console.log("Current player:", game.currentPlayer.type);

    if (game.currentPlayer.type === "computer") {
        const move = botStrategy.decideMove(game, bot);
        game.makeMove(move);
        console.log("Bot played:", move);
    } else {
        console.log("Your move (row, col) → 0-indexed");
        console.log("Your available pieces:");
        human.getAvailablePieces().forEach((p, i) => {
            console.log(`[${i}] ${p.size}`);
        });

        // Ask which piece to use
        const pieceIndex = Number(prompt("Choose a piece index to play: "));
        const piece = human.getAvailablePieces()[pieceIndex];

        if (!piece) {
            console.log("❌ Invalid piece index. Try again.");
            continue;
        }

        // Ask for position
        const row = Number(prompt("Enter row (0-2): "));
        const col = Number(prompt("Enter column (0-2): "));

        // Validate row/col
        if (row < 0 || row > 2 || col < 0 || col > 2) {
            console.log("❌ Invalid board position. Try again.");
            continue;
        }

        const move = new Move(human, null, [row, col], piece);


        if (!piece) {
            console.log("No pieces left for human.");
            break;
        }



        if (game.makeMove(move)) {
            console.log(`Human played at (${row}, ${col}) with size ${piece.size}`);
        } else {
            console.log("Invalid move, try again");
            continue;
        }
    }

    printBoard(game);
    console.log(`Human pieces left: ${human.getAvailablePieces().length}`);
    console.log(`Computer pieces left: ${bot.getAvailablePieces().length}`);
}



function printBoard(game: Game) {
    const board = game.board;
    console.log("\nCurrent Board State:");
    for (let row = 0; row < 3; row++) {
        const rowStr = board.grid[row].map((cell) => {
            const top = cell.top();
            if (!top) return " . ";
            const symbol = top.owner.type === "human" ? "H" : "C";
            const size = top.size.toString().toUpperCase(); // sm → S, md → M, lg → L
            return ` ${symbol}${size} `;
        }).join("|");
        console.log(rowStr);
    }
    console.log();
}
