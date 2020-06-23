import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import styles from "./ServerList.module.css";
import stylesB from "./Base.module.css";
import ServerListEntry from "./components/ServerListEntry";
import ILobbyInfo from "./structures/ILobbyInfo";
import HeaderBar from "./components/HeaderBar";
import UserSingleton from "./config/UserSingleton";
import { RoomAvailable } from "colyseus.js";
import { FullscreenErrorOverlay } from "./components/FullscreenErrorOverlay";

enum ServerListState {
	Idle,
	RedirectDashboard,
}

interface IProps {}

interface IState {
	currentState: ServerListState;
	lobby: any;
	games: RoomAvailable<any>[];
	searchQuery: string;
	errorMessage?: string;
}

class ServerList extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			currentState: ServerListState.Idle,
			lobby: undefined,
			games: [],
			searchQuery: "",
		};
	}

	componentDidMount() {
		this.joinLobby();
	}

	componentWillUnmount() {
		//this.state.lobby.removeAllListeners();
	}

	onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ searchQuery: event.target.value });

		if (event.target.value !== "") {
			this.state.lobby.send("filter", {
				name: "game_room",
				metadata: { roomName: event.target.value },
			});
		} else {
			this.state.lobby.send("filter", {
				name: "game_room",
				metadata: {},
			});
		}
	};

	async joinLobby() {
		// get the lobby
		this.setState(
			{
				lobby: await UserSingleton.getInstance()
					?.getUserInfo()
					?.colyseusClient?.joinOrCreate("lobby_room"),
			},
			() => {
				this.state.lobby.onMessage(
					"rooms",
					(rooms: RoomAvailable<any>[]) => {
						this.setState({ games: rooms });
					}
				);
			}
		);
	}

	render() {
		switch (this.state.currentState) {
			case ServerListState.Idle:
				return this.renderServerList();
			case ServerListState.RedirectDashboard:
				return <Redirect to="/dashboard"></Redirect>;
		}
	}

	renderServerList() {
		let showErrorMessage = this.state.errorMessage ? true : false;

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
				<FullscreenErrorOverlay
					message={this.state.errorMessage}
					buttonText="Back"
					onClickButton={() => {
						this.setState({
							errorMessage: undefined,
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
							>
								Filter
							</button>
						</div>
						<div className={stylesB.buttonWrapper}>
							<button
								className={
									stylesB.buttonBase +
									" " +
									stylesB.buttonFilledSecondary
								}
								onClick={() => {
									this.state.lobby.send("refreshRoomList");
								}}
							>
								Refresh
							</button>
						</div>
					</div>
				</HeaderBar>
				<div className={styles.entries}>
					{this.state.games.map((value, index) => {
						let iconPath: string;

						if (value.metadata.passwordProtected)
							iconPath = "icons/lock-icon.svg";
						else iconPath = "icons/open-match-icon.svg";

						return (
							<ServerListEntry
								roomId={value.roomId}
								iconUrl={iconPath}
								key={value.roomId}
								serverName={value.metadata.roomName}
								gameName="GAME_NAME"
								playerCount={value.clients}
								maxPlayerCount={value.maxClients}
								onJoinFailed={(e) => {
									this.setState({ errorMessage: e.message });
								}}
							/>
						);
					})}
				</div>
			</div>
		);
	}
}

export default ServerList;
