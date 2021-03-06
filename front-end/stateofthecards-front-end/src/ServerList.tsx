import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import styles from "./ServerList.module.css";
import stylesB from "./Base.module.css";
import ServerListEntry from "./components/ServerListEntry";
import HeaderBar from "./components/HeaderBar";
import UserSingleton from "./config/UserSingleton";
import { RoomAvailable, Room } from "colyseus.js";
import FullscreenMessageOverlay from "./components/FullscreenMessageOverlay";
import FirebaseApp from "./config/Firebase";
import FullscreenInputOverlay from "./components/FullscreenInputOverlay";

enum ServerListState {
	Idle,
	RedirectDashboard,
	RedirectGame,
}

interface IProps {}

interface IState {
	currentState: ServerListState;
	lobby?: any;
	games: RoomAvailable<any>[];
	filter: object;
	showFriendsOnly: boolean;
	friends: string[];
	showUnlockedOnly: boolean;
	errorMessage?: string;
	errorRoomId?: string;
}

class ServerList extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			currentState: ServerListState.Idle,
			games: [],
			filter: { roomName: undefined, passwordProtected: undefined },
			showFriendsOnly: false,
			friends: [],
			showUnlockedOnly: false,
			errorMessage: undefined,
			errorRoomId: undefined,
		};
	}

	componentDidMount() {
		this.joinLobby();
	}

	componentWillUnmount() {
		this.state.lobby?.leave();
	}

	async joinLobby() {
		// get the lobby
		this.setState(
			{
				lobby: await UserSingleton.getInstance()
					?.getUserInfo()
					?.colyseusClient?.joinOrCreate("lobby_room"),
			},
			() => {
				this.state.lobby?.send("filter", {
					name: "game_room",
					metadata: this.state.filter,
				});

				this.state.lobby?.onMessage(
					"rooms",
					(rooms: RoomAvailable<any>[]) => {
						this.setState({ games: rooms });
					}
				);
			}
		);
	}

	joinGame(roomId: string, password: string) {
		UserSingleton.getInstance()
			.getUserInfo()
			.colyseusClient?.joinById(roomId, {
				password: password,
				playerInfo: {
					firebaseUID: UserSingleton.getInstance().getUserInfo()
						.firebaseUser?.uid,
					username: UserSingleton.getInstance().getUserInfo()
						.displayName,
				},
			})
			.then((room: Room<any>) => {
				UserSingleton.getInstance().setUserInfo({
					currentRoom: room,
				});

				this.setState({
					currentState: ServerListState.RedirectGame,
				});
			})
			.catch((error) => {
				this.setState({
					errorMessage: error.message,
					errorRoomId: roomId,
				});
			});
	}

	render() {
		switch (this.state.currentState) {
			case ServerListState.Idle:
				return this.renderServerList();
			case ServerListState.RedirectDashboard:
				return <Redirect to="/dashboard"></Redirect>;
			case ServerListState.RedirectGame:
				return (
					<Redirect
						to={
							"/match?id=" +
							UserSingleton.getInstance().getUserInfo()
								.currentRoom?.id
						}
					></Redirect>
				);
		}
	}

	renderServerList() {
		let showErrorMessage = this.state.errorMessage ? true : false;

		const isPasswordError =
			this.state.errorMessage === "Password does not match!"
				? true
				: false;

		/*
			Never gonna give you up
			Never gonna let you down
			Never gonna run around and desert you
			Never gonna make you cry
			Never gonna say goodbye
			Never gonna tell a lie and hurt you
		*/
		let fullScreenOverlay: JSX.Element = <div />;

		fullScreenOverlay = showErrorMessage ? (
			<FullscreenMessageOverlay
				message={this.state.errorMessage}
				buttonText="Back"
				onClickButton={() => {
					this.setState({
						errorMessage: undefined,
					});
				}}
				isVisible={showErrorMessage}
			></FullscreenMessageOverlay>
		) : (
			fullScreenOverlay
		);

		fullScreenOverlay = isPasswordError ? (
			<FullscreenInputOverlay
				message="Enter password:"
				buttonText="Join"
				onClickButton={(value) => {
					if (this.state.errorRoomId) {
						this.joinGame(this.state.errorRoomId, value); // We try and join with a password this time.
					}
				}}
				onClickBackButton={() => {
					this.setState({
						errorMessage: undefined,
						errorRoomId: undefined,
					});
				}}
				isVisible={showErrorMessage}
			></FullscreenInputOverlay>
		) : (
			fullScreenOverlay
		);

		let gamesFiltered = this.state.games;
		if (this.state.showFriendsOnly) {
			gamesFiltered = this.state.games.filter((value, index) => {
				for (let i = 0; i < this.state.friends.length; i++) {
					if (
						value.metadata.hostFirebaseUID === this.state.friends[i]
					) {
						return true;
					}
				}

				return false;
			});
		}

		return (
			<div
				className={
					stylesB.wrapper +
					" " +
					styles.wrapper +
					" " +
					stylesB.background
				}
			>
				{fullScreenOverlay}
				<HeaderBar>
					<div className={stylesB.buttonWrapper}>
						<button
							className={
								stylesB.buttonBase +
								" " +
								stylesB.buttonFilledTertiary
							}
							onClick={() => {
								this.setState({
									currentState:
										ServerListState.RedirectDashboard,
								});
							}}
						>
							Back
						</button>
					</div>
					<div className={styles.searchWrapper}>
						<input
							className={stylesB.input}
							type="text"
							name="Search"
							placeholder="Search"
							onChange={this.onSearchChange}
						></input>
						<div className={stylesB.buttonWrapper}>
							<button
								className={
									stylesB.buttonBase +
									" " +
									stylesB.buttonFilledPrimary
								}
								onClick={() => {
									this.state.lobby?.send("refreshRoomList");
								}}
							>
								Refresh
							</button>
						</div>
					</div>
				</HeaderBar>

				<div className={styles.filterWrapper}>
					<div>
						<input
							type="checkbox"
							checked={this.state.showFriendsOnly}
							onChange={this.handleFriendsCheckbox}
						/>
						<p>Friends only</p>
					</div>

					<div>
						<input
							type="checkbox"
							checked={this.state.showUnlockedOnly}
							onChange={this.handlePasswordCheckbox}
						/>
						<p>Hide password protected</p>
					</div>
				</div>

				<div className={styles.entries}>
					{gamesFiltered.map((value, index) => {
						let iconPath: string;

						if (value.metadata.passwordProtected)
							iconPath = "icons/lock-icon.svg";
						else iconPath = "icons/open-match-icon.svg";

						return (
							<ServerListEntry
								roomId={value.roomId}
								iconUrl={iconPath}
								key={index}
								serverName={value.metadata.roomName}
								gameName={value.metadata.gameName}
								playerCount={value.clients}
								maxPlayerCount={value.metadata.maxClients}
								onJoinPressed={(roomId) => {
									this.joinGame(roomId, ""); // We try to join without a password on press.
								}}
							/>
						);
					})}
				</div>
			</div>
		);
	}

	onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.value !== "") {
			this.setState(
				{
					filter: {
						...this.state.filter,
						roomName: event.target.value,
					},
				},
				() => {
					this.state.lobby?.send("filter", {
						name: "game_room",
						metadata: { ...this.state.filter },
					});
				}
			);
		} else {
			this.setState(
				{ filter: { ...this.state.filter, roomName: undefined } },
				() => {
					this.state.lobby?.send("filter", {
						name: "game_room",
						metadata: { ...this.state.filter },
					});
				}
			);
		}
	};

	handleFriendsCheckbox = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		let friends: string[] = [];

		// This first check is flipped because we haven't changed the state yet
		if (!this.state.showFriendsOnly) {
			const userId = UserSingleton.getInstance().getUserInfo()
				.firebaseUser?.uid;

			await FirebaseApp.database()
				.ref("users/" + userId + "/friends")
				.once("value", async (snapshot) => {
					let tempFriendsCollection: any[] = [];
					snapshot.forEach((childSnapshot) => {
						tempFriendsCollection.push(childSnapshot.val());
					});

					for (let i = 0; i < tempFriendsCollection.length; i++) {
						await FirebaseApp.database()
							.ref("friends/" + tempFriendsCollection[i].friendId)
							.once("value", (snapshot) => {
								const data = snapshot.val();

								if (data) {
									if (data.recipientId !== userId) {
										friends.push(data.recipientId);
									} else if (data.requestorId !== userId) {
										friends.push(data.requestorId);
									}
								}
							});
					}

					this.setState({
						showFriendsOnly: !this.state.showFriendsOnly,
						friends: friends,
					});
				});
		} else {
			this.setState({
				showFriendsOnly: !this.state.showFriendsOnly,
				friends: [],
			});
		}
	};

	handlePasswordCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState(
			{ showUnlockedOnly: !this.state.showUnlockedOnly },
			() => {
				if (this.state.showUnlockedOnly) {
					this.setState(
						{
							filter: {
								...this.state.filter,
								passwordProtected: false,
							},
						},
						() => {
							this.state.lobby?.send("filter", {
								name: "game_room",
								metadata: { ...this.state.filter },
							});
						}
					);
				} else {
					this.setState(
						{
							filter: {
								...this.state.filter,
								passwordProtected: undefined,
							},
						},
						() => {
							this.state.lobby?.send("filter", {
								name: "game_room",
								metadata: { ...this.state.filter },
							});
						}
					);
				}
			}
		);
	};
}

export default ServerList;
