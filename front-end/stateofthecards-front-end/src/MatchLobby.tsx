import React from "react";
import ILobbyInfo from "./structures/ILobbyInfo";
import HeaderBar from "./components/HeaderBar";
import styles from "./MatchLobby.module.css";

interface IProps {}

interface IState {
	lobbyInfo: ILobbyInfo;
}

class MatchLobby extends React.Component<IProps, IState> {
	render() {
		return (
			<div className={styles.wrapper}>
				<HeaderBar>
					<img
						src="icons/quit-icon-white.svg"
						alt="exit server list"
						onClick={() => {
							console.log("Exiting lobbyyy");
						}}
					></img>
					<p>hoii</p>
					<button>Start game</button>
				</HeaderBar>
				<div className={styles.tabBar}>
					<button>Settings</button>
					<button>Players</button>
				</div>
				<div className={styles.tabContent}>
					<div className={styles.players}>
						<p>Players</p>
					</div>
					<div className={styles.settings}>
						<p>Settings</p>
					</div>
				</div>
			</div>
		);
	}

	renderSettings() {
		return <p>Settings</p>;
	}

	renderPlayers() {
		return <p>Players</p>;
	}
}

export default MatchLobby;
