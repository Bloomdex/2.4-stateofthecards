import React from "react";
import styles from "./QuickJoinMenu.module.css";
import stylesB from "../Base.module.css";
import ScaleLoader from "react-spinners/ScaleLoader";
import ILobbyInfo from "../structures/ILobbyInfo";

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
	lobbyInfo?: ILobbyInfo;
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
	setLobbyInfo(lobbyInfo?: ILobbyInfo) {
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
					<div className={stylesB.buttonWrapper}>
						<button
							className={
								stylesB.buttonBase +
								" " +
								stylesB.buttonFilledTertiary
							}
							onClick={() => {
								this.onClickCancel();
							}}
						>
							Leave
						</button>
					</div>
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
							Waiting for players... (
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
					<div className={stylesB.buttonWrapper}>
						<button
							className={
								stylesB.buttonBase +
								" " +
								stylesB.buttonFilledTertiary
							}
							onClick={() => {
								this.onClickCancel();
							}}
						>
							Leave
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default QuickJoinMenu;
