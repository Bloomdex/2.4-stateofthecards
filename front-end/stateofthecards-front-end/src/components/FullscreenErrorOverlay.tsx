import React, { Component } from "react";
import styles from "./FullscreenErrorOverlay.module.css";
import stylesB from "../Base.module.css";

interface IProps {
	message?: string;
	buttonText: string;
	onClickButton: () => void;
	isVisible: boolean;
}

interface IState {}

export class FullscreenErrorOverlay extends Component<IProps, IState> {
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
				<h1 className={styles.errorMessage}>{this.props.message}</h1>
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
