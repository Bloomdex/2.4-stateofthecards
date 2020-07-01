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
	onJoinPressed: (roomId: string) => void;
}

interface IState {}

class ServerListEntry extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
	}

	render() {
		return (
			<div
				className={stylesLE.entry + " " + styles.entry}
				onClick={() => {
					this.props.onJoinPressed(this.props.roomId);
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
