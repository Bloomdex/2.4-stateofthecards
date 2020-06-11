import React, { Component } from "react";
import styles from "./MatchLobbySettings.module.css";
import stylesB from "../Base.module.css";
import GameCard from "./GameCard";
import MenuCard from "./MenuCard";
import IGameInfo from "../structures/IGameInfo";
import CollapsibleContent from "./CollapsibleContent";
import TabSelection from "./TabSelection";

interface IProps {}

interface IState {}

class MatchLobbySettings extends Component<IProps, IState> {
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

		return (
			<div className={styles.pageWrapper}>
				<div className={styles.sidePanel + " " + styles.gameSettings}>
					<CollapsibleContent
						name="Server settings"
						cssClass=""
						cssClassHeader={styles.collapsibleHeader}
						cssClassContent={styles.collapsibleContent}
						isCollapsed={false}
					>
						<div
							className={
								styles.settings + " " + styles.serverSettings
							}
						>
							<input
								className={stylesB.input}
								placeholder="Server name"
							/>

							<input
								className={stylesB.input}
								placeholder="Server password"
							/>

							<div className={styles.friendsOnlySetting}>
								<p>Friends only: </p>
								<input type="checkbox" />
							</div>
						</div>
						<div />
					</CollapsibleContent>

					<CollapsibleContent
						name="Match settings"
						cssClass=""
						cssClassHeader={styles.collapsibleHeader}
						cssClassContent={styles.collapsibleContent}
						isCollapsed={true}
					>
						<div
							className={
								styles.settings + " " + styles.matchSettings
							}
						>
							<MenuCard
								cssClass={styles.cardPreview}
								currentChild={0}
							>
								<img src={testGame.cardLogo.toString()}></img>
								<div />
							</MenuCard>

							<div className={styles.playerCountSetting}>
								<p>Max player count:</p>
								<input
									type="number"
									value="4"
									min="1"
									max="10"
								/>
							</div>
						</div>
						<div />
					</CollapsibleContent>
				</div>

				<div className={styles.sidePanel + " " + styles.searchList}>
					<input
						className={stylesB.input}
						placeholder="Search..."
					></input>

					<TabSelection
						onButtonClicked={(i) => console.log(i)}
						buttons={[
							"Monthly Popular Games",
							"Favorites",
							"My Games",
							"Friends Games",
						]}
						cssClass={styles.filterButtons}
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
				</div>

				<div className={styles.gamesCollection}>
					<GameCard game={testGame}></GameCard>
					<GameCard game={testGame}></GameCard>
					<GameCard game={testGame}></GameCard>
					<GameCard game={testGame}></GameCard>
					<GameCard game={testGame}></GameCard>
					<GameCard game={testGame}></GameCard>
					<GameCard game={testGame}></GameCard>
					<GameCard game={testGame}></GameCard>
					<GameCard game={testGame}></GameCard>
					<GameCard game={testGame}></GameCard>
					<GameCard game={testGame}></GameCard>
					<GameCard game={testGame}></GameCard>
				</div>
			</div>
		);
	}
}

export default MatchLobbySettings;
