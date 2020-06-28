import React, { FunctionComponent } from "react";
import styles from "./PlayArea.module.css";
import UserSingleton from "../config/UserSingleton";
import GameCard from "./GameCard";
import { RootState, validActions } from "stateofthecards-gamelib";
import { Rnd } from "react-rnd";

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

	const deckCards = gameState.cards.hands[
		room?.state.playerIndices[room?.sessionId]
	]?.map((value: any, index) => {
		return (
			<div onDoubleClick={() => selectPlayCard(index)}>
				<GameCard cssClass={styles.card} imageUrl={value.face} />
			</div>
		);
	});

	const topCard: any =
		gameState.cards.played[gameState.cards.played.length - 1];

	const availableCardCount = gameState.cards.remaining.length;

	const selectPlayCard = (index: number) => {
		let validAction = false;
		let matchedActions: any[] = [];

		try {
			let deck =
				gameState.cards.hands[
					room?.state.playerIndices[room?.sessionId]
				];
			let card = deck[index];

			const validActionsList =
				gameState != null ? validActions(gameState) : [];
			validActionsList.forEach((action: any) => {
				if (
					action.type === 1 &&
					action.payload.tags[0] === card.tags[0] &&
					action.payload.tags[1] === card.tags[1]
				) {
					validAction = true;
					matchedActions.push(action);
				}
			});
		} catch (e) {
			console.log(e);
			console.error("ACTION WAS INVALID.");
		} finally {
			if (validAction) {
				if (matchedActions.length > 1) {
					console.log(
						"THIS CARD HAS MULTIPLE ACTIONSSSSSSSSSSSSSSSSSSSSSS"
					);
					// Send first action for now.
					room?.send("performAction", matchedActions[0]);
				} else {
					console.log("ACTION WAS VALID, SENDING...");
					room?.send("performAction", matchedActions[0]);
				}
			} else {
				console.error("ACTION WAS INVALID.");
			}
		}
	};

	return (
		<div className={styles.wrapper}>
			<div className={styles.playedCardsArea}>
				<div className={styles.dropArea}>
					<GameCard cssClass={styles.card} imageUrl={topCard.face} />
				</div>

				<div>
					<GameCard
						cssClass={styles.card}
						imageUrl={room?.state.gameInfo.cardLogo}
					/>
					<label>Cards On Stack: {availableCardCount};</label>
				</div>
			</div>

			<div className={styles.deckArea}>{deckCards}</div>
		</div>
	);
};

export default PlayArea;
