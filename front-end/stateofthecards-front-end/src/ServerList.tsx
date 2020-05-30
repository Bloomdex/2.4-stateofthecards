import React, { Component } from "react";
import styles from "./ServerList.module.css";
import ServerListEntry from "./components/ServerListEntry";
import ILobbyInfo from "./structures/ILobbyInfo";
import HeaderBar from "./components/HeaderBar";

interface IProps {}

interface IState {
	lobbies: ILobbyInfo[];
}

class ServerList extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = { lobbies: [] };
	}

	componentDidMount() {
		this.updateServerList();
	}

	updateServerList(): void {
		this.setState({
			lobbies: [
				{
					lobbyId: 0,
					lobbyName: "Appa's Leuke Lobby",
					passwordProtected: true,
					players: ["Appa", "Momo"],
					state: "Waiting for players",
					gameInfo: { minPlayers: 3, maxPlayers: 4, name: "Uno" },
				},
				{
					lobbyId: 1,
					lobbyName: "Zuko's 'mijn vader is een klootzak' Lobby",
					passwordProtected: true,
					players: ["Zuko", "Zuko's Moeder"],
					state: "Waiting for players",
					gameInfo: { minPlayers: 3, maxPlayers: 4, name: "Uno" },
				},
				{
					lobbyId: 1,
					lobbyName: "Zuko's 'mijn vader is een klootzak' Lobby",
					passwordProtected: true,
					players: ["Zuko", "Zuko's Moeder"],
					state: "Waiting for players",
					gameInfo: { minPlayers: 3, maxPlayers: 4, name: "Uno" },
				},
				{
					lobbyId: 1,
					lobbyName: "Zuko's 'mijn vader is een klootzak' Lobby",
					passwordProtected: true,
					players: ["Zuko", "Zuko's Moeder"],
					state: "Waiting for players",
					gameInfo: { minPlayers: 3, maxPlayers: 4, name: "Uno" },
				},
				{
					lobbyId: 1,
					lobbyName: "Zuko's 'mijn vader is een klootzak' Lobby",
					passwordProtected: true,
					players: ["Zuko", "Zuko's Moeder"],
					state: "Waiting for players",
					gameInfo: { minPlayers: 3, maxPlayers: 4, name: "Uno" },
				},
				{
					lobbyId: 1,
					lobbyName: "Zuko's 'mijn vader is een klootzak' Lobby",
					passwordProtected: true,
					players: ["Zuko", "Zuko's Moeder"],
					state: "Waiting for players",
					gameInfo: { minPlayers: 3, maxPlayers: 4, name: "Uno" },
				},
			],
		});
	}

	render() {
		return (
			<div className={styles.wrapper}>
				<HeaderBar>
					<img
						src="icons/quit-icon-white.svg"
						alt="exit server list"
						onClick={() => {
							console.log("Exiting server list...");
						}}
					></img>
					<div className={styles.searchWrapper}>
						<input
							className={styles.searchBar}
							type="text"
							name="Search"
							placeholder="Search"
						></input>
						<button className={styles.filterButton}>Filter</button>
					</div>
				</HeaderBar>
				<div className={styles.entries}>
					{this.state.lobbies.map((value, index) => {
						return (
							<ServerListEntry
								key={value.lobbyId}
								lobbyInfo={value}
							/>
						);
					})}
				</div>
			</div>
		);
	}
}

export default ServerList;
