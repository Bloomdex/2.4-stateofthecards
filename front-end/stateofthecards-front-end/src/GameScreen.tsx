import React, {
	Component,
	RefObject,
	createRef,
	FormEvent,
	useState,
	FunctionComponent,
} from "react";
import styles from "./GameScreen.module.css";
import stylesB from "./Base.module.css";
import MenuCard from "./components/MenuCard";
import UserSingleton from "./config/UserSingleton";

const GameScreenBetter: FunctionComponent = () => {
	const [showSidePanel, setShowSidePanel] = useState(true);

	const hiddenStyle = showSidePanel
		? styles.sidePanelOpen
		: styles.sidePanelClosed;

	return (
		<div className={stylesB.wrapper + " " + stylesB.background}>
			<div className={stylesB.wrapper + " " + styles.gameScreen}>
				<div className={styles.playArea}>
					<div className={styles.playerCardsArea}>
						<MenuCard
							cssClass={styles.cardPreview}
							currentChild={0}
						>
							<img
								src="https://i.forfun.com/jhhpvwke.jpeg"
								width={"300px"}
							></img>
							<div />
						</MenuCard>
					</div>
					<div className={styles.deckArea}>
						<h1>Deck</h1>
					</div>
				</div>

				<div className={styles.actionPanel}>
					<button>Grab card</button>
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
				<div>
					<h1>Players</h1>
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

export default GameScreenBetter;
