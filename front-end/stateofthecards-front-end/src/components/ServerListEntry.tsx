import React from "react";
import stylesLE from "./BasicListEntry.module.css";
import styles from "./ServerListEntry.module.css";
import UserSingleton from "../config/UserSingleton";
import { Room } from "colyseus.js";
import { Redirect } from "react-router-dom";

interface IProps {
	roomId: string;
	iconUrl: string;
	serverName: string;
	gameName: string;
	playerCount: number;
	maxPlayerCount: number;
	onJoinFailed: (error: any) => void;
}

enum ServerListEntryState {
	Idle,
	RedirectJoinGame,
}

interface IState {
	currentState: ServerListEntryState;
}

class ServerListEntry extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			currentState: ServerListEntryState.Idle,
		};
	}

	render() {
		switch (this.state.currentState) {
			case ServerListEntryState.Idle:
				return this.renderServerListEntry();
			case ServerListEntryState.RedirectJoinGame:
				return (
					<Redirect
						to={
							"/match?id=" +
							UserSingleton.getInstance().getUserInfo()
								.currentRoom?.id
						}
					></Redirect>
				);
		}
	}

	renderServerListEntry() {
		return (
			<div
				className={stylesLE.entry + " " + styles.entry}
				onClick={() => {
					UserSingleton.getInstance()
						.getUserInfo()
						.colyseusClient?.joinById(this.props.roomId, {
							playerInfo: {
								firebaseUID: UserSingleton.getInstance().getUserInfo()
									.firebaseUser?.uid,
								username: UserSingleton.getInstance().getUserInfo()
									.displayName,
							},
						})
						.then((room: Room<any>) => {
							UserSingleton.getInstance().setUserInfo({
								currentRoom: room,
							});

							this.setState({
								currentState:
									ServerListEntryState.RedirectJoinGame,
							});
						})
						.catch((e) => {
							this.props.onJoinFailed(e);
						});
				}}
			>
				<div className={stylesLE.leftInfo}>
					<img src={this.props.iconUrl} alt="State" />
					<p>{this.props.serverName}</p>
				</div>

				<div className={styles.gameInfo}>
					<p>{this.props.gameName}</p>
				</div>

				<div className={stylesLE.rightInfo}>
					<p>
						{this.props.playerCount}/{this.props.maxPlayerCount}
					</p>
					<div className={styles.joinIconsWrapper}>
						<img src="icons/join-match-icon.svg" alt="Join" />
						<img
							src="icons/join-match-filled-icon.svg"
							alt="Join"
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default ServerListEntry;
