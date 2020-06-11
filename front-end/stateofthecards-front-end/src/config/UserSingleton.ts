import firebase from "firebase";

type userInfo = {
	firebaseUser?: firebase.User;
	username?: string;
};

export default class UserSingleton {
	private static _instance: UserSingleton;

	_userInfo: userInfo;

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

		this._userInfo = { firebaseUser: undefined, username: undefined };
	}

	getUserInfo(): userInfo {
		return this._userInfo;
	}

	setUserInfo(info: userInfo) {
		this._userInfo = { ...info };
	}
}
