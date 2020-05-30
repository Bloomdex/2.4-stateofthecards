import IGameInfo from "./IGameInfo";

interface ILobbyInfo {
	// Lobby ID
	lobbyId: number;

	// Name of the lobby
	lobbyName: string;

	// If this lobby is password protected,
	passwordProtected: boolean;

	// The current players connected to the lobby
	//  Should not use string-type in the future.
	//  so that a player can press on a different,
	//  player to show info.
	players: string[];

	// The id of the game so it can
	//  be fetched by the user.
	gameInfo: IGameInfo;

	// Should be an enum similar to:
	//  Waiting, Preparing, Post
	state: string;
}

export default ILobbyInfo;
