import { matchMaker } from "colyseus";
import { subscribeLobby } from "colyseus";
import { Room } from "colyseus";
import { Client } from "colyseus";
import { RoomListingData } from "colyseus/lib/matchmaker/drivers/Driver";

export interface FilterInput {
	name?: string;
	metadata?: any;
}

export interface LobbyOptions {
	filter?: FilterInput;
}

export class ExtendedLobbyRoom extends Room {
	public rooms: RoomListingData[] = [];
	public unsubscribeLobby: () => void;

	public clientOptions: { [sessionId: string]: LobbyOptions } = {};

	public async onCreate(options: any) {
		// prevent LobbyRoom to notify itself
		this.listing.unlisted = true;

		this.setState({});

		this.unsubscribeLobby = await subscribeLobby((roomId, data) => {
			const roomIndex = this.rooms.findIndex(
				(room) => room.roomId === roomId
			);

			if (!data) {
				// remove room listing data
				if (roomIndex !== -1) {
					const previousData = this.rooms[roomIndex];
					this.rooms.splice(roomIndex, 1);
				}
			} else if (roomIndex === -1) {
				// append room listing data
				this.rooms.push(data);
			} else {
				const previousData = this.rooms[roomIndex];
				// replace room listing data
				this.rooms[roomIndex] = data;
			}
		});

		this.rooms = await matchMaker.query({
			private: false,
			unlisted: false,
		});

		this.onMessage("filter", (client: Client, filter: FilterInput) => {
			this.clientOptions[client.sessionId].filter = filter;
			client.send(
				"rooms",
				this.filterItemsForClient(this.clientOptions[client.sessionId])
			);
		});

		this.onMessage("refreshRoomList", (client, message) => {
			client.send(
				"rooms",
				this.filterItemsForClient(this.clientOptions[client.sessionId])
			);
		});
	}

	public onJoin(client: Client, options: LobbyOptions) {
		this.clientOptions[client.sessionId] = options || {};
		client.send(
			"rooms",
			this.filterItemsForClient(this.clientOptions[client.sessionId])
		);
	}

	public onLeave(client: Client) {
		delete this.clientOptions[client.sessionId];
	}

	public onDispose() {
		if (this.unsubscribeLobby) {
			this.unsubscribeLobby();
		}
	}

	protected filterItemsForClient(options: LobbyOptions) {
		const filter = options.filter;

		return filter
			? this.rooms.filter((room) =>
					this.filterItemForClient(room, filter)
			  )
			: this.rooms;
	}

	protected filterItemForClient(
		room: RoomListingData,
		filter?: LobbyOptions["filter"]
	) {
		if (room.locked) {
			return false;
		}

		if (!filter) {
			return true;
		}

		if (filter.name !== room.name) {
			return false;
		}

		let isAllowed = true;

		if (filter.metadata) {
			for (const field in filter.metadata) {
				if (filter.metadata[field] === undefined) {
					continue;
				}

				if (field === "roomName") {
					const item = room.metadata[field].toLocaleLowerCase();
					const query = filter.metadata[field].toLocaleLowerCase();

					if (!item.includes(query)) {
						isAllowed = false;
						break;
					}
				} else if (field === "passwordProtected") {
					const roomIsProtected = room.metadata[field];
					const query = filter.metadata[field];

					// Query is false if we dont want to show password protected rooms
					if (roomIsProtected !== query) {
						isAllowed = false;
						break;
					}
				} else if (room.metadata[field] !== filter.metadata[field]) {
					isAllowed = false;
					break;
				}
			}
		}

		return isAllowed;
	}
}
