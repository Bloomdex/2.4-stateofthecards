import React, { Component } from "react";
import styles from "./MenuCard.module.css";
import ReactCardFlip from "react-card-flip";

interface IProps {
	children: React.ReactElement[];
	currentChild: number;
}

interface IState {
	children: React.ReactElement[];
	isFlipped: boolean;
	frontChild: React.ReactElement;
	backChild: React.ReactElement;
	currentIndex: number;
}

class MenuCard extends Component<IProps, IState> {
	private firstCardClass: string = "";
	private secondCardClass: string = "";

	constructor(props: IProps) {
		super(props);

		this.state = {
			children: props.children,
			isFlipped: false,
			frontChild: props.children[props.currentChild],
			backChild:
				props.children[
					(props.currentChild + 1) % props.children.length
				],
			currentIndex: props.currentChild,
		};
	}

	setCurrentChild(index: number) {
		if (index === this.state.currentIndex) return;
		else this.setState({ currentIndex: index });

		// Get the current flip-state
		let currentSide = this.state.isFlipped;

		// Change the element on the other-side
		if (currentSide) {
			// Switch to back.
			this.setState({
				frontChild: this.state.children[index],
			});
		} else {
			// Switch to front.
			this.setState({
				backChild: this.state.children[index],
			});
		}

		// Flip card
		this.setState({ isFlipped: !this.state.isFlipped });
	}

	render() {
		// Only display the currentChild
		return (
			<ReactCardFlip
				isFlipped={this.state.isFlipped}
				flipDirection="horizontal"
			>
				<div className={styles.card + " " + this.firstCardClass}>
					{this.state.frontChild}
				</div>

				<div className={styles.card + " " + this.secondCardClass}>
					{this.state.backChild}
				</div>
			</ReactCardFlip>
		);
	}
}

export default MenuCard;
