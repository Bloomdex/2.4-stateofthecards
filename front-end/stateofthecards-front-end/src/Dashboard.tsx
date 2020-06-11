import React, { Component, RefObject, createRef } from "react";
import styles from "./Dashboard.module.css";
import stylesB from "./Base.module.css";
import stylesH from "./components/HeaderBar.module.css";
import stylesMC from "./components/MenuCard.module.css";
import MenuCard from "./components/MenuCard";
import ScaleLoader from "react-spinners/ScaleLoader";
import QuickJoinMenu from "./components/QuickJoinMenu";
import { Redirect } from "react-router-dom";
import HeaderBar from "./components/HeaderBar";
import FirebaseApp from "./config/Firebase";
import UserSingleton from "./config/UserSingleton";

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
				// Logout using Firebase
				FirebaseApp.auth().signOut();
				return <Redirect to="/"></Redirect>;
		}
	}

	renderDashBoard() {
		return (
			<div
				className={
					stylesB.wrapper +
					" " +
					stylesB.background +
					" " +
					styles.wrapper
				}
			>
				<HeaderBar>
					<div className={stylesB.buttonWrapper}>
						<button
							className={
								stylesB.buttonBase +
								" " +
								stylesB.buttonFilledTertiary
							}
							onClick={() => {
								this.setState({
									currentState: DashBoardState.Logout,
								});
							}}
						>
							Logout
						</button>
					</div>
					<div className={styles.infoWrapper}>
						<p className={stylesH.headerTextLarge}>
							State of the cards
						</p>
						<p className={stylesH.headerTextSmall}>
							Welcome back{" "}
							{
								UserSingleton.getInstance()?.getUserInfo()
									.firebaseUser?.email
							}
							!
						</p>
					</div>
					<div className={stylesB.buttonWrapper}>
						<button
							className={
								stylesB.buttonBase +
								" " +
								stylesB.buttonFilledSecondary
							}
						>
							Options
						</button>
					</div>
				</HeaderBar>

				<div className={styles.optionsWrapper}>
					<div className={styles.options}>
						<div
							className={
								styles.cardWrapper + " " + stylesMC.hoverable
							}
						>
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
									<p>Add Friends</p>
								</div>
								<div></div>
							</MenuCard>
						</div>

						<div
							className={
								styles.cardWrapper + " " + stylesMC.hoverable
							}
						>
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

						<div
							className={
								styles.cardWrapper + " " + stylesMC.hoverable
							}
						>
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

						<div
							className={
								styles.cardWrapper + " " + stylesMC.hoverable
							}
						>
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
														description:
															"Blackjack, formerly also Black Jack and Vingt-Un, is the American member of a global family of banking games known as Twenty-One, whose relatives include Pontoon and Vingt-et-Un. It is a comparing card game between one or more players and a dealer, where each player in turn competes against the dealer.",
														cardLogo: new URL(
															"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Jack_of_clubs_fr.svg/200px-Jack_of_clubs_fr.svg.png"
														),
														color: "#FFFFFF",
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

						<div
							className={
								styles.cardWrapper + " " + stylesMC.hoverable
							}
						>
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
