import IUserInfo from "../structures/IUserInfo";
import FirebaseApp from "./Firebase";

export default class UserSingleton {
	private static _instance: UserSingleton;

	_userInfo: IUserInfo;

	public static getInstance(): UserSingleton {
		if (UserSingleton._instance == null) {
			UserSingleton._instance = new UserSingleton();
		}
		return this._instance;
	}

	constructor() {
		if (UserSingleton._instance) {
			throw new Error(
				"Error: Instantiation failed: Use SingletonClass.getInstance() instead of new."
			);
		}

		this._userInfo = {
			firebaseUser: undefined,
			email: undefined,
			displayName: undefined,
		};
	}

	getUserInfo(): IUserInfo {
		return this._userInfo;
	}

	setUserInfo(info: IUserInfo) {
		this._userInfo = { ...this._userInfo, ...info };
	}

	checkIsRoomHost(): boolean {
		return (
			this._userInfo.currentRoom?.state.hostPlayer ===
			this._userInfo.currentRoom?.sessionId
		);
	}

	async getFriendship(toCheckUid: string): Promise<any> {
		/*
			returns undefined if there is no friendship.
			returns an object with the status if there is a friendship.
		*/
		const callerUid = this._userInfo.firebaseUser?.uid;

		const refOne = FirebaseApp.database().ref(
			"friends/" + callerUid + toCheckUid
		);
		const refTwo = FirebaseApp.database().ref(
			"friends/" + toCheckUid + callerUid
		);

		let friendshipStatus;

		await refOne.once("value", (snapshot) => {
			if (snapshot.exists()) {
				friendshipStatus = {
					key: callerUid + toCheckUid,
					...snapshot.val(),
				};
			}
		});

		await refTwo.once("value", (snapshot) => {
			if (snapshot.exists()) {
				friendshipStatus = {
					key: toCheckUid + callerUid,
					...snapshot.val(),
				};
			}
		});

		return await friendshipStatus;
	}
}
