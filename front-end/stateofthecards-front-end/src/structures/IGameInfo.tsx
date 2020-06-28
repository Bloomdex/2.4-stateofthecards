// Temporary interface that contains info about
//  the game that is going to be played.
interface IGameInfo {
	identifier: string;
	minPlayers: number;
	maxPlayers: number;
	name: string;
	description: string;
	cardLogo: string;
	color: string;
	author: string;
}

export default IGameInfo;
