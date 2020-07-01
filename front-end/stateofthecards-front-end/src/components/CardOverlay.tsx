import React from "react";
import styles from "./CardOverlay.module.css";
import stylesB from "../Base.module.css";

interface IProps {
	children: React.ReactElement[];
	cssClass: string;
}

interface IState {}

class CardOverlay extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {};
	}

	render() {
		return <div className={this.props.cssClass}>{this.props.children}</div>;
	}
}

export default CardOverlay;
