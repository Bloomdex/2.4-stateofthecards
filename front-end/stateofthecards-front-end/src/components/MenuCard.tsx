import React, { Component } from "react";
import styles from "./MenuCard.module.css";
import stylesB from "../Base.module.css";
import ReactCardFlip from "react-card-flip";

interface IProps {
	children: React.ReactElement[];
	currentChild: number;
	cssClass: string;
}

interface IState {
	children: React.ReactElement[];
	isFlipped: boolean;
	frontChild: React.ReactElement;
	backChild: React.ReactElement;
	currentIndex: number;
	cssClass: string;
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
			cssClass: props.cssClass,
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

	setNextChild() {
		let newIndex =
			(this.state.currentIndex + 1) % this.state.children.length;

		this.setCurrentChild(newIndex);
	}

	render() {
		// Shows one of the two childs depending on the isFlipped state
		return (
			<ReactCardFlip
				isFlipped={this.state.isFlipped}
				flipDirection="horizontal"
			>
				<div
					className={
						stylesB.rounded +
						" " +
						styles.cardFace +
						" " +
						this.state.cssClass
					}
				>
					{this.state.frontChild}
				</div>
				<div
					className={
						stylesB.rounded +
						" " +
						styles.cardFace +
						" " +
						this.state.cssClass
					}
				>
					{this.state.backChild}
				</div>
			</ReactCardFlip>
		);
	}
}

export default MenuCard;
