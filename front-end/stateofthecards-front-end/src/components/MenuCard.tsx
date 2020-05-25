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
		// If index has not changed: do nothing.
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
		// Shows one of the two childs depending on the isFlipped state
		return (
			<ReactCardFlip
				isFlipped={this.state.isFlipped}
				flipDirection="horizontal"
			>
				<div className={styles.card}>{this.state.frontChild}</div>
				<div className={styles.card}>{this.state.backChild}</div>
			</ReactCardFlip>
		);
	}
}

export default MenuCard;
