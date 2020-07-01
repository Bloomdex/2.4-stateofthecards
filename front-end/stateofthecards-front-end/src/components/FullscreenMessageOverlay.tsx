import React, { Component } from "react";
import styles from "./FullscreenOverlay.module.css";
import stylesB from "../Base.module.css";

interface IProps {
	message?: string;
	subMessage?: string;
	buttonText: string;
	onClickButton: () => void;
	isVisible: boolean;
}

interface IState {}

export default class FullscreenMessageOverlay extends Component<
	IProps,
	IState
> {
	render() {
		let visibleStyle = this.props.isVisible
			? styles.visible
			: styles.hidden;

		return (
			<div
				className={
					stylesB.wrapper + " " + styles.overlay + " " + visibleStyle
				}
			>
				<h1 className={styles.headMessage}>{this.props.message}</h1>
				<h2 className={styles.subMessage}>{this.props.subMessage}</h2>
				<button
					className={
						stylesB.buttonBase + " " + stylesB.buttonFilledTertiary
					}
					onClick={() => {
						this.props.onClickButton();
					}}
				>
					{this.props.buttonText}
				</button>
			</div>
		);
	}
}
