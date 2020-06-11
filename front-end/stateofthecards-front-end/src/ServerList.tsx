import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import styles from "./ServerList.module.css";
import stylesB from "./Base.module.css";
import ServerListEntry from "./components/ServerListEntry";
import ILobbyInfo from "./structures/ILobbyInfo";
import HeaderBar from "./components/HeaderBar";

enum ServerListState {
	Idle,
	RedirectDashboard,
}

interface IProps {}

interface IState {
	currentState: ServerListState;
	lobbies: ILobbyInfo[];
}

class ServerList extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = { currentState: ServerListState.Idle, lobbies: [] };
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
					gameInfo: {
						minPlayers: 2,
						maxPlayers: 6,
						name: "Blackjack",
						description:
							"Blackjack, formerly also Black Jack and Vingt-Un, is the American member of a global family of banking games known as Twenty-One, whose relatives include Pontoon and Vingt-et-Un. It is a comparing card game between one or more players and a dealer, where each player in turn competes against the dealer.",
						cardLogo: new URL(
							"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Jack_of_clubs_fr.svg/200px-Jack_of_clubs_fr.svg.png"
						),
						color: "#FFFFFF",
					},
				},
				{
					lobbyId: 1,
					lobbyName: "Zuko's 'Ik ben mijn eer kwijt' Lobby",
					passwordProtected: true,
					players: ["Zuko", "Zuko's Moeder"],
					state: "Waiting for players",
					gameInfo: {
						minPlayers: 2,
						maxPlayers: 6,
						name: "Blackjack",
						description:
							"Blackjack, formerly also Black Jack and Vingt-Un, is the American member of a global family of banking games known as Twenty-One, whose relatives include Pontoon and Vingt-et-Un. It is a comparing card game between one or more players and a dealer, where each player in turn competes against the dealer.",
						cardLogo: new URL(
							"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Jack_of_clubs_fr.svg/200px-Jack_of_clubs_fr.svg.png"
						),
						color: "#FFFFFF",
					},
				},
				{
					lobbyId: 2,
					lobbyName: "Zuko's 'Ik ben mijn eer kwijt' Lobby",
					passwordProtected: true,
					players: ["Zuko", "Zuko's Moeder"],
					state: "Waiting for players",
					gameInfo: {
						minPlayers: 2,
						maxPlayers: 6,
						name: "Blackjack",
						description:
							"Blackjack, formerly also Black Jack and Vingt-Un, is the American member of a global family of banking games known as Twenty-One, whose relatives include Pontoon and Vingt-et-Un. It is a comparing card game between one or more players and a dealer, where each player in turn competes against the dealer.",
						cardLogo: new URL(
							"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Jack_of_clubs_fr.svg/200px-Jack_of_clubs_fr.svg.png"
						),
						color: "#FFFFFF",
					},
				},
				{
					lobbyId: 3,
					lobbyName: "Zuko's 'Ik ben mijn eer kwijt' Lobby",
					passwordProtected: true,
					players: ["Zuko", "Zuko's Moeder"],
					state: "Waiting for players",
					gameInfo: {
						minPlayers: 2,
						maxPlayers: 6,
						name: "Blackjack",
						description:
							"Blackjack, formerly also Black Jack and Vingt-Un, is the American member of a global family of banking games known as Twenty-One, whose relatives include Pontoon and Vingt-et-Un. It is a comparing card game between one or more players and a dealer, where each player in turn competes against the dealer.",
						cardLogo: new URL(
							"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Jack_of_clubs_fr.svg/200px-Jack_of_clubs_fr.svg.png"
						),
						color: "#FFFFFF",
					},
				},
				{
					lobbyId: 4,
					lobbyName: "Zuko's 'Ik ben mijn eer kwijt' Lobby",
					passwordProtected: true,
					players: ["Zuko", "Zuko's Moeder"],
					state: "Waiting for players",
					gameInfo: {
						minPlayers: 2,
						maxPlayers: 6,
						name: "Blackjack",
						description:
							"Blackjack, formerly also Black Jack and Vingt-Un, is the American member of a global family of banking games known as Twenty-One, whose relatives include Pontoon and Vingt-et-Un. It is a comparing card game between one or more players and a dealer, where each player in turn competes against the dealer.",
						cardLogo: new URL(
							"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Jack_of_clubs_fr.svg/200px-Jack_of_clubs_fr.svg.png"
						),
						color: "#FFFFFF",
					},
				},
				{
					lobbyId: 5,
					lobbyName: "Zuko's 'Ik ben mijn eer kwijt' Lobby",
					passwordProtected: true,
					players: ["Zuko", "Zuko's Moeder"],
					state: "Waiting for players",
					gameInfo: {
						minPlayers: 2,
						maxPlayers: 6,
						name: "Blackjack",
						description:
							"Blackjack, formerly also Black Jack and Vingt-Un, is the American member of a global family of banking games known as Twenty-One, whose relatives include Pontoon and Vingt-et-Un. It is a comparing card game between one or more players and a dealer, where each player in turn competes against the dealer.",
						cardLogo: new URL(
							"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Jack_of_clubs_fr.svg/200px-Jack_of_clubs_fr.svg.png"
						),
						color: "#FFFFFF",
					},
				},
			],
		});
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
