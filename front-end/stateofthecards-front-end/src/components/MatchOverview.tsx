import React, { Component } from "react";
import styles from "./MatchOverview.module.css";
import stylesB from "../Base.module.css";
import MenuCard from "./MenuCard";
import IGameInfo from "../structures/IGameInfo";
import MatchPlayerListEntry from "./MatchPlayerListEntry";
import UserSingleton from "../config/UserSingleton";

interface IProps {}

interface IState {}

class MatchOverview extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
	}

	render() {
		const testGame: IGameInfo = {
			minPlayers: 2,
			maxPlayers: 6,
			name: "Blackjack",
			description:
				"Blackjack, formerly also Black Jack and Vingt-Un, is the American member of a global family of banking games known as Twenty-One, whose relatives include Pontoon and Vingt-et-Un. It is a comparing card game between one or more players and a dealer, where each player in turn competes against the dealer.",
			cardLogo: new URL(
				"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Jack_of_clubs_fr.svg/200px-Jack_of_clubs_fr.svg.png"
			),
			color: "#FFFFFF",
		};

		const statePlayers = UserSingleton.getInstance().getUserInfo()
			.currentRoom?.state.players;

		let isHost = false;

		if (
			UserSingleton.getInstance().getUserInfo().currentRoom?.state
				.hostPlayer ===
			UserSingleton.getInstance().getUserInfo().currentRoom?.sessionId
		) {
			isHost = true;
		}

		const playerMap: JSX.Element[] = [];
		for (let key in statePlayers) {
			let player = statePlayers[key];
			let iconUrl = "icons/full-match-icon.svg";
			let actionLabel = "";

			if (
				UserSingleton.getInstance().getUserInfo().currentRoom?.state
					.hostPlayer === key
			) {
				iconUrl = "icons/crown-icon.svg";
				actionLabel = "";

				if (!isHost) {
					actionLabel = "(Double click to add as friend.)";
				}
			} else if (isHost) {
				actionLabel = "(Double click to kick.)";
			} else if (!isHost) {
				if (
					key !==
					UserSingleton.getInstance().getUserInfo().currentRoom
						?.sessionId
				) {
					actionLabel = "(Double click to add as friend.)";
				}
			}

			playerMap.push(
				<MatchPlayerListEntry
					key={key}
					playerName={player.username}
					iconUrl={iconUrl}
					actionLabel={actionLabel}
				></MatchPlayerListEntry>
			);
		}

		return (
			<div className={styles.wrapper}>
				<div className={styles.overviewWrapper}>
					<div className={styles.playerWrapper}>{playerMap}</div>

					<div className={styles.infoWrapper}>
						<MenuCard
							cssClass={styles.cardPreview}
							currentChild={0}
						>
							<img src={testGame.cardLogo.toString()}></img>
							<div />
						</MenuCard>

						<p>Max player count: {testGame.maxPlayers}</p>
					</div>
				</div>

				<div
					className={
						stylesB.buttonWrapper +
						" " +
						stylesB.backgroundDark +
						" " +
						styles.hostActions
					}
				>
					<button
						className={
							stylesB.buttonBase +
							" " +
							stylesB.buttonFilledPrimary
						}
					>
						Start match (2/{testGame.maxPlayers})
					</button>
				</div>
			</div>
		);
	}
}

export default MatchOverview;
