import React from "react";
import { Redirect } from "react-router-dom";
import ILobbyInfo from "./structures/ILobbyInfo";
import HeaderBar from "./components/HeaderBar";
import styles from "./MatchLobby.module.css";
import stylesB from "./Base.module.css";
import stylesH from "./components/HeaderBar.module.css";
import MatchLobbySettings from "./components/MatchLobbySettings";
import MatchLobbyPlayers from "./components/MatchLobbyPlayers";
import MatchLobbyOverview from "./components/MatchOverview";
import TabSelection from "./components/TabSelection";
import { Room } from "colyseus.js";
import UserSingleton from "./config/UserSingleton";
import { FullscreenErrorOverlay } from "./components/FullscreenErrorOverlay";
import GameScreen from "./GameScreen";
import { RootState } from "stateofthecards-gamelib";

interface IProps {}

enum MatchLobbyState {
	Idle,
	Playing,
	Finished,
	RedirectServerList,
}

enum Tab {
	Overview,
	Invite,
	Settings,
}

interface IState {
	currentState?: MatchLobbyState;
	lobbyInfo?: ILobbyInfo;
	currentTab?: Tab;
	isHost: boolean;
	errorMessage?: string;
	gameState?: RootState;
}

class MatchLobby extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			currentState: MatchLobbyState.Idle,
			currentTab: Tab.Overview,
			isHost: false,
		};
	}

	componentDidMount() {
		const search = window.location.search;
		const params = new URLSearchParams(search);
		const lobbyId = params.get("id");

		if (!UserSingleton.getInstance().getUserInfo().currentRoom && lobbyId) {
			UserSingleton.getInstance()
				.getUserInfo()
				.colyseusClient?.joinById(lobbyId, {
					playerInfo: {
						firebaseUID: UserSingleton.getInstance().getUserInfo()
							.firebaseUser?.uid,
						username: UserSingleton.getInstance().getUserInfo()
							.displayName,
					},
				})
				.then((room: Room<any>) => {
					this.setRoomListeners(room);
				})
				.catch((e) => {
					this.setState({ errorMessage: "Info: " + e.message });
				});
		} else if (!lobbyId) {
			this.setState({ errorMessage: "Info: Failed to find match!" });
		}

		this.setState({
			currentState: MatchLobbyState.Idle,
			currentTab: Tab.Overview,
			isHost: true,
		});

		let currentRoom = UserSingleton.getInstance().getUserInfo().currentRoom;
		if (currentRoom) this.setRoomListeners(currentRoom);
	}

	setRoomListeners(room: Room<any>) {
		UserSingleton.getInstance().setUserInfo({
			currentRoom: room,
		});

		room.onStateChange(() => {
			this.setState({
				isHost: UserSingleton.getInstance().checkIsRoomHost(),
			});
			this.forceUpdate();
		});

		room.onMessage("kick", (message) => {
			this.setState({
				errorMessage: "Info: " + message.message,
			});
		});

		room.onMessage("startMatch", (message) => {
			this.setState({
				currentState: MatchLobbyState.Playing,
				gameState: message.gameState,
			});
		});

		room.onMessage("newState", (message) => {
			this.setState({
				gameState: message,
			});
		});

		room.onMessage("updateGameInfo", (message) => {
			const lobbyInfo = this.state.lobbyInfo;
			if (lobbyInfo != null) {
				lobbyInfo.gameInfo = message;
			}
		});
	}

	switchTab(index: number) {
		if (index === 0) {
			this.setState({ currentTab: Tab.Overview });
		} else if (index === 1) {
			this.setState({ currentTab: Tab.Invite });
		} else if (index === 2) {
			this.setState({ currentTab: Tab.Settings });
		}
	}

	render() {
		switch (this.state.currentState) {
			case MatchLobbyState.Playing:
				return (
					<GameScreen gameState={this.state.gameState!}></GameScreen>
				);
			case MatchLobbyState.Idle:
				return this.renderLobby();
			case MatchLobbyState.RedirectServerList:
				return <Redirect to="/servers"></Redirect>;
		}
	}

	renderLobby() {
		let showErrorMessage = this.state.errorMessage ? true : false;

		return (
			<div className={styles.wrapper}>
				<FullscreenErrorOverlay
					message={this.state.errorMessage}
					buttonText="Return to Server List"
					onClickButton={() => {
						this.setState({
							currentState: MatchLobbyState.RedirectServerList,
						});
					}}
					isVisible={showErrorMessage}
				></FullscreenErrorOverlay>

				<HeaderBar>
					<div className={stylesB.buttonWrapper}>
						<button
							className={
								stylesB.buttonBase +
								" " +
								stylesB.buttonFilledTertiary
							}
							onClick={() => {
								UserSingleton.getInstance()
									.getUserInfo()
									.currentRoom?.leave();
								this.setState({
									currentState:
										MatchLobbyState.RedirectServerList,
								});
							}}
						>
							Back
						</button>
					</div>

					<div className={styles.infoWrapper}>
						<p className={stylesH.headerTextLarge}>
							{
								UserSingleton.getInstance().getUserInfo()
									.currentRoom?.state.roomName
							}
						</p>
					</div>

					<TabSelection
						onButtonClicked={(i) => this.switchTab(i)}
						buttons={
							this.state.isHost
								? ["Overview", "Invite", "Settings"]
								: ["Overview", "Invite"]
						}
						cssClass={styles.navButtons}
						cssButtonWrapperClass={stylesB.buttonWrapper}
						cssButtonActiveClass={
							stylesB.buttonBase +
							" " +
							stylesB.buttonFilledPrimary
						}
						cssButtonInactiveClass={
							stylesB.buttonBase +
							" " +
							stylesB.buttonFilledSecondary
						}
					/>
				</HeaderBar>

				<div className={stylesB.background + " " + styles.tabContent}>
					{this.renderTab()}
				</div>
			</div>
		);
	}

	renderTab() {
		const room = UserSingleton.getInstance().getUserInfo().currentRoom;

		switch (this.state.currentTab) {
			case Tab.Overview:
				if (room) {
					return <MatchLobbyOverview room={room} />;
				} else {
					return <div />;
				}
			case Tab.Invite:
				return <MatchLobbyPlayers />;
			case Tab.Settings:
				return <MatchLobbySettings />;
		}
	}
}

export default MatchLobby;
