// Temporary interface that contains info about
//  the game that is going to be played.
interface IGameInfo {
	minPlayers: number;
	maxPlayers: number;
	name: string;
	description: string;
	cardLogo: URL;
	color: string;
}

export default IGameInfo;
