import React, { useState, FunctionComponent } from "react";
import styles from "./InteractableCard.module.css";
import IGameInfo from "../structures/IGameInfo";
import UserSingleton from "../config/UserSingleton";
import FirebaseApp from "../config/Firebase";
import CardWithInfo from "../structures/CardWithInfo";

interface IProps {
	card: CardWithInfo;
	onClickCard?: () => void;
	disabled?: boolean;
}

const InteractableCard: FunctionComponent<IProps> = (props: IProps) => {
	const style = !props.disabled ? styles.interactable : styles.disabled;

	return (
		<div
			className={styles.wrapper}
			onClick={() => {
				if (!props.disabled && props.onClickCard) props.onClickCard();
			}}
		>
			<figure className={styles.card + " " + style}>
				<img src={props.card.face} alt="" />

				<div className={styles.slideOut}>
					<figcaption>
						{!props.disabled && props.card.name}
					</figcaption>
				</div>
			</figure>
		</div>
	);
};

export default InteractableCard;
