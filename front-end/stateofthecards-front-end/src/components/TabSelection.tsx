import React, { Component } from "react";
//import styles from "./tabSelection.module.css";

interface IProps {
	onButtonClicked: (index: number) => void;
	buttons: string[];
	cssClass: string;
	cssButtonWrapperClass: string;
	cssButtonActiveClass: string;
	cssButtonInactiveClass: string;
}

interface IState {
	buttons: string[];
	activeButton: number;
}

class MenuCard extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			buttons: props.buttons,
			activeButton: 0,
		};
	}

	setButtonActive(index: number) {
		this.setState({ activeButton: index });

		this.props.onButtonClicked(index);
	}

	render() {
		let buttons: React.ReactElement[] = [];

		this.state.buttons.forEach((button, i) => {
			let buttonClass = this.props.cssButtonInactiveClass;

			if (i == this.state.activeButton) {
				buttonClass = this.props.cssButtonActiveClass;
			}

			buttons.push(
				<div className={this.props.cssButtonWrapperClass}>
					<button
						className={buttonClass}
						onClick={() => this.setButtonActive(i)}
					>
						{button}
					</button>
				</div>
			);
		});

		return <div className={this.props.cssClass}>{buttons}</div>;
	}
}

export default MenuCard;
