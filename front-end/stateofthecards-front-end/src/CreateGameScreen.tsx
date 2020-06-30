import React, { Component } from "react";
import styles from "./CreateGameScreen.module.css";
import stylesB from "./Base.module.css";
import UserSingleton from "./config/UserSingleton";
import CollapsibleContent from "./components/CollapsibleContent";
import IGameInfo from "./structures/IGameInfo";
import GameRules from "stateofthecards-gamelib/dist/src/GameRules";
import { EffectType } from "stateofthecards-gamelib/dist/src/effects";
import FirebaseApp from "./config/Firebase";
import { Redirect } from "react-router-dom";
import Slider, { Range } from "rc-slider";
import "rc-slider/assets/index.css";
import LogoCard from "./components/LogoCard";
import InteractableCard from "./components/InteractableCard";
import { ImageUpload } from "./components/ImageUpload";
import FullscreenMessageOverlay from "./components/FullscreenMessageOverlay";
import CardWithInfo from "./structures/CardWithInfo";
import { v4 as uuid } from "uuid";

type gameModel = {
	gameInfo: IGameInfo;
	gameRules: GameRules;
};

interface IProps {}

interface IState {
	goBack: boolean;
	currentGameModel?: gameModel;
	gameModels?: gameModel[];
	currentSelectedCard?: number;

	overlayMessage?: string;
	overlaySubMessage?: string;

	errorMessages: {
		gameSettings?: string;
		cardSettings?: string;
	};
}

