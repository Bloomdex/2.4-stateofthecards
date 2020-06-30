import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { monitor } from "@colyseus/monitor";
// import socialRoutes from "@colyseus/social/express"

import { GameRoom } from "./GameRoom";
import { ExtendedLobbyRoom } from "./ExtendedLobbyRoom";
import { QuickGameRoom } from "./QuickGameRoom";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({
	server,
});

// register your room handlers
gameServer.define("lobby_room", ExtendedLobbyRoom);
gameServer.define("game_room", GameRoom).enableRealtimeListing();
gameServer.define("quick_game_room", QuickGameRoom).enableRealtimeListing();

/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/authentication/)
 * - also uncomment the import statement
 */
// app.use("/", socialRoutes);

// register colyseus monitor
app.use("/colyseus", monitor());

// start game server
gameServer.listen(port);
console.log("Colyseus is now running.");
