import React from "react";
import styles from "./ServerListEntry.module.css";
import ILobbyInfo from "../structures/ILobbyInfo";

interface IProps {
	lobbyInfo: ILobbyInfo;
}

interface IState {
	lobbyInfo: ILobbyInfo;
}

class ServerListEntry extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			lobbyInfo: this.props.lobbyInfo,
		};
	}

	render() {
		return (
			<div className={styles.entry}>
				<div className={styles.serverInfo}>
					<img src="icons/open-match-icon.svg" alt="State" />
					<p>{this.props.lobbyInfo.lobbyName}</p>
				</div>

				<div className={styles.gameInfo}>
					<p>{this.props.lobbyInfo.gameInfo.name}</p>
				</div>

				<div className={styles.joinInfo}>
					<p>
						{this.props.lobbyInfo.players.length}/
						{this.props.lobbyInfo.gameInfo.maxPlayers}
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
