import React, { useRef } from "react";
import styles from "./BasicListEntry.module.css";
import UserSingleton from "../config/UserSingleton";
import FirebaseApp from "../config/Firebase";

interface IProps {
	sessionId: string;
	firebaseUid: string;
	playerName: string;
	disableKick?: boolean;
}

interface IState {
	iconUrl: string;
	showAddIcon: boolean;
	showRemoveIcon: boolean;
}

class MatchPlayerListEntry extends React.Component<IProps, IState> {
	_isMounted: boolean;

	constructor(props: IProps) {
		super(props);

		this.state = {
			iconUrl: "icons/full-match-icon.svg",
			showAddIcon: false,
			showRemoveIcon: false,
		};

		this._isMounted = false;
	}

	componentDidMount() {
		this._isMounted = true;

		this.fetchIcon();
		this.fetchAvailableActions();

		const room = UserSingleton.getInstance().getUserInfo().currentRoom;

		if (room) {
			room.onStateChange(() => {
				this.fetchIcon();
				this.fetchAvailableActions();
				this.forceUpdate();
			});
		}
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	render() {
		const addButton = this.state.showAddIcon ? (
			<img
				src={"icons/add-friends-icon.svg"}
				className={styles.icon}
				alt="Add as friend"
				onClick={() => {
					this.addAsFriendAction();
				}}
			></img>
		) : (
			""
		);
		const removeButton =
			this.state.showRemoveIcon && !this.props.disableKick ? (
				<img
					src={"icons/remove-icon.svg"}
					className={styles.icon}
					alt="Kick from lobby"
					onClick={() => {
						this.kickAction();
					}}
				></img>
			) : (
				""
			);

		return (
			<div className={styles.entry}>
				<div className={styles.leftInfo}>
					<img src={this.state.iconUrl} alt="" />
					<p>{this.props.playerName}</p>
				</div>

				<div className={styles.rightInfo + " " + styles.unselectable}>
					{addButton}
					{removeButton}
				</div>
			</div>
		);
	}

	fetchIcon() {
		// determine the player icon
		if (
			this.props.sessionId ===
			UserSingleton.getInstance().getUserInfo().currentRoom?.state
				.hostPlayer
		) {
			this.setState({ iconUrl: "icons/crown-icon.svg" });
		} else {
			UserSingleton.getInstance()
				?.getFriendship(this.props.firebaseUid)
				.then((data) => {
					if (!this._isMounted) return;

					if (data && data.status === "accepted") {
						this.setState({ iconUrl: "icons/friends-icon.svg" });
					} else {
						this.setState({ iconUrl: "icons/full-match-icon.svg" });
					}
				});
		}
	}

	fetchAvailableActions() {
		// determine the add and remove icons
		if (
			this.props.sessionId ===
			UserSingleton.getInstance().getUserInfo().currentRoom?.sessionId
		) {
			this.setState({ showRemoveIcon: false });
			this.setState({ showAddIcon: false });
		} else {
			/*
				Add friend icon
				Check if this entry is a friend of
				the currentauthenticated user
			*/
			UserSingleton.getInstance()
				?.getFriendship(this.props.firebaseUid)
				.then((data) => {
					if (!this._isMounted) return;

					if (data && data.status === "accepted") {
						// The authenticated user and this player are friends
						this.setState({ showAddIcon: false });
					} else if (data && data.status === "pending") {
						// Check if the authenticated user already sent a friend request
						const userId = UserSingleton.getInstance().getUserInfo()
							.firebaseUser?.uid;

						if (data.recipientId === userId) {
							this.setState({ showAddIcon: true });
						} else {
							this.setState({ showAddIcon: false });

							/*
								Subscribe to the document so the correcticon is fetched
								in case they suddenly become friends
							*/
							FirebaseApp.database()
								.ref("friends/" + data.key)
								.on("value", (snapshot) => {
									if (!this._isMounted) this.fetchIcon();
								});
						}
					} else {
						// The authenticated user and this player are not friends
						this.setState({ showAddIcon: true });
					}
				});

			// Kick icon
			if (UserSingleton.getInstance().checkIsRoomHost()) {
				this.setState({ showRemoveIcon: true });
			} else {
				this.setState({ showRemoveIcon: false });
			}
		}
	}

	async getIcon(key: string): Promise<string | undefined> {
		let url;

		await UserSingleton.getInstance()
			?.getFriendship(key)
			.then((data) => {
				if (!this._isMounted) return;

				if (data && data.status === "accepted") {
					url = "icons/friend-icon.svg";
				}
			});

		return await url;
	}

	addAsFriendAction() {
		UserSingleton.getInstance()
			?.getFriendship(this.props.firebaseUid)
			.then((data) => {
				if (!this._isMounted) return;

				const userId = UserSingleton.getInstance().getUserInfo()
					.firebaseUser?.uid;

				if (!data) {
					// Create a new document
					FirebaseApp.database()
						.ref("friends/" + userId + this.props.firebaseUid)
						.set(
							{
								requestorId: userId,
								recipientId: this.props.firebaseUid,
								status: "pending",
							},
							() => {
								this.setState({ showAddIcon: false });
								this.fetchIcon();
							}
						);

					FirebaseApp.database()
						.ref("users/" + userId + "/friends")
						.push({ friendId: userId + this.props.firebaseUid });

					FirebaseApp.database()
						.ref("friends/" + userId + this.props.firebaseUid)
						.on("value", (snapshot) => {
							this.fetchIcon();
						});
				} else {
					// Update the past document
					FirebaseApp.database()
						.ref("friends/" + data.key)
						.update({ status: "accepted" }, () => {
							this.setState({ showAddIcon: false });
							this.fetchIcon();
						});

					FirebaseApp.database()
						.ref("users/" + userId + "/friends")
						.push({ friendId: data.key });
				}
			});
	}

	kickAction() {
		// Ask the server to kick a client using the sessionId
		UserSingleton.getInstance()
			?.getUserInfo()
			?.currentRoom?.send("kickClient", this.props.sessionId);
	}
}

export default MatchPlayerListEntry;
