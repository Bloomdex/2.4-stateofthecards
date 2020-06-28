import { Room, Client, updateLobby } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";
import FirebaseApp from "./Firebase";
import createGame, { RootState, Action } from "stateofthecards-gamelib";
import GameRules from "stateofthecards-gamelib/dist/src/GameRules";
import { Card } from "stateofthecards-gamelib/dist/src/Card";
import { ActionType } from "stateofthecards-gamelib/dist/src/state/actions";

// region State Schemas

enum PlayState {
	Lobby,
	Playing,
	Finished,
}

const convertObjectToArray = <T>(obj: Record<number, T>): Array<T> => {
	const retVal = Object.keys(obj).map(
		(index) => obj[(index as unknown) as number]
	);
	return retVal;
};

class Player extends Schema {
	@type("string")
	firebaseUID: string;
	@type("string")
	username: string;
}

class GameInfo extends Schema {
	@type("string")
	identifier: string;
	@type("number")
	minPlayers: number;
	@type("number")
	maxPlayers: number;
	@type("string")
	name: string;
	@type("string")
	description: string;
	@type("string")
	cardLogo: string;
	@type("string")
	color: string;
	@type("string")
	author: string;
}

class State extends Schema {
	@type("string")
	roomName: string;
	@type("string")
	roomPassword: string;
	@type({ map: Player })
	players = new MapSchema<Player>();
	@type("string")
	hostPlayer: string;
	@type(GameInfo)
	gameInfo: GameInfo;
	@type("number")
	playState: PlayState;
	@type({ map: "number" })
	playerIndices = new MapSchema<number>();
}

// endregion

export class GameRoom extends Room<State> {
	gameStore?: ReturnType<typeof createGame>;
	matchStarting: boolean = false;

	onCreate(options: any) {
		// region Lobby Messages

		// Set a name
		this.onMessage("setRoomName", (client, message) => {
			if (this.state.playState === PlayState.Lobby) {
				// Check if the player sending this command is the host.
				if (client.sessionId !== this.state.hostPlayer) return;

				let newName = message;
				if (newName.length > 40) newName = message.substring(0, 40);

				this.setRoomName(newName);
				updateLobby(this);
			} else {
				client.error(
					8999,
					`Failed to set room name, invalid PlayState.`
				);
			}
		});

		// Set a password
		this.onMessage("setRoomPassword", (client, message) => {
			if (this.state.playState === PlayState.Lobby) {
				// Check if the player sending this command is the host.
				if (client.sessionId !== this.state.hostPlayer) return;

				const newPassword = message;
				if (newPassword.length > 0 && newPassword.length <= 64)
					this.setRoomPassword(newPassword);
				else this.clearRoomPassword();

				updateLobby(this);
			} else {
				client.error(
					9000,
					`Failed to set room password, invalid PlayState.`
				);
			}
		});

		// Set a game
		this.onMessage("setGame", (client, message) => {
			if (this.state.playState === PlayState.Lobby) {
				// Check if the player sending this command is the host.
				if (client.sessionId !== this.state.hostPlayer) return;

				if (!this.setGame(message))
					client.error(9001, `Failed to set game to: ${message}`);
			} else {
				client.error(
					9001,
					`Failed to set game to: ${message}, invalid PlayState.`
				);
			}
		});

		// Kick a client
		this.onMessage("kickClient", (client, message) => {
			if (this.state.playState === PlayState.Lobby) {
				// Check if the player sending this command is the host.
				if (client.sessionId !== this.state.hostPlayer) return;

				this.kickClient(message);
			} else {
				client.error(9001, `Failed to kick player, invalid PlayState.`);
			}
		});

		// Start a match
		this.onMessage("startMatch", (client, message) => {
			// Check if the player sending this command is the host.
			if (client.sessionId !== this.state.hostPlayer) return;

			if (
				this.state.playState === PlayState.Lobby &&
				!this.matchStarting
			) {
				this.matchStarting = true;
				this.startMatch()

					.catch((error) => client.error(8997, error))
					.finally(() => {
						this.matchStarting = false;
					});
			} else {
				client.error(8998, `Failed to start match, invalid PlayState.`);
			}
		});

		// endregion

		// region Playing Messages

		this.onMessage("performAction", (client, message) => {
			try {
				this.performAction(client, message);
			} catch (error) {
				console.error(error);
				this.disconnect();
			}
		});

		// endregion

		// Initialization
		this.setState(new State());
		this.state.playState = PlayState.Lobby;
		this.setMetadata({ maxClients: "∞", passwordProtected: false });
		this.setRoomName("My New Room");
		this.setGame("ifionfoianeofnaoeinf");

		updateLobby(this);
	}

	// region Lobby - methods

	setRoomName(name: string) {
		this.setMetadata({ roomName: name });
		this.state.roomName = name;
	}

	setRoomPassword(password: string) {
		this.setMetadata({ passwordProtected: true });
		this.state.roomPassword = password;
	}

	clearRoomPassword() {
		this.setMetadata({ passwordProtected: false });
		this.state.roomPassword = "";
	}

	kickClient(sessionId: string) {
		this.clients.forEach((client) => {
			if (client.sessionId == sessionId) {
				client.send("kick", {
					message: "You've been kicked by the host.",
				});
				client.leave();
			}
		});
	}

