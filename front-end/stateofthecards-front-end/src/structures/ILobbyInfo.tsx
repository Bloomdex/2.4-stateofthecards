import IGameInfo from "./IGameInfo";

interface ILobbyInfo {
	// Lobby ID
	lobbyId: string;

	// Name of the lobby
	lobbyName: string;

	// If this lobby is password protected,
	passwordProtected: boolean;

	// The current players connected to the lobby
	players: string[];

	// The id of the game so it can
	//  be fetched by the user.
	gameInfo: IGameInfo;
}

export default ILobbyInfo;
