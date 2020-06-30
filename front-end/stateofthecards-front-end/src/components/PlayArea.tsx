import React, { FunctionComponent, useState } from "react";
import styles from "./PlayArea.module.css";
import stylesB from "../Base.module.css";
import UserSingleton from "../config/UserSingleton";
import InteractableCard from "./InteractableCard";
import { RootState, validActions } from "stateofthecards-gamelib";
import { Rnd } from "react-rnd";
import CardWithInfo from "../structures/CardWithInfo";

const PlayArea: FunctionComponent<{ gameState: RootState }> = ({
	gameState,
}) => {
	const room = UserSingleton.getInstance().getUserInfo().currentRoom;

	const resizingRule = {
		bottom: false,
		bottomLeft: false,
		bottomRight: false,
		left: false,
		right: false,
		top: false,
		topLeft: false,
		topRight: false,
	};

	const checkCardPossiblePlay = (card: any): boolean => {
		const validActionsList: any[] =
			gameState != null ? validActions(gameState) : [];

		if (!validActionsList || validActionsList.length === 0) return false;

		for (let action of validActionsList) {
			if (action.type === "PLAY_CARD" && action.payload.id === card.id) {
				return true;
			}
		}

		return false;
	};

	const deckCards = gameState.cards.hands[
		room?.state.playerIndices[room?.sessionId]
	]?.map((card: any, index) => {
		return (
			<InteractableCard
				key={index}
				card={card}
				disabled={!checkCardPossiblePlay(card)}
				onClickCard={() => selectPlayCard(index)}
			/>
		);
	});

	const topCard = gameState.cards.played[
		gameState.cards.played.length - 1
	] as CardWithInfo;

	const [playedCardActions, setPlayedCardActions]: any[] = useState([]);

	const selectPlayCard = (index: number) => {
		let validPlayActions: any[] = [];

		try {
			let deck =
				gameState.cards.hands[
					room?.state.playerIndices[room?.sessionId]
				];
			let card = deck[index];

			const validActionsList: any[] =
				gameState != null ? validActions(gameState) : [];

			for (let action of validActionsList) {
				if (
					action.type === "PLAY_CARD" &&
					action.payload.id === card.id
				) {
					validPlayActions.push(action);
				}
			}
		} catch (error) {
			console.error("ACTION WAS INVALID.", error.message);
		} finally {
			if (validPlayActions.length > 0) {
				if (validPlayActions.length > 1) {
					setPlayedCardActions(validPlayActions);
				} else {
					// Send the first action in the list.
					room?.send("performAction", validPlayActions[0]);
				}
			} else {
				console.error("ACTION WAS INVALID.");
			}
		}
	};

	const grabCardFromStack = () => {
		room?.send("performAction", {
			type: "SKIP",
			tags: [],
			options: {},
			effects: [],
		});
	};

	const isMyTurn =
		room?.state.playerIndices[room?.sessionId] ===
		gameState.turnInfo.current;

	// WHaT tHE aCtuAl fuCK
	const currentPlayer =
		room?.state.players[
			Object.keys(room?.state.playerIndices).filter((key: string) => {
				return (
					room?.state.playerIndices[key] ===
					gameState.turnInfo.current
				);
			})[0]
		];

	let currentPlayerName = "";
	if (currentPlayer) currentPlayerName = currentPlayer.username;

	const turnMessage = isMyTurn
		? "Your turn."
		: currentPlayerName + "'s turn.";

	let stackCount = gameState.cards.remaining.length;
	if (stackCount === 0 && gameState.cards.played.length > 1) {
		stackCount = gameState.cards.played.length - 1;
	}

	let disableGrabCard = !isMyTurn;
	if (isMyTurn && stackCount === 0) {
		disableGrabCard = true;
	}

	return (
		<div className={styles.wrapper}>
			<div className={styles.turnInfoWrapper}>
				<h1>{turnMessage}</h1>
			</div>

			<div className={styles.playedCardsArea}>
				<div className={styles.dropArea}>
					<InteractableCard key={"c1"} card={topCard} />
				</div>

				<div>
					<InteractableCard
						key={"c2"}
						card={{
							id: "CardStack",
							playableOnTags: [],
							face: room?.state.gameInfo.cardLogo,
							name: "Grab a card (" + stackCount + ")",
							tags: [],
						}}
						disabled={disableGrabCard}
						onClickCard={() => {
							grabCardFromStack();
						}}
					/>
				</div>
			</div>

			<div className={styles.deckAreaWrapper}>
				<div className={styles.deckArea}>{deckCards}</div>
			</div>

			{playedCardActions.length !== 0 && (
				<div
					className={
						stylesB.wrapper + " " + styles.optionsOverlayWrapper
					}
				>
					<div className={styles.optionsOverlay}>
						<h1>Choose an action:</h1>

						<div className={stylesB.buttonWrapper}>
							{playedCardActions.map(
								(action: any, index: number) => {
									return (
										<button
											className={
												stylesB.buttonBase +
												" " +
												stylesB.buttonFilledSecondary
											}
											key={index}
											onClick={() => {
												room?.send(
													"performAction",
													action
												);
												setPlayedCardActions([]);
											}}
										>
											{
												action.options[
													Object.keys(
														action.options
													)[0]
												]
											}
										</button>
									);
								}
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default PlayArea;