	setGame(gameIdentifier: string): boolean {
		FirebaseApp.database()
			.ref("/games/" + gameIdentifier)
			.once("value")
			.then((snapshot) => {
				if (snapshot.val()) {
					/*
					We know this is uglier than using a spread operator
					but unfortunately the GameInfo state is a schema.
				
    	Sincerely yours, annoyed programmers.
					*/
					this.state.gameInfo = new GameInfo();
					this.state.gameInfo.identifier = gameIdentifier;
					this.state.gameInfo.minPlayers = snapshot.val().minPlayers;
					this.state.gameInfo.maxPlayers = snapshot.val().maxPlayers;
					this.state.gameInfo.name = snapshot.val().name;
					this.state.gameInfo.description = snapshot.val().description;
					this.state.gameInfo.cardLogo = snapshot.val().cardLogo;
					this.state.gameInfo.color = snapshot.val().color;
					this.state.gameInfo.author = snapshot.val().author;

					this.setMetadata({ gameName: snapshot.val().name });
					this.setMetadata({ maxClients: snapshot.val().maxPlayers });
					this.maxClients = snapshot.val().maxPlayers;
					updateLobby(this);

					this.broadcast("updateGameInfo", this.state.gameInfo);
				} else {
					throw new Error(`Could not find /games/${gameIdentifier}`);
				}
			})
			.catch((error) => {
				console.error(error);
				return false;
			});

		return true;
	}

	// endregion

	// region Playing - Methods

	async startMatch() {
		if (
			Object.keys(this.state.players).length >=
			this.state.gameInfo.minPlayers
		) {
			const snapshot = await FirebaseApp.database()
				.ref("/gameRules/" + this.state.gameInfo.identifier)
				.once("value");

			if (!snapshot.val()) {
				throw new Error(
					`Could not find /games/${this.state.gameInfo.identifier}`
				);
			}

			this.state.playState = PlayState.Playing;

			// Hide this game from the Server List
			//  And stop clients from reconnecting
			this.lock();
			updateLobby(this);

			// HIER WHEBBEN WE DE ATAATA
			const gameRules: GameRules = snapshot.val();

			gameRules.cards = convertObjectToArray(gameRules.cards);
			for (const card of gameRules.cards) {
				if (card.effects != null) {
					card.effects = convertObjectToArray(card.effects);
				}
				card.tags = convertObjectToArray(card.tags);
				if (card.options != null) {
					Object.keys(card.options).forEach((key) => {
						card.options[key].choices = convertObjectToArray(
							card.options[key].choices
						);
					});
				}
			}

			// Start the gamelib
			this.gameStore = createGame({
				gameRules,
				players: Object.keys(this.state.players).length,
				seed: Math.random().toString(36).substring(10),
			});

			const playerIndices: Record<string, number> = {};
			Object.keys(this.state.players).forEach((playerId, index) => {
				playerIndices[playerId] = index;
				this.state.playerIndices[playerId] = index;
			});

			this.broadcast("startMatch", {
				game: this.state.gameInfo,
				gameState: this.gameStore.getState(),
				playerIndices,
			});
		} else {
			throw new Error("Not enough players!");
		}
	}

	isActionValid(client: Client, action: Action): boolean {
		if (
			this.state.playerIndices[client.sessionId] !==
			this.gameStore.getState().turnInfo.current
		) {
			return false;
		}

		return true;
	}

	performAction(client: Client, action: Action) {
		if (this.isActionValid(client, action)) {
			// convert here
			if (action.type === ActionType.PlayCard) {
				if (action.payload.effects != null) {
					action.payload.effects = convertObjectToArray(
						action.payload.effects
					);
				}
				action.payload.tags = convertObjectToArray(action.payload.tags);
				if (action.payload.options != null) {
					Object.keys(action.payload.options).forEach((key) => {
						action.payload.options[
							key
						].choices = convertObjectToArray(
							action.payload.options[key].choices
						);
					});
				}
			}
			console.log(`DISPATHING ACTION ${action}`);
			this.gameStore.dispatch(action);

			this.broadcast("newState", this.gameStore.getState());
		} else {
			client.error(
				8995,
				"Client sent invalid action, out of sync? Re-sending current gameState to player now..."
			);
			client.send("currentGameState", this.gameStore.getState());
		}
	}

	endMatch(winner: Player): boolean {
		this.state.playState = PlayState.Finished;

		this.broadcast("endMatch", { winner: winner });

		return true;
	}

	// endregion

	onJoin(client: Client, options: any) {
		// check if password matches that of the room
		if (
			options.password !== this.state.roomPassword &&
			this.state.roomPassword !== ""
		) {
			throw new Error("Password does not match!");
		}

		// check if the player is already present in the room
		for (let key in this.state.players) {
			if (
				this.state.players[key].firebaseUID ===
				options.playerInfo.firebaseUID
			) {
				throw new Error("You are already present in this match!");
			}
		}

		// map the player to all players in this room
		const player: Player = new Player();
		player.username = options.playerInfo.username;
		player.firebaseUID = options.playerInfo.firebaseUID;

		const playerListLength = Object.keys(this.state.players).length;

		if (playerListLength <= 0) {
			this.state.hostPlayer = client.sessionId;
			this.setMetadata({ hostFirebaseUID: player.firebaseUID });
		}

		this.state.players[client.sessionId] = player;
		client.send("updateGameInfo", this.state.gameInfo);
	}

	onLeave(client: Client, consented: boolean) {
		// Remove this client from the list.
		delete this.state.players[client.sessionId];

		// If the host left, change the host to the first player in the player-list.
		let otherSessionKeys = Object.keys(this.state.players);
		if (
			client.sessionId === this.state.hostPlayer &&
			otherSessionKeys.length > 0
		) {
			this.state.hostPlayer = otherSessionKeys[0];
			this.setMetadata({
				hostFirebaseUID: this.state.players[this.state.hostPlayer]
					.firebaseUID,
			});
		}
	}

	onDispose() {}
}
