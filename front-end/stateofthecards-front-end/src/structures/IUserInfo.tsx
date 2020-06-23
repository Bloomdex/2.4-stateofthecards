import Colyseus, { Room } from "colyseus.js";

interface IUserInfo {
	firebaseUser?: firebase.User;
	email?: string | null;
	displayName?: string | null;
	colyseusClient?: Colyseus.Client;
	currentRoom?: Room;
}

export default IUserInfo;
