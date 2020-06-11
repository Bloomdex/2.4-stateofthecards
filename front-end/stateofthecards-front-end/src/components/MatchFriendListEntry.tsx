import React from "react";
import styles from "./BasicListEntry.module.css";
import ILobbyInfo from "../structures/ILobbyInfo";

interface IProps {}

interface IState {}

class MatchFriendListEntry extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
	}

	render() {
		return (
			<div className={styles.entry}>
				<div className={styles.leftInfo}>
					<img src="icons/friends-icon.svg" alt="" />
					<p>Friend name here</p>
				</div>

				<div className={styles.rightInfo + " " + styles.unselectable}>
					<p>(Double click to invite)</p>
				</div>
			</div>
		);
	}
}

export default MatchFriendListEntry;
