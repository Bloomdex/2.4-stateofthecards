import { GameRoom } from "./GameRoom";
import { Client } from "colyseus";

export class QuickGameRoom extends GameRoom {
	onJoin(client: Client, options: any) {
		super.onJoin(client, options);

		if (
			this.state.gameInfo &&
			Object.keys(this.state.players).length ===
				this.state.gameInfo.maxPlayers
		) {
			this.startMatch();
		}
	}
}
