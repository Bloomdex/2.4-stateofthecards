import React, { Component } from "react";
import styles from "./MatchOverview.module.css";
import stylesB from "../Base.module.css";
import MatchPlayerListEntry from "./MatchPlayerListEntry";
import UserSingleton from "../config/UserSingleton";
import LogoCard from "./LogoCard";
import { Room } from "colyseus.js";

interface Player {
	sessionId: string;
	firebaseUid: string;
	playerName: string;
}

interface IProps {
	room?: Room<any>;
}

interface IState {
	players: Player[];
}

class MatchOverview extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
		this.state = { players: [] };
	}

	componentDidMount() {
		if (this.props.room != null) {
			this.setRoomListeners();
			this.createPlayers();
		}
	}

	componentWillUnmount() {
		this.setState({ players: [] });
	}

	setRoomListeners() {
		this.props.room?.onStateChange(() => {
			this.createPlayers();
		});
	}

	createPlayers() {
		const players: Player[] = [];

		for (let key in this.props.room?.state.players) {
			let player = this.props.room?.state.players[key];

			players.push({
				sessionId: key,
				firebaseUid: player.firebaseUID,
				playerName: player.username,
			});
		}

		this.setState({ players: players });
	}

	render() {
		const roomState = UserSingleton.getInstance().getUserInfo().currentRoom
			?.state;

		if (roomState) {
			return this.renderOverview(roomState);
		} else {
			return <div className={styles.wrapper} />;
		}
	}

	renderOverview(roomState: any) {
		const isHost = UserSingleton.getInstance().checkIsRoomHost();

		const hasEnoughPlayers =
			Object.keys(roomState.players).length >=
			roomState.gameInfo.minPlayers;

		const hasTooManyPlayers =
			Object.keys(roomState.players).length >
			roomState.gameInfo.maxPlayers;

		const startMatchButtonStyle =
			hasEnoughPlayers && !hasTooManyPlayers
				? [stylesB.buttonBase, stylesB.buttonFilledPrimary].join(" ")
				: [stylesB.buttonBase, stylesB.buttonFilledDisabled].join(" ");

		let startMatchError = "";
		startMatchError = hasEnoughPlayers
			? startMatchError
			: "Not enough players!";

		startMatchError = hasTooManyPlayers
			? "Too many players!"
			: startMatchError;

		return (
			<div className={styles.wrapper}>
				<div className={styles.playerWrapper}>
					{this.state.players.map((player, index) => (
						<MatchPlayerListEntry
							key={index}
							sessionId={player.sessionId}
							firebaseUid={player.firebaseUid}
							playerName={player.playerName}
						/>
					))}
				</div>

				<div className={styles.infoWrapper}>
					{isHost && (
						<div
							className={
								stylesB.buttonWrapper + " " + styles.hostActions
							}
						>
							<div className={styles.buttonWrapper}>
								<button
									className={startMatchButtonStyle}
									disabled={
										!hasEnoughPlayers || hasTooManyPlayers
									}
									onClick={() => {
										this.startMatchAction();
									}}
								>
									Start match (
									{Object.keys(roomState.players).length}/
									{roomState.gameInfo.maxPlayers})
								</button>
							</div>
							<p className={styles.startMatchError}>
								{startMatchError}
							</p>
						</div>
					)}

					<LogoCard game={roomState.gameInfo}></LogoCard>

					<p>Min player count: {roomState.gameInfo.minPlayers}</p>
					<p>Max player count: {roomState.gameInfo.maxPlayers}</p>

					<p>Description: {roomState.gameInfo.description}</p>
				</div>
			</div>
		);
	}

	startMatchAction() {
		// Ask the server to start the match.
		UserSingleton.getInstance()
			?.getUserInfo()
			?.currentRoom?.send("startMatch");
	}
}

export default MatchOverview;
