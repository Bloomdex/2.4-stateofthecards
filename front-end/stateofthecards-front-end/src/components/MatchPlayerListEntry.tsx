import React from "react";
import styles from "./BasicListEntry.module.css";
import ILobbyInfo from "../structures/ILobbyInfo";

interface IProps {}

interface IState {}

class MatchPlayerListEntry extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
	}

	render() {
		return (
			<div className={styles.entry}>
				<div className={styles.leftInfo}>
					<img src="icons/full-match-icon.svg" alt="" />
					<p>Player name here</p>
				</div>

				<div className={styles.rightInfo + " " + styles.unselectable}>
					<p>(Double click to kick)</p>
				</div>
			</div>
		);
	}
}

export default MatchPlayerListEntry;
