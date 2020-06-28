import React, { Component } from "react";

interface IProps {
	onButtonClicked: (index: number) => void;
	buttons: string[];
	cssClass: string;
	cssButtonWrapperClass: string;
	cssButtonActiveClass: string;
	cssButtonInactiveClass: string;
}

interface IState {
	activeButton: number;
}

class MenuCard extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			activeButton: 0,
		};
	}

	setButtonActive(index: number) {
		this.setState({ activeButton: index });

		this.props.onButtonClicked(index);
	}

	render() {
		let buttons: React.ReactElement[] = [];

		this.props.buttons.forEach((button, i) => {
			let buttonClass = this.props.cssButtonInactiveClass;

			if (i === this.state.activeButton) {
				buttonClass = this.props.cssButtonActiveClass;
			}

			buttons.push(
				<div key={button} className={this.props.cssButtonWrapperClass}>
					<button
						key={button}
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
