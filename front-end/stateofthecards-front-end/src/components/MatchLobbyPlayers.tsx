import React, { Component } from "react";
import styles from "./MatchLobbyPlayers.module.css";
import MatchPlayerListEntry from "./MatchPlayerListEntry";

interface IProps {}

interface IState {}

class MatchLobbyPlayers extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
	}

	render() {
		return (
			<div className={styles.pageWrapper}>
				<MatchPlayerListEntry
					key="1"
					playerName="G3t"
					iconUrl={"icons/friends-icon.svg"}
					actionLabel={"Double click to invite."}
				/>
				<MatchPlayerListEntry
					key="2"
					playerName="R3kt"
					iconUrl={"icons/friends-icon.svg"}
					actionLabel={"Double click to invite."}
				/>
				<MatchPlayerListEntry
					key="3"
					playerName="U"
					iconUrl={"icons/friends-icon.svg"}
					actionLabel={"Double click to invite."}
				/>
				<MatchPlayerListEntry
					key="4"
					playerName="Knub"
					iconUrl={"icons/friends-icon.svg"}
					actionLabel={"Double click to invite."}
				/>
			</div>
		);
	}
}

export default MatchLobbyPlayers;
