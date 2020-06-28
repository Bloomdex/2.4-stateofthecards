import React, { Component } from "react";
import styles from "./GameCard.module.css";

interface IProps {
	imageUrl: string;
	cssClass?: string;
}

interface IState {}

class GameCard extends Component<IProps, IState> {
	render() {
		return (
			<figure className={styles.card + " " + this.props.cssClass}>
				<img alt="" src={this.props.imageUrl} />
			</figure>
		);
	}
}

export default GameCard;
