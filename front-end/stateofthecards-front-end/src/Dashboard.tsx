import React, { Component, RefObject, createRef } from "react";
import styles from "./Dashboard.module.css";
import MenuCard from "./components/MenuCard";
import ScaleLoader from "react-spinners/ScaleLoader";
import QuickJoinMenu from "./components/QuickJoinMenu";
import { Redirect } from "react-router-dom";
import HeaderBar from "./components/HeaderBar";

enum DashBoardState {
	Idle,
	RedirectJoinFriends,
	RedirectServerList,
	RedirectCreateMatch,
	RedirectQuickJoin,
	RedirectCreateGame,
	Logout,
	Settings,
}

interface IProps {}

interface IState {
	currentState: DashBoardState;
}

class Dashboard extends Component<IProps, IState> {
	// Cards
	private joinFriendsCard: RefObject<MenuCard> = createRef();
	private serverListCard: RefObject<MenuCard> = createRef();
	private createMatchCard: RefObject<MenuCard> = createRef();
	private quickJoinCard: RefObject<MenuCard> = createRef();
	private createGameCard: RefObject<MenuCard> = createRef();

	// Menu's
	private quickJoinMenu: RefObject<QuickJoinMenu> = createRef();

	constructor(props: IProps) {
		super(props);

		this.state = {
			currentState: DashBoardState.Idle,
		};
	}

	render() {
		switch (this.state.currentState) {
			case DashBoardState.Idle:
				return this.renderDashBoard();
			case DashBoardState.RedirectServerList:
				return <Redirect to="/servers"></Redirect>;
			case DashBoardState.Logout:
				// Add log-out functionality here.
				return <Redirect to="/"></Redirect>;
		}
	}

	renderDashBoard() {
		return (
			<div className={styles.wrapper}>
				<HeaderBar>
					<img
						src="icons/quit-icon-white.svg"
						alt="logout"
						onClick={() => {
							this.setState({
								currentState: DashBoardState.Logout,
							});
						}}
					></img>
					<div className={styles.message}>
						<p>State of the Cards</p>
						<p>Welcome back SPELER01!</p>
					</div>
					<img
						src="icons/settings-icon-white.svg"
						alt="settings"
					></img>
				</HeaderBar>
				<div className={styles.optionsWrapper}>
					<div className={styles.options}>
						<div className={styles.cardWrapper}>
							<MenuCard
								cssClass={styles.card}
								currentChild={0}
								ref={this.joinFriendsCard}
							>
								<div className={styles.cardContent}>
									<img
										src="icons/join-friends-icon.svg"
										alt=""
									></img>
									<p>Join Friends</p>
								</div>
								<div></div>
							</MenuCard>
						</div>

						<div className={styles.cardWrapper}>
							<MenuCard
								cssClass={styles.card}
								currentChild={0}
								ref={this.serverListCard}
							>
								<div
									className={styles.cardContent}
									onClick={() => {
										this.setState({
											currentState:
												DashBoardState.RedirectServerList,
										});
									}}
								>
									<img
										src="icons/server-list-icon.svg"
										alt=""
									></img>
									<p>Server List</p>
								</div>
								<div></div>
							</MenuCard>
						</div>

						<div className={styles.cardWrapper}>
							<MenuCard
								cssClass={styles.card}
								currentChild={0}
								ref={this.createMatchCard}
							>
								<div className={styles.cardContent}>
									<img
										src="icons/create-match-icon.svg"
										alt=""
									></img>
									<p>Create Match</p>
								</div>
								<div></div>
							</MenuCard>
						</div>

						<div className={styles.cardWrapper}>
							<MenuCard
								cssClass={styles.card}
								currentChild={0}
								ref={this.quickJoinCard}
							>
								<div
									className={styles.cardContent}
									onClick={() => {
										this.quickJoinCard.current?.setNextChild();

										// Start outgoing search request here
										this.quickJoinMenu.current?.setLobbyInfo(
											undefined
										);

										// Fake searching for a lobby
										const promise = new Promise((resolve) =>
											setTimeout(resolve, 1500)
										);

										// Keep update-ing the lobby-info
										//  Until a game starts.
										promise.then(() => {
											this.quickJoinMenu.current?.setLobbyInfo(
												{
													lobbyId: 0,
													lobbyName:
														"QuickJoinLobby01",
													passwordProtected: false,
													players: [
														"Appa",
														"Momo",
														"Zuko",
														"Sokka",
														"Katara",
														"Iroh",
														"Zhao",
														"Ozai",
														"Toph",
														"Aang",
														"Cabbage Merchant",
														"King Boomi",
														"Zuki",
													],
													gameInfo: {
														minPlayers: 2,
														maxPlayers: 6,
														name: "Blackjack",
													},
													state:
														"Waiting for players",
												}
											);
										});
									}}
								>
									<img
										src="icons/quick-join-icon.svg"
										alt=""
									></img>
									<p>Quick Join</p>
								</div>
								<div
									className={
										styles.cardContent +
										" " +
										styles.quickJoinCard
									}
								>
									<QuickJoinMenu
										ref={this.quickJoinMenu}
										onClickCancel={() => {
											this.quickJoinCard.current?.setNextChild();
										}}
									></QuickJoinMenu>
								</div>
							</MenuCard>
						</div>

						<div className={styles.cardWrapper}>
							<MenuCard
								cssClass={styles.card}
								currentChild={0}
								ref={this.createGameCard}
							>
								<div className={styles.cardContent}>
									<img
										src="icons/create-game-icon.svg"
										alt=""
									></img>
									<p>Create Game</p>
								</div>
								<div className={styles.cardContent}>
									<ScaleLoader
										height={35}
										width={4}
										radius={2}
										margin={2}
										color={"#33658a"}
									/>
								</div>
							</MenuCard>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Dashboard;
