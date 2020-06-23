import firebase from "firebase";
import IUserInfo from "../structures/IUserInfo";
import { Room } from "colyseus.js";

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
}
