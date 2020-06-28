import React, { useState, FunctionComponent } from "react";
import styles from "./GameScreen.module.css";
import stylesB from "./Base.module.css";
import UserSingleton from "./config/UserSingleton";
import { validActions, RootState } from "stateofthecards-gamelib";
import PlayArea from "./components/PlayArea";

const GameScreen: FunctionComponent<{ gameState: RootState }> = ({
	gameState,
}) => {
	const room = UserSingleton.getInstance().getUserInfo().currentRoom;

	const [showSidePanel, setShowSidePanel] = useState(false);

	const hiddenStyle = showSidePanel
		? styles.sidePanelOpen
		: styles.sidePanelClosed;

	const playerList: any[] = [];

	for (let key in room?.state.players) {
		playerList.push(<p key={key}>{room?.state.players[key].username}</p>);
	}

	const validActionsList = gameState != null ? validActions(gameState) : [];

	// If it is this clients turn.
	const isMyTurn =
		room?.state.playerIndices[room?.sessionId] ===
		gameState.turnInfo.current;

	const myTurnMessage = isMyTurn ? <h1>YOUR TURN!!!!!!!!!!!!!!!!!!</h1> : "";

	return (
		<div className={stylesB.wrapper + " " + stylesB.background}>
			<div className={stylesB.wrapper + " " + styles.gameScreen}>
				<div className={styles.playArea}>
					<PlayArea gameState={gameState} />
				</div>

				<div className={styles.actionPanel}>
					{myTurnMessage}
					possible actions:
					<ul>
						{validActionsList.map((action: any, index) => {
							const displayValue = {
								type: action.type,
								tags: [],
								options: {},
								effects: [],
							};

							if (action.payload) {
								displayValue.tags = action.payload.tags;

								if (action.payload.effects) {
									displayValue.effects =
										action.payload.effects;
								}
							}

							if (action.options) {
								displayValue.options = action.options;
							}

							return (
								<li key={index}>
									<button
										onClick={() => {
											room?.send("performAction", action);
										}}
									>
										send
									</button>
									<pre>
										{JSON.stringify(displayValue, null, 2)}
									</pre>
								</li>
							);
						})}
					</ul>
					<label>
						players:{" "}
						{JSON.stringify(room?.state.playerIndices, null, 2)}
					</label>
					<label>currentPlayer: {gameState.turnInfo.current}</label>
				</div>
			</div>
			<div
				className={[
					stylesB.wrapper,
					styles.sidePanel,
					hiddenStyle,
				].join(" ")}
			>
				<h1 className={styles.serverName}>
					{
						UserSingleton.getInstance()?.getUserInfo()?.currentRoom
							?.state.roomName
					}
				</h1>
				<h2 className={styles.serverName}>
					{
						UserSingleton.getInstance()?.getUserInfo()?.currentRoom
							?.state.gameInfo.name
					}
				</h2>
				<div>
					<h1>Players</h1>
					<div>{playerList}</div>
				</div>
				<div className={stylesB.buttonWrapper}>
					<button
						className={
							stylesB.buttonBase +
							" " +
							stylesB.buttonFilledTertiary
						}
						onClick={() => {}}
					>
						Leave game
					</button>
				</div>
			</div>
			<div className={styles.floatingButtonWrapper}>
				<button
					className={
						stylesB.buttonBase + " " + stylesB.buttonFilledSecondary
					}
					onClick={() => {
						setShowSidePanel(!showSidePanel);
					}}
				>
					Sidepanel
				</button>
			</div>
		</div>
	);
};

export default GameScreen;
