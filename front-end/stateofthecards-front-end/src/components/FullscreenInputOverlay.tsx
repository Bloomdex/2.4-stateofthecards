import React, { Component } from "react";
import styles from "./FullscreenOverlay.module.css";
import stylesB from "../Base.module.css";

interface IProps {
	message?: string;
	buttonText: string;
	onClickButton: (value: string) => void;
	onClickBackButton: () => void;
	isVisible: boolean;
}

interface IState {
	inputValue: string;
}

export default class FullscreenInputOverlay extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			inputValue: "",
		};
	}

	onInputValueChange(event: React.ChangeEvent<HTMLInputElement>) {
		this.setState({ inputValue: event.target.value });
	}

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
				<div className={styles.wrapper}>
					<h1 className={styles.headMessage}>{this.props.message}</h1>

					<input
						className={
							stylesB.interactiveFont + " " + stylesB.input
						}
						onChange={(event) => {
							this.onInputValueChange(event);
						}}
					/>

					<div className={stylesB.buttonWrapper}>
						<button
							className={
								stylesB.buttonBase +
								" " +
								stylesB.buttonFilledSecondary
							}
							onClick={() => {
								this.props.onClickButton(this.state.inputValue);
							}}
						>
							{this.props.buttonText}
						</button>
					</div>

					<div className={stylesB.buttonWrapper}>
						<button
							className={
								stylesB.buttonBase +
								" " +
								stylesB.buttonFilledTertiary
							}
							onClick={() => {
								this.props.onClickBackButton();
							}}
						>
							Back
						</button>
					</div>
				</div>
			</div>
		);
	}
}
