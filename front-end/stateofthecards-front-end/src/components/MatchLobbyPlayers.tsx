import React, { Component } from "react";
import styles from "./MatchLobbyPlayers.module.css";
import MatchPlayerListEntry from "./MatchPlayerListEntry";

interface IProps {}

interface IState {}

class MatchLobbyPlayers extends Component<IProps, IState> {
	render() {
		return (
			<div className={styles.pageWrapper}>
				<MatchPlayerListEntry
					key="1"
					sessionId=""
					firebaseUid=""
					playerName="G3t"
				/>
				<MatchPlayerListEntry
					key="2"
					sessionId=""
					firebaseUid=""
					playerName="R3kt"
				/>
				<MatchPlayerListEntry
					key="3"
					sessionId=""
					firebaseUid=""
					playerName="U"
				/>
				<MatchPlayerListEntry
					key="4"
					sessionId=""
					firebaseUid=""
					playerName="Knub"
				/>
			</div>
		);
	}
}

export default MatchLobbyPlayers;
