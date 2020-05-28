import React from "react";
import styles from "./QuickJoinMenu.module.css";
import ScaleLoader from "react-spinners/ScaleLoader";

enum QuickJoinState {
	Idle,
	Searching,
	InLobby,
}

interface IProps {
	onClickCancel: () => void;
}

interface IState {
	currentState: QuickJoinState;
	lobbyInfo?: LobbyInfo;
}

interface LobbyInfo {
	// The current players connected to the lobby
	//  Should not use string-type in the future.
	//  so that a player can press on a different,
	//  player to show info.
	players: string[];

	// The id of the game so it can
	//  be fetched by the user.
	gameInfo: GameInfo;

	// Should be an enum similar to:
	//  Waiting, Preparing, Post
	state: string;
}

// Temporary interface that contains info about
//  the game that is going to be played.
interface GameInfo {
	minPlayers: number;
	maxPlayers: number;
	name: string;
}

class QuickJoinMenu extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			currentState: QuickJoinState.Idle,
			lobbyInfo: undefined,
		};
	}

	onClickCancel() {
		this.props.onClickCancel();
		this.setState({ currentState: QuickJoinState.Idle });
	}

	// Use this  method when info about a lobby has been retrieved.
	//  Will automatically change the view to the lobby or searching view.
	setLobbyInfo(lobbyInfo?: LobbyInfo) {
		// Set the state depending on the given lobby-info
		if (!lobbyInfo)
			this.setState({ currentState: QuickJoinState.Searching });
		else this.setState({ currentState: QuickJoinState.InLobby });

		this.setState({ lobbyInfo: lobbyInfo });
	}

	render() {
		switch (this.state.currentState) {
			case QuickJoinState.Idle:
				return (
					<div className={styles.frameWrapper}>
						<div className={styles.frame}></div>
					</div>
				);
			case QuickJoinState.Searching:
				return this.renderSearching();
			case QuickJoinState.InLobby:
				return this.renderLobby();
		}
	}

	renderSearching() {
		return (
			<div className={styles.frameWrapper}>
				<div className={styles.frame}>
					<div className={styles.gameInfo}>
						<p>Looking for match...</p>
					</div>
					<ScaleLoader radius={2} color={"#33658a"} />
					<img
						src="icons/quit-icon.svg"
						alt="Leave"
						onClick={() => {
							this.onClickCancel();
						}}
					/>
				</div>
			</div>
		);
	}

	renderLobby() {
		return (
			<div className={styles.frameWrapper}>
				<div className={styles.frame}>
					<div className={styles.gameInfo}>
						<p>{this.state.lobbyInfo?.gameInfo.name}</p>
						<p>
							{this.state.lobbyInfo?.state} (
							{this.state.lobbyInfo?.players.length}/
							{this.state.lobbyInfo?.gameInfo.maxPlayers})
						</p>
					</div>
					<div className={styles.tableWrapper}>
						<table>
							<tbody>
								{this.state.lobbyInfo?.players.map(
									(username) => (
										<tr key={username}>
											<td>{username}</td>
										</tr>
									)
								)}
							</tbody>
						</table>
					</div>
					<img
						className={styles.quitIcon}
						src="icons/quit-icon.svg"
						alt="Leave"
						onClick={() => {
							this.onClickCancel();
						}}
					/>
				</div>
			</div>
		);
	}
}

export default QuickJoinMenu;
