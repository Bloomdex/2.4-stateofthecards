import React, { useState, FunctionComponent } from "react";
import styles from "./GameScreen.module.css";
import stylesB from "./Base.module.css";
import UserSingleton from "./config/UserSingleton";
import { validActions, RootState } from "stateofthecards-gamelib";
import PlayArea from "./components/PlayArea";
import MatchPlayerListEntry from "./components/MatchPlayerListEntry";
import { Redirect } from "react-router-dom";

const GameScreen: FunctionComponent<{ gameState: RootState }> = ({
	gameState,
}) => {
	const room = UserSingleton.getInstance().getUserInfo().currentRoom;

	const [showSidePanel, setShowSidePanel] = useState(false);
	const [redirectDashboard, setRedirectDashboard] = useState(false);

	const hiddenStyle = showSidePanel
		? styles.sidePanelOpen
		: styles.sidePanelClosed;

	const playerList: any[] = [];

	for (let key in room?.state.players) {
		playerList.push(
			<MatchPlayerListEntry
				key={key}
				sessionId={key}
				firebaseUid={room?.state.players[key].firebaseUID}
				playerName={room?.state.players[key].username}
				disableKick={true}
			/>
		);
	}

	if (redirectDashboard) return <Redirect to="/dashboard" />;

	return (
		<div className={stylesB.wrapper + " " + stylesB.background}>
			<div className={stylesB.wrapper + " " + styles.gameScreen}>
				<PlayArea gameState={gameState} />
			</div>

			<div
				className={[
					stylesB.wrapper,
					styles.sidePanel,
					hiddenStyle,
				].join(" ")}
			>
				<div className={styles.serverInfo}>
					<h1>
						{
							UserSingleton.getInstance()?.getUserInfo()
								?.currentRoom?.state.roomName
						}
					</h1>
					<h2>
						{
							UserSingleton.getInstance()?.getUserInfo()
								?.currentRoom?.state.gameInfo.name
						}
					</h2>
				</div>

				<div className={styles.playerList}>
					<h1>Players</h1>
					<div>{playerList}</div>
				</div>

				<div className={stylesB.buttonWrapper}>
					<button
						className={
							stylesB.buttonBase +
							" " +
							stylesB.buttonFilledWarning
						}
						onClick={() => {
							UserSingleton.getInstance()
								?.getUserInfo()
								?.currentRoom?.leave();

							setRedirectDashboard(true);
						}}
					>
						Forfeit & Leave
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
