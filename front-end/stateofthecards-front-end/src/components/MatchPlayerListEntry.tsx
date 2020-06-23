import React from "react";
import styles from "./BasicListEntry.module.css";
import ILobbyInfo from "../structures/ILobbyInfo";

interface IProps {
	playerName: string;
	iconUrl: string;
	actionLabel: string;
}

interface IState {}

class MatchPlayerListEntry extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
	}

	render() {
		return (
			<div className={styles.entry}>
				<div className={styles.leftInfo}>
					<img src={this.props.iconUrl} alt="" />
					<p>{this.props.playerName}</p>
				</div>

				<div className={styles.rightInfo + " " + styles.unselectable}>
					<p>{this.props.actionLabel}</p>
				</div>
			</div>
		);
	}
}

export default MatchPlayerListEntry;
