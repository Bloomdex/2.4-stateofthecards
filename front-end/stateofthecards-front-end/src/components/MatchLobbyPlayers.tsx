import React, { Component } from "react";
import styles from "./MatchLobbyPlayers.module.css";
import MatchPlayerListEntry from "./MatchPlayerListEntry";
import MatchFriendListEntry from "./MatchFriendListEntry";

interface IProps {}

interface IState {}

class MatchLobbyPlayers extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
	}

	render() {
		return (
			<div className={styles.pageWrapper}>
				<MatchFriendListEntry />
				<MatchFriendListEntry />
				<MatchFriendListEntry />
				<MatchFriendListEntry />
			</div>
		);
	}
}

export default MatchLobbyPlayers;
