import React, { useState, Component } from "react";
import styles from "./CreateGameScreen.module.css";
import stylesB from "./Base.module.css";
import UserSingleton from "./config/UserSingleton";
import GameCard from "./components/GameCard";
import CollapsibleContent from "./components/CollapsibleContent";
import IGameInfo from "./structures/IGameInfo";
import GameRules from "stateofthecards-gamelib/dist/src/GameRules";
import FirebaseApp from "./config/Firebase";
import { Redirect } from "react-router-dom";
import Slider, { Range } from "rc-slider";
import "rc-slider/assets/index.css";

type gameModel = {
	gameInfo: IGameInfo;
	gameRules: GameRules;
};

interface IProps {}

interface IState {
	gameSelected: boolean;
	goBack: boolean;
	gameModel?: gameModel;
}

class CreateGameScreen extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			gameSelected: false,
			goBack: false,
		};
	}

	// region Loading and Saving GameModels
	async loadGameModelFromPublishedGame(
		identifier: string
	): Promise<gameModel> {
		const gameInfoSnapshot = await FirebaseApp.database()
			.ref("/games/" + identifier)
			.once("value");

		if (!gameInfoSnapshot.val()) {
			throw new Error(
				`Failed to find gameInfo for game with the following identifier: ${identifier}`
			);
		}

		const gameRulesSnapshot = await FirebaseApp.database()
			.ref("/gameRules/" + identifier)
			.once("value");

		if (!gameRulesSnapshot.val()) {
			throw new Error(
				`Failed to find gameRiles for game with the following identifier: ${identifier}`
			);
		}

		const gameInfo: IGameInfo = gameInfoSnapshot.val();
		const gameRules: GameRules = gameRulesSnapshot.val();

		return { gameInfo, gameRules };
	}

	async loadGameModelFromUserLibrary(
		firebaseUID: string,
		gameIdentifier: string
	): Promise<gameModel> {
		const refURL: string =
			"/users/" + firebaseUID + "/games/" + gameIdentifier;

		const gameModelSnapshot = await FirebaseApp.database()
			.ref(refURL)
			.once("value");

		if (!gameModelSnapshot.val()) {
			throw new Error(`Failed to find gameModel for game: ${refURL}`);
		}

		const gameModel: gameModel = gameModelSnapshot.val();

		return gameModel;
	}

	async saveGameModel(gameModel: gameModel) {
		const refURL: string =
			"/users/" +
			gameModel.gameInfo.author +
			"/games/" +
			gameModel.gameInfo.identifier;

		FirebaseApp.database()
			.ref(refURL)
			.update(gameModel, (error) => {
				if (error) {
					throw new Error(
						`Failed to save data to database: ${error}`
					);
				}
			});
	}

	async createGameModel(firebaseUID: string): Promise<gameModel> {
		const refURL: string = "/users/" + firebaseUID + "/games/";

		const snapshot = await FirebaseApp.database()
			.ref(refURL)
			.push({}, (error) => {
				if (error) {
					throw new Error(
						`Failed to save data to database: ${error}`
					);
				}
			});

		if (!snapshot.key) {
			throw new Error("Failed to create a new game in the database!");
		}

		const gameInfo: IGameInfo = {
			identifier: snapshot.key,
			minPlayers: 2,
			maxPlayers: 4,
			name: "My New Game",
			description: "Put a description for My New Game here.",
			cardLogo:
				"https://firebasestorage.googleapis.com/v0/b/bloomdex-stateofthecards.appspot.com/o/games%2Fplaceholder-logo.jpg?alt=media&token=9e6f80db-ee89-4604-be21-e877763c7bf6",
			color: "FFFFFF",
			author: firebaseUID,
		};

		const gameRules: GameRules = {
			cards: [],
			minPlayers: 2,
			maxPlayers: 4,
			startingCards: 5,
		};

		const gameModel: gameModel = {
			gameInfo: gameInfo,
			gameRules: gameRules,
		};

		const updateRef = await FirebaseApp.database()
			.ref(refURL + snapshot.key)
			.update(gameModel, (error) => {
				if (error) {
					throw new Error(
						`Failed to save data to database: ${error}`
					);
				}
			});

		return gameModel;
	}

	// endregion

	// region Render methods
	render() {
		if (this.state.goBack) {
			return <Redirect to="/dashboard"></Redirect>;
		}

		if (!this.state.gameSelected) {
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
					{this.renderGameSidePanel()}

					{this.renderGameSelectionPanel()}

					{this.renderGamePreview()}
				</div>
			);
		} else {
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
					{this.renderCardSidePanel()}

					{this.renderCardSelectionPanel()}

					{this.renderCardPreview()}

					{this.renderCardSettingsPanel()}
				</div>
			);
		}

		return <div />;
	}

	renderCardSidePanel() {
		return (
			<div
				className={
					styles.sidePanel +
					" " +
					stylesB.backgroundDark +
					" " +
					styles.padding
				}
			>
				<div className={stylesB.buttonWrapper}>
					<button
						className={
							stylesB.buttonBase +
							" " +
							stylesB.buttonFilledTertiary
						}
						onClick={() => {
							this.setState({ gameSelected: false });
						}}
					>
						Back
					</button>
				</div>

				<div className={stylesB.buttonWrapper}>
					<button
						className={
							stylesB.buttonBase +
							" " +
							stylesB.buttonFilledPrimary
						}
					>
						Save game
					</button>
				</div>

				<div className={stylesB.buttonWrapper}>
					<button
						className={
							stylesB.buttonBase +
							" " +
							stylesB.buttonFilledSecondary
						}
					>
						Publish game
					</button>
				</div>
			</div>
		);
	}

	renderGameSidePanel() {
		return (
			<div
				className={
					styles.sidePanel +
					" " +
					stylesB.backgroundDark +
					" " +
					styles.padding
				}
			>
				<div className={stylesB.buttonWrapper}>
					<button
						className={
							stylesB.buttonBase +
							" " +
							stylesB.buttonFilledTertiary
						}
						onClick={() => {
							this.setState({ goBack: true });
						}}
					>
						Back
					</button>
				</div>
			</div>
		);
	}

	renderCardSelectionPanel() {
		return (
			<div
				className={
					styles.selectionPanel +
					" " +
					stylesB.backgroundLightDark +
					" " +
					styles.padding
				}
			>
				<div className={stylesB.buttonWrapper}>
					<button
						className={
							stylesB.buttonBase +
							" " +
							stylesB.buttonFilledPrimary
						}
					>
						New card
					</button>
				</div>

				{!this.state.gameSelected && (
					<div className={styles.cardList}>
						<GameCard
							cssClass={styles.card}
							imageUrl={
								"https://mag.rjeem.com/wp-content/uploads/2018/12/comet-wirtanen-Jack-Fusco-dec-2018-Anza-Borrego-desert-CA-e1544613895713.jpg"
							}
						/>
						<GameCard
							cssClass={styles.card}
							imageUrl={
								"https://mag.rjeem.com/wp-content/uploads/2018/12/comet-wirtanen-Jack-Fusco-dec-2018-Anza-Borrego-desert-CA-e1544613895713.jpg"
							}
						/>
					</div>
				)}

				{this.state.gameSelected && (
					<div className={styles.cardList}>
						<GameCard
							cssClass={styles.card}
							imageUrl={
								"https://mag.rjeem.com/wp-content/uploads/2018/12/comet-wirtanen-Jack-Fusco-dec-2018-Anza-Borrego-desert-CA-e1544613895713.jpg"
							}
						/>
						<GameCard
							cssClass={styles.card}
							imageUrl={
								"https://mag.rjeem.com/wp-content/uploads/2018/12/comet-wirtanen-Jack-Fusco-dec-2018-Anza-Borrego-desert-CA-e1544613895713.jpg"
							}
						/>
						<GameCard
							cssClass={styles.card}
							imageUrl={
								"https://mag.rjeem.com/wp-content/uploads/2018/12/comet-wirtanen-Jack-Fusco-dec-2018-Anza-Borrego-desert-CA-e1544613895713.jpg"
							}
						/>
						<GameCard
							cssClass={styles.card}
							imageUrl={
								"https://mag.rjeem.com/wp-content/uploads/2018/12/comet-wirtanen-Jack-Fusco-dec-2018-Anza-Borrego-desert-CA-e1544613895713.jpg"
							}
						/>
					</div>
				)}
			</div>
		);
	}

	renderGameSelectionPanel() {
		return (
			<div
				className={
					styles.selectionPanel +
					" " +
					stylesB.backgroundLightDark +
					" " +
					styles.padding
				}
			>
				<div className={stylesB.buttonWrapper}>
					<button
						className={
							stylesB.buttonBase +
							" " +
							stylesB.buttonFilledPrimary
						}
						onClick={() => {
							const uid = UserSingleton.getInstance()?.getUserInfo()
								?.firebaseUser?.uid;

							if (uid) {
								this.createGameModel(uid).then((gameModel) => {
									this.setState({
										gameModel: gameModel,
										gameSelected: true,
									});
								});
							}
						}}
					>
						New game
					</button>
				</div>

				<p>or</p>

				<h3>Edit a game</h3>

				<div className={styles.cardList}>
					<GameCard
						cssClass={styles.card}
						imageUrl={
							"https://mag.rjeem.com/wp-content/uploads/2018/12/comet-wirtanen-Jack-Fusco-dec-2018-Anza-Borrego-desert-CA-e1544613895713.jpg"
						}
					/>
					<GameCard
						cssClass={styles.card}
						imageUrl={
							"https://mag.rjeem.com/wp-content/uploads/2018/12/comet-wirtanen-Jack-Fusco-dec-2018-Anza-Borrego-desert-CA-e1544613895713.jpg"
						}
					/>
				</div>
			</div>
		);
	}

	renderCardPreview() {
		return (
			<div className={styles.preview + " " + styles.padding}>
				<GameCard
					cssClass={styles.previewCard}
					imageUrl={
						"https://mag.rjeem.com/wp-content/uploads/2018/12/comet-wirtanen-Jack-Fusco-dec-2018-Anza-Borrego-desert-CA-e1544613895713.jpg"
					}
				/>
			</div>
		);
	}

	renderGamePreview() {
		return (
			<div className={styles.preview + " " + styles.padding}>
				<h1>GAME NAME</h1>
				<GameCard
					cssClass={styles.previewCard}
					imageUrl={
						"https://mag.rjeem.com/wp-content/uploads/2018/12/comet-wirtanen-Jack-Fusco-dec-2018-Anza-Borrego-desert-CA-e1544613895713.jpg"
					}
				/>
			</div>
		);
	}

	renderCardSettingsPanel() {
		const sliderProps = {
			min: 2.0,
			max: 16.0,
			step: 1.0,
		};

		return (
			<div
				className={
					styles.cardSettings +
					" " +
					stylesB.backgroundDark +
					" " +
					styles.padding
				}
			>
				<CollapsibleContent
					name="Game settings"
					cssClass=""
					cssClassHeader={stylesB.collapsibleHeader}
					cssClassContent={stylesB.collapsibleContent}
					isCollapsed={false}
				>
					<table className={styles.gameSettingsWrapper}>
						<tr>
							<td>Game name:</td>
							<td>
								<input
									defaultValue={
										this.state.gameModel?.gameInfo.name
									}
								/>
							</td>
						</tr>
						<tr>
							<td>Game description:</td>
							<td>
								<textarea
									defaultValue={
										this.state.gameModel?.gameInfo
											.description
									}
								/>
							</td>
						</tr>
						<tr>
							<td>Card logo:</td>
							<td>
								<input
									defaultValue={
										this.state.gameModel?.gameInfo.cardLogo
									}
								/>
							</td>
						</tr>
						<tr>
							<td>Min players:</td>
							<td>
								<Range {...sliderProps} />
							</td>
						</tr>
					</table>
					<div />
				</CollapsibleContent>

				<CollapsibleContent
					name="Card design"
					cssClass=""
					cssClassHeader={stylesB.collapsibleHeader}
					cssClassContent={stylesB.collapsibleContent}
					isCollapsed={false}
				>
					<div>
						<p>Name</p>
						<p>image</p>
					</div>
					<div />
				</CollapsibleContent>

				<CollapsibleContent
					name="Card rules"
					cssClass=""
					cssClassHeader={stylesB.collapsibleHeader}
					cssClassContent={stylesB.collapsibleContent}
					isCollapsed={false}
				>
					<div>
						<p>ITEM</p>
						<p>ITEM</p>
						<p>ITEM</p>
					</div>
					<div />
				</CollapsibleContent>
			</div>
		);
	}
	// endregion
}

export default CreateGameScreen;
