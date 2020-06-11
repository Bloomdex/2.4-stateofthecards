import React, { Component, RefObject, createRef } from "react";
import MenuCard from "./MenuCard";
import styles from "./GameCard.module.css";
import stylesB from "../Base.module.css";
import stylesMC from "./MenuCard.module.css";
import IGameInfo from "../structures/IGameInfo";

interface IProps {
	game: IGameInfo;
}
interface IState {}

class GameCard extends Component<IProps, IState> {
	private menuCard: RefObject<MenuCard> = createRef();

	constructor(props: IProps) {
		super(props);
	}

	render() {
		return (
			<div className={styles.cardWrapper}>
				<div className={stylesMC.hoverable}>
					<MenuCard
						cssClass={styles.card}
						currentChild={0}
						ref={this.menuCard}
					>
						<img
							src={this.props.game.cardLogo.toString()}
							onClick={() => {
								this.menuCard.current?.setNextChild();
							}}
						></img>
						<div
							className={
								stylesB.rounded + " " + styles.cardFaceInfo
							}
							style={{ backgroundColor: this.props.game.color }}
						>
							<p>Select and favorite buttons</p>
						</div>
					</MenuCard>
				</div>
				<p>{this.props.game.name}</p>
			</div>
		);
	}
}

export default GameCard;
