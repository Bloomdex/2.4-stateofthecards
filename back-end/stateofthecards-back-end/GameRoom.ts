import { Room, Client, updateLobby } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";

class Player extends Schema {
	@type("string")
	firebaseUID: string;
	@type("string")
	username: string;
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
}

const error_code_password = 1;
const error_code_player = 2;

export class GameRoom extends Room<State> {
	onCreate(options: any) {
		this.setState(new State());
		this.setRoomName("My New Room");

		this.onMessage("setRoomName", (client, message) => {
			// Check if the player sending this command is the host.
			if (client.sessionId !== this.state.hostPlayer) return;

			let newName = message;
			if (newName.length > 40) newName = message.substring(0, 40);

			this.setRoomName(newName);
			updateLobby(this);
		});

		this.onMessage("setRoomPassword", (client, message) => {
			// Check if the player sending this command is the host.
			if (client.sessionId !== this.state.hostPlayer) return;

			let newPassword = message;
			if (newPassword.length > 0 && newPassword.length <= 64) {
				this.setMetadata({ passwordProtected: true });
				this.state.roomPassword = message;
			} else {
				this.setMetadata({ passwordProtected: false });
				this.state.roomPassword = "";
			}

			updateLobby(this);
		});

		updateLobby(this);
	}

	setRoomName(name: string) {
		this.setMetadata({ roomName: name });
		this.state.roomName = name;
	}

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
		}

		this.state.players[client.sessionId] = player;
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
		}
	}

	onDispose() {}
}