class CreateGameScreen extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			goBack: false,
			currentSelectedCard: undefined,

			overlayMessage: undefined,
			errorMessages: {
				gameSettings: undefined,
				cardSettings: undefined,
			},
		};
	}

	componentWillMount() {
		const uid = UserSingleton.getInstance()?.getUserInfo()?.firebaseUser
			?.uid;

		if (uid) {
			this.loadGamesInUserLibrary(uid)
				.catch((error) => {
					console.error(error);
				})
				.then((value) => {
					if (value) {
						this.setState({ gameModels: value });
					}
				});
		}
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

		const saveModel = await FirebaseApp.database()
			.ref(refURL)
			.update(gameModel, (error) => {
				if (error) {
					throw new Error(
						`Failed to save data to database: ${error}`
					);
				}
			});
	}

	async publishGameModel(gameModel: gameModel) {
		const infoRefURL: string = `/games/${gameModel.gameInfo.identifier}`;
		const rulesRefURL: string = `/gameRules/${gameModel.gameInfo.identifier}`;

		const infoSnapshot = await FirebaseApp.database()
			.ref(infoRefURL)
			.update(gameModel.gameInfo, (error) => {
				if (error) {
					throw new Error(
						`Failed to publish gameInfo to database: ${error}`
					);
				}
			});

		const rulesSnapshot = await FirebaseApp.database()
			.ref(rulesRefURL)
			.update(gameModel.gameRules, (error) => {
				if (error) {
					throw new Error(
						`Failed to publish GameRules to database: ${error}`
					);
				}
			});
	}

	async deleteGameModel(gameModel: gameModel) {
		const refURL: string =
			"/users/" +
			gameModel.gameInfo.author +
			"/games/" +
			gameModel.gameInfo.identifier;

		await FirebaseApp.database().ref(refURL).remove();

		const refPublishedGameRulesURL: string = `/gameRules/${gameModel.gameInfo.identifier}`;
		const refPublishedGameInfoURL: string = `/games/${gameModel.gameInfo.identifier}`;

		await FirebaseApp.database().ref(refPublishedGameRulesURL).remove();
		await FirebaseApp.database().ref(refPublishedGameInfoURL).remove();
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
			maxPlayers: 2,
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
			maxPlayers: 2,
			startingCards: 1,
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

	async loadGamesInUserLibrary(firebaseUID: string): Promise<gameModel[]> {
		let gameModels: gameModel[] = [];

		const refURL: string = "/users/" + firebaseUID + "/games/";

		const snapshot = await FirebaseApp.database().ref(refURL).once("value");

		if (!snapshot.val()) {
			throw new Error(`Failed to find gameModels for user: ${refURL}`);
		}

		gameModels = Object.keys(snapshot.val()).map(
			(key: string, index: number) => {
				return snapshot.val()[key];
			}
		);

		return gameModels;
	}

	// endregion

	setErrorMessageIfInvalidRules() {
		const model = this.state.currentGameModel;
		if (
			model !== undefined &&
			model.gameRules.maxPlayers !== undefined &&
			model.gameRules.cards !== undefined
		) {
			const maxPerPlayerCardCount =
				model.gameRules.cards.length / model.gameRules.maxPlayers;
			const currentHandoutCount = model.gameRules.startingCards;

			let newErrorMessage = "";
			if (currentHandoutCount > maxPerPlayerCardCount) {
				const messages = this.state.errorMessages;
				messages.gameSettings =
					"Not enough cards for initial handout,\neither decrease the maximum players,\nincrease the amount of cards\nor decrease the initial hand card count.";
				this.setState({
					errorMessages: messages,
				});
			} else {
				const messages = this.state.errorMessages;
				messages.gameSettings = undefined;
				this.setState({ errorMessages: messages });
			}
		}
	}

	// region Render methods
	render() {
		const showFullscreenOverlay = this.state.overlayMessage ? true : false;

		if (this.state.goBack) {
			return <Redirect to="/dashboard"></Redirect>;
		}

		if (!this.state.currentGameModel) {
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
					<FullscreenMessageOverlay
						buttonText="Ok!"
						isVisible={showFullscreenOverlay}
						message={this.state.overlayMessage}
						subMessage={this.state.overlaySubMessage}
						onClickButton={() => {
							this.setState({ overlayMessage: undefined });
						}}
					/>

					{this.renderCardSidePanel()}

					{this.renderCardSelectionPanel()}

					{this.renderCardPreview()}

					{this.renderCardSettingsPanel(
						this.state.currentSelectedCard
					)}
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
							this.setState({ currentGameModel: undefined });
						}}
					>
						Back
					</button>

					<button
						className={
							stylesB.buttonBase +
							" " +
							stylesB.buttonFilledPrimary
						}
						onClick={() => {
							this.saveCurrentGame();
						}}
					>
						Save game
					</button>

					<button
						className={
							stylesB.buttonBase +
							" " +
							stylesB.buttonFilledSecondary
						}
						onClick={() => {
							this.publishCurrentGame();
						}}
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
						onClick={() => this.createNewCard()}
					>
						New card
					</button>
				</div>

				<div className={styles.cardList}>
					{this.state.currentGameModel?.gameRules.cards?.map(
						(card, index) => {
							const cardWInfo = card as CardWithInfo;

							return (
								<InteractableCard
									key={index}
									card={cardWInfo}
									onClickCard={() => {
										this.setState(
											{
												currentSelectedCard: undefined,
											},
											() => {
												this.setState({
													currentSelectedCard: index,
												});
											}
										);
									}}
								/>
							);
						}
					)}
				</div>
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
							this.createNewGame();
						}}
					>
						New game
					</button>
				</div>

				<p>or</p>

				<h3>Edit a game</h3>

				<div className={styles.cardList}>
					{this.state?.gameModels?.map((gameModel, key) => {
						return (
							<LogoCard
								key={key}
								game={gameModel.gameInfo}
								onClickCard={() => {
									this.setState({
										currentGameModel: gameModel,
									});
								}}
								hideFavorite={true}
							/>
						);
					})}
				</div>
			</div>
		);
	}

	renderCardPreview() {
		if (
			this.state.currentGameModel?.gameRules.cards &&
			this.state.currentSelectedCard !== undefined
		) {
			const card = this.getCardUsingId(
				this.state.currentSelectedCard
			) as CardWithInfo;

			if (card) {
				return (
					<div className={styles.preview + " " + styles.padding}>
						<InteractableCard card={card} />
					</div>
				);
			}
		}

		return (
			<div className={styles.preview + " " + styles.padding}>
				<h1>Create or select a card.</h1>
			</div>
		);

		return <div className={styles.preview + " " + styles.padding} />;
	}

	renderGamePreview() {
		return (
			<div className={styles.preview + " " + styles.padding}>
				<h1>Select a game from the left panel.</h1>
			</div>
		);
	}

	renderPlayerSettingsSlider(rangeProps: any, sliderProps: any) {
		return [
			<div key="players">
				<p>Players:</p>
			</div>,
			<div key="playersSlider" className={styles.rangeSliderWrapper}>
				<Range
					{...rangeProps}
					onChange={(value) => {
						const currentModel = this.state.currentGameModel;
						if (currentModel) {
							currentModel.gameInfo.minPlayers = value[0];
							currentModel.gameInfo.maxPlayers = value[1];

							currentModel.gameRules.minPlayers = value[0];
							currentModel.gameRules.maxPlayers = value[1];

							this.setState(
								{
									currentGameModel: currentModel,
								},
								() => {
									this.setErrorMessageIfInvalidRules();
								}
							);
						}
					}}
				/>
			</div>,

			<div key="handouts">
				<p>Initial hand card count:</p>
			</div>,
			<div key="handoutSlider" className={styles.rangeSliderWrapper}>
				<Slider
					{...sliderProps}
					onChange={(value) => {
						const currentModel = this.state.currentGameModel;

						if (currentModel) {
							currentModel.gameRules.startingCards = value;

							this.setState(
								{
									currentGameModel: currentModel,
								},
								() => {
									this.setErrorMessageIfInvalidRules();
								}
							);
						}
					}}
				/>
			</div>,
		];
	}

	renderCardSettingsPanel(currentCardIdx?: number) {
		const minPlayers = 2;
		const maxPlayers = 16;

		let markers = {};
		for (let i = minPlayers; i <= maxPlayers; i++) {
			markers = { ...markers, [i]: i };
		}

		const sliderValues = this.state.currentGameModel
			? [
					this.state.currentGameModel?.gameInfo.minPlayers,
					this.state.currentGameModel?.gameInfo.maxPlayers,
			  ]
			: [2, 8];

		let maxHandCards = 1;
		let defaultHandoutCount = 1;
		if (
			this.state.currentGameModel !== undefined &&
			this.state.currentGameModel?.gameRules.cards !== undefined
		) {
			maxHandCards =
				this.state.currentGameModel?.gameRules.cards.length /
				this.state.currentGameModel?.gameInfo.maxPlayers;

			defaultHandoutCount = this.state.currentGameModel.gameRules
				.startingCards;
		}

		let sliderMarkers = {};
		for (let i = 1; i <= 12; i++) {
			sliderMarkers = { ...sliderMarkers, [i]: i };
		}

		const rangeProps = {
			min: 2.0,
			max: 16.0,
			step: 1.0,
			defaultValue: sliderValues,
			allowCross: false,
			marks: markers,
		};

		const sliderProps = {
			min: 1,
			step: 1,
			defaultValue: defaultHandoutCount,
			max: 12,
			marks: sliderMarkers,
		};

		let valueSliders = this.renderPlayerSettingsSlider(
			rangeProps,
			sliderProps
		);

		if (
			this.state.currentGameModel !== undefined &&
			this.state.currentGameModel.gameRules !== undefined &&
			(this.state.currentGameModel?.gameRules.cards === undefined ||
				this.state.currentGameModel?.gameRules.cards.length < 4)
		) {
			const message = this.state.errorMessages;
			message.gameSettings = "Create atleast 4 cards!";
			valueSliders = [];
		}

		let currentCard: CardWithInfo | undefined = undefined;
		if (currentCardIdx !== undefined)
			currentCard = this.getCardUsingId(currentCardIdx) as CardWithInfo;

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
					key="gs"
					name="Game settings"
					cssClass=""
					cssClassHeader={stylesB.collapsibleHeader}
					cssClassContent={
						stylesB.collapsibleContent +
						" " +
						styles.gameSettingsWrapper
					}
					isCollapsed={false}
				>
					<div
						className={
							stylesB.collapsibleContent +
							" " +
							styles.gameSettings
						}
					>
						<div>
							<p>Game name:</p>
						</div>
						<div>
							<input
								className={stylesB.input}
								defaultValue={
									this.state.currentGameModel?.gameInfo.name
								}
								placeholder="Game name"
								onChange={(e) =>
									this.handleGameSettingNameChange(e)
								}
							/>
						</div>

						<div>
							<p>Game description:</p>
						</div>
						<div>
							<textarea
								className={stylesB.input}
								defaultValue={
									this.state.currentGameModel?.gameInfo
										.description
								}
								placeholder="Game description"
								onChange={(e) => {
									this.handleGameSettingDescriptionChange(e);
								}}
							/>
						</div>

						<div>
							<p>Logo:</p>
						</div>
						<div className={styles.imageUploadWrapper}>
							{this.state.currentGameModel?.gameInfo
								.identifier && (
								<ImageUpload
									previousFileName="game-logo.jpeg"
									onRequestSave={(source) => {
										if (this.state.currentGameModel) {
											this.state.currentGameModel.gameInfo.cardLogo = source;
											this.setState({
												currentGameModel: this.state
													.currentGameModel,
											});
										}
									}}
									onRequestClear={() => {
										if (this.state.currentGameModel) {
											this.state.currentGameModel.gameInfo.cardLogo =
												"https://firebasestorage.googleapis.com/v0/b/bloomdex-stateofthecards.appspot.com/o/games%2Fplaceholder-logo.jpg?alt=media&token=9e6f80db-ee89-4604-be21-e877763c7bf6";
											this.setState({
												currentGameModel: this.state
													.currentGameModel,
											});
										}
									}}
									gameIdentifier={
										this.state.currentGameModel?.gameInfo
											.identifier
									}
								/>
							)}
						</div>

						{valueSliders}

						<div />
						<div className={styles.gameSettingsErrorWrapper}>
							<p className={stylesB.error}>
								{this.state.errorMessages.gameSettings}
							</p>
						</div>
					</div>
					<div
						className={
							stylesB.collapsibleContentWrapper +
							" " +
							stylesB.center
						}
					>
						<div className={stylesB.buttonWrapper}>
							<button
								className={
									stylesB.buttonBase +
									" " +
									stylesB.buttonFilledWarning
								}
								onClick={() => {
									this.deleteCurrentGame();
								}}
							>
								Delete game
							</button>
						</div>
					</div>
					<div />
				</CollapsibleContent>

				{currentCardIdx !== undefined && (
					<CollapsibleContent
						key="cs"
						name="Card settings"
						cssClass=""
						cssClassHeader={stylesB.collapsibleHeader}
						cssClassContent={stylesB.collapsibleContent}
						isCollapsed={false}
					>
						<CollapsibleContent
							key="cso"
							name="Card options"
							cssClass=""
							cssClassHeader={stylesB.collapsibleHeader}
							cssClassContent={stylesB.collapsibleContent}
							isCollapsed={false}
						>
							<div className={styles.cardDesignSettings}>
								<div>
									<p>Card name:</p>
								</div>
								<div>
									<input
										className={stylesB.input}
										defaultValue={
											currentCard ? currentCard.name : ""
										}
										onChange={(e) => {
											this.handleCardSettingNameChange(
												e,
												currentCardIdx
											);
										}}
									/>
								</div>

								<div>
									<p>Card graphics:</p>
								</div>
								<div className={styles.imageUploadWrapper}>
									{this.state.currentGameModel?.gameInfo
										.identifier && (
										<ImageUpload
											previousFileName="card-face.jpeg"
											onRequestSave={(source) => {
												const card: any = this.getCardUsingId(
													currentCardIdx
												);

												if (
													card &&
													this.state.currentGameModel
												) {
													card.face = source;
													this.state.currentGameModel.gameRules.cards[
														currentCardIdx
													] = card;
													this.setState({
														currentGameModel: this
															.state
															.currentGameModel,
													});
												}
											}}
											onRequestClear={() => {
												if (
													currentCard &&
													this.state.currentGameModel
												) {
													currentCard.face =
														"https://firebasestorage.googleapis.com/v0/b/bloomdex-stateofthecards.appspot.com/o/games%2Fplaceholder-face.jpg?alt=media&token=016b5af4-dbc8-4599-b048-218c164d5cff";
													this.state.currentGameModel.gameRules.cards[
														currentCardIdx
													] = currentCard;
													this.setState({
														currentGameModel: this
															.state
															.currentGameModel,
													});
												}
											}}
											gameIdentifier={
												this.state.currentGameModel
													?.gameInfo.identifier
											}
										/>
									)}
								</div>
							</div>
							<div />
						</CollapsibleContent>

						<CollapsibleContent
							key="cst"
							name="Card tags"
							cssClass=""
							cssClassHeader={stylesB.collapsibleHeader}
							cssClassContent={stylesB.collapsibleContent}
							isCollapsed={false}
						>
							<div className={styles.cardTagListWrapper}>
								{currentCard?.tags.map((tag, index) => {
									return (
										<div
											key={"tag-" + index}
											className={styles.cardTagEntry}
										>
											<img
												src={"icons/remove-icon.svg"}
												className={styles.icon}
												alt="Remove"
												onClick={() => {
													this.handleCardSettingTagRemove(
														currentCardIdx,
														index
													);
												}}
											></img>
											<input
												className={stylesB.input}
												value={tag}
												onChange={(e) => {
													this.handleCardSettingTagChange(
														e.target.value,
														currentCardIdx,
														index
													);
												}}
											/>
										</div>
									);
								})}

								<div className={stylesB.buttonWrapper}>
									<button
										className={
											stylesB.buttonBase +
											" " +
											stylesB.buttonFilledPrimary
										}
										onClick={() => {
											this.handleCardSettingTagChange(
												"",
												currentCardIdx
											);
										}}
									>
										Add tag
									</button>
								</div>
							</div>
							<div />
						</CollapsibleContent>

						<CollapsibleContent
							key="cse"
							name="Card effect"
							cssClass=""
							cssClassHeader={stylesB.collapsibleHeader}
							cssClassContent={stylesB.collapsibleContent}
							isCollapsed={false}
						>
							{this.renderCardEffectSettings(
								currentCard,
								currentCardIdx
							)}
							<div />
						</CollapsibleContent>

						<div className={stylesB.center}>
							<div className={stylesB.buttonWrapper}>
								<button
									className={
										stylesB.buttonBase +
										" " +
										stylesB.buttonFilledWarning
									}
									onClick={() => {
										this.deleteCard(currentCardIdx);
									}}
								>
									Delete card
								</button>
							</div>
						</div>
					</CollapsibleContent>
				)}
			</div>
		);
	}

	renderCardEffectSettings(
		currentCard: CardWithInfo | undefined,
		currentCardIdx: number
	) {
		if (!currentCard) return <div />;

		function effectTypeEnumKeys<EffectType>(
			e: EffectType
		): (keyof EffectType)[] {
			return Object.keys(e) as (keyof EffectType)[];
		}

		function effectTypeEnumValues<EffectType>(
			e: EffectType
		): (keyof EffectType)[] {
			return Object.values(e) as (keyof EffectType)[];
		}

		const effectSelected =
			currentCard !== undefined &&
			currentCard.effects !== undefined &&
			currentCard.effects.length === 1;

		const handleSetting = (
			type: string,
			event: React.ChangeEvent<HTMLInputElement>,
			currentCardIdx: number
		) => {
			if (
				this.state.currentGameModel === undefined ||
				currentCard.effects === undefined ||
				currentCard.effects.length < 1
			)
				return;

			switch (currentCard.effects[0].type) {
				case "TURN_MODIFIER":
					if (currentCard.effects !== undefined) {
						currentCard.effects[0].turns = Number(
							event.target.value
						);
					}
					break;
				case "DRAW_CARD":
					if (currentCard.effects !== undefined) {
						currentCard.effects[0].cards = Number(
							event.target.value
						);
					}
					break;
				case "PASS_HANDS_ALONG":
					if (currentCard.effects !== undefined) {
						currentCard.effects[0].steps = Number(
							event.target.value
						);
					}
					break;
				case "TAG_OVERRIDE":
					/*if (
						currentCard.effects !== undefined &&
						currentCard.effects[0].override !== undefined
					) {
						currentCard.effects[0].override = [
							event.target.value,
							"uniqueEI_DEE",
						];
					}*/
					break;
			}

			this.handleCardSetting(currentCard, currentCardIdx);
		};

		let extraEffectOptions;
		if (currentCard.effects !== undefined && effectSelected) {
			switch (currentCard.effects[0].type) {
				case "TURN_MODIFIER":
					extraEffectOptions = (
						<div>
							<p>Turns:</p>
							<input
								className={stylesB.input}
								type="number"
								value={
									currentCard.effects[0].turns
										? currentCard.effects[0].turns
										: 0
								}
								onChange={(e) => {
									if (
										currentCard !== undefined &&
										currentCard.effects
									) {
										handleSetting(
											currentCard.effects[0].type,
											e,
											currentCardIdx
										);
									}
								}}
								min="-15"
								max="+15"
							/>
						</div>
					);
					break;
				case "DRAW_CARD":
					extraEffectOptions = (
						<div>
							<p>Amount:</p>
							<input
								className={stylesB.input}
								type="number"
								value={
									currentCard.effects[0].cards
										? currentCard.effects[0].cards
										: 0
								}
								onChange={(e) => {
									if (
										currentCard !== undefined &&
										currentCard.effects
									) {
										handleSetting(
											currentCard.effects[0].type,
											e,
											currentCardIdx
										);
									}
								}}
								min="0"
								max="+30"
							/>
						</div>
					);
					break;
				case "PASS_HANDS_ALONG":
					extraEffectOptions = (
						<div>
							<p>Steps:</p>
							<input
								className={stylesB.input}
								type="number"
								value={
									currentCard.effects[0].steps
										? currentCard.effects[0].steps
										: 0
								}
								onChange={(e) => {
									if (
										currentCard !== undefined &&
										currentCard.effects
									) {
										handleSetting(
											currentCard.effects[0].type,
											e,
											currentCardIdx
										);
									}
								}}
								min="-15"
								max="+15"
							/>
						</div>
					);
					break;
				case "TAG_OVERRIDE":
					extraEffectOptions = (
						<div>
							<p>Tag:</p>
							<input
								className={stylesB.input}
								type="number"
								value={
									currentCard.effects[0].override &&
									currentCard.effects[0].override[0]
										? currentCard.effects[0].override[0]
										: 1
								}
								onChange={(e) => {
									if (
										currentCard !== undefined &&
										currentCard.effects
									) {
										handleSetting(
											currentCard.effects[0].type,
											e,
											currentCardIdx
										);
									}
								}}
								min="1"
							/>
						</div>
					);
					break;
			}
		}

		return (
			<div className={styles.cardEffectsWrapper}>
				<div>
					<p>Effect type:</p>
					<select
						className={stylesB.input}
						name="options"
						id="options"
						value={
							currentCard.effects && effectSelected
								? currentCard?.effects[0]?.type
								: "none"
						}
						onChange={(e) => {
							this.handleCardSettingEffectChange(
								e,
								currentCardIdx
							);
						}}
					>
						<option value="NONE">NONE</option>

						{effectTypeEnumValues(EffectType).map(
							(value, index) => {
								return (
									<option key={index} value={value}>
										{value}
									</option>
								);
							}
						)}
					</select>
				</div>

				{currentCard.effects && effectSelected ? (
					extraEffectOptions
				) : (
					<div />
				)}
			</div>
		);
	}
	// endregion

	// region Actions
	createNewGame() {
		const uid = UserSingleton.getInstance()?.getUserInfo()?.firebaseUser
			?.uid;

		if (uid) {
			this.createGameModel(uid).then((gameModel) => {
				if (this.state.gameModels) {
					this.setState({
						currentGameModel: gameModel,
						gameModels: [...this.state.gameModels, gameModel],
					});
				} else {
					this.setState({
						currentGameModel: gameModel,
						gameModels: [gameModel],
					});
				}
			});
		}
	}

	saveCurrentGame() {
		if (this.state.currentGameModel) {
			this.saveGameModel(this.state.currentGameModel);
			this.setState({
				overlayMessage: `Succesfully saved ${this.state.currentGameModel.gameInfo.name}!`,
				overlaySubMessage: `You can come back later to make some more changes.`,
			});
		}
	}

	publishCurrentGame() {
		if (this.state.currentGameModel) {
			this.setErrorMessageIfInvalidRules();

			if (
				this.state.errorMessages.gameSettings !== undefined ||
				this.state.errorMessages.cardSettings !== undefined
			) {
				this.setState({
					overlayMessage: "Failed to publish because of a mistake!",
					overlaySubMessage:
						"You probably made a mistake in the game settings, check for error messages in your settings.",
				});
			} else {
				this.publishGameModel(this.state.currentGameModel);
				this.setState({
					overlayMessage: `Succesfully (re)published ${this.state.currentGameModel.gameInfo.name}!`,
					overlaySubMessage: `The game is now playable when creating a new match.`,
				});
			}
		}
	}

	deleteCurrentGame() {
		if (!this.state.currentGameModel) return;

		this.deleteGameModel(this.state.currentGameModel);
		this.setState({
			gameModels: this.state.gameModels?.filter(
				(model) => model !== this.state.currentGameModel
			),
			currentGameModel: undefined,
		});
	}

	createNewCard() {
		if (!this.state.currentGameModel) return;

		const card: CardWithInfo = {
			id: uuid(),
			effects: [],
			name: "New card",
			face:
				"https://firebasestorage.googleapis.com/v0/b/bloomdex-stateofthecards.appspot.com/o/games%2Fplaceholder-face.jpg?alt=media&token=016b5af4-dbc8-4599-b048-218c164d5cff",
			tags: ["Tag"],
			playableOnTags: [],
		};

		if (!this.state.currentGameModel.gameRules.cards) {
			this.state.currentGameModel.gameRules.cards = [];
		}

		this.state.currentGameModel.gameRules.cards.push(card);

		const gameModel = this.state.currentGameModel;
		this.setState(
			{
				currentGameModel: this.state.currentGameModel,
				currentSelectedCard: undefined,
			},
			() => {
				this.setErrorMessageIfInvalidRules();
				this.setState({
					currentSelectedCard: gameModel.gameRules.cards.length - 1,
				});
			}
		);
	}

	deleteCard(currentCardIdx: number) {
		if (
			!this.state.currentGameModel ||
			!this.state.currentGameModel.gameRules.cards
		)
			return;

		this.state.currentGameModel.gameRules.cards.splice(currentCardIdx, 1);

		this.setState({
			currentGameModel: this.state.currentGameModel,
			currentSelectedCard: undefined,
		});
	}
	// endregion

	// region Getters
	getCardUsingId(index: number) {
		if (!this.state.currentGameModel?.gameRules.cards) return undefined;

		const card = this.state.currentGameModel?.gameRules.cards[
			index
		] as CardWithInfo;

		return card;
	}

	getCardNameUsingId(index: number) {
		const card = this.state.currentGameModel?.gameRules.cards[
			index
		] as CardWithInfo;

		return card.name;
	}
	// endregion

	// region Input change events
	handleGameSettingNameChange(event: React.ChangeEvent<HTMLInputElement>) {
		if (!this.state.currentGameModel) return;

		this.state.currentGameModel.gameInfo.name = event.target.value;
		this.setState({ currentGameModel: this.state.currentGameModel });
	}

	handleGameSettingDescriptionChange(
		event: React.ChangeEvent<HTMLTextAreaElement>
	) {
		if (!this.state.currentGameModel) return;

		this.state.currentGameModel.gameInfo.description = event.target.value;
		this.setState({ currentGameModel: this.state.currentGameModel });
	}

	handleCardSettingNameChange(
		event: React.ChangeEvent<HTMLInputElement>,
		currentCardIdx: number
	) {
		if (!this.state.currentGameModel) return;

		const card = this.state.currentGameModel.gameRules.cards[
			currentCardIdx
		] as CardWithInfo;

		card.name = event.target.value;

		this.handleCardSetting(card, currentCardIdx);
	}

	handleCardSettingTagChange(
		value: string,
		currentCardIdx: number,
		tagIdx?: number
	) {
		if (!this.state.currentGameModel) return;

		const card = this.state.currentGameModel.gameRules.cards[
			currentCardIdx
		] as CardWithInfo;

		if (tagIdx === undefined) {
			card.tags.push(value);
		} else {
			card.tags[tagIdx] = value;
		}

		this.handleCardSetting(card, currentCardIdx);
	}

	handleCardSettingTagRemove(currentCardIdx: number, tagIdx: number) {
		if (!this.state.currentGameModel) return;

		const card = this.state.currentGameModel.gameRules.cards[
			currentCardIdx
		] as CardWithInfo;

		card.tags.splice(tagIdx, 1);

		this.handleCardSetting(card, currentCardIdx);
	}

	handleCardSettingEffectChange(
		event: React.ChangeEvent<HTMLSelectElement>,
		currentCardIdx: number
	) {
		if (!this.state.currentGameModel) return;

		const card = this.state.currentGameModel.gameRules.cards[
			currentCardIdx
		] as CardWithInfo;

		const type: any = event.target.value;

		card.effects = [];

		if (type !== "NONE") {
			card.effects.push({ type: type });
		}

		this.handleCardSetting(card, currentCardIdx);
	}

	handleCardSetting(card: CardWithInfo, currentCardIdx: number) {
		if (!this.state.currentGameModel) return;

		this.state.currentGameModel.gameRules.cards[currentCardIdx] = card;

		this.setState({
			currentGameModel: this.state.currentGameModel,
		});
	}
	// endregion
}

export default CreateGameScreen;
