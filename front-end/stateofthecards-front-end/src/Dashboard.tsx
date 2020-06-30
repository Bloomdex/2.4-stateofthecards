import React, { Component, RefObject, createRef } from "react";
import styles from "./Dashboard.module.css";
import stylesB from "./Base.module.css";
import stylesH from "./components/HeaderBar.module.css";
import stylesMC from "./components/MenuCard.module.css";
import MenuCard from "./components/MenuCard";
import ScaleLoader from "react-spinners/ScaleLoader";
import QuickJoinMenu from "./components/QuickJoinMenu";
import AddFriendsMenu from "./components/AddFriendsMenu";
import { Redirect } from "react-router-dom";
import HeaderBar from "./components/HeaderBar";
import FirebaseApp from "./config/Firebase";
import UserSingleton from "./config/UserSingleton";
import { Room } from "colyseus.js";
import QRCode from "qrcode.react";

enum DashBoardState {
	Idle,
	RedirectServerList,
	RedirectCreateMatch,
	RedirectCreateGame,
	RedirectQuickJoin,
	Logout,
}

interface IProps {}

interface IState {
	currentState: DashBoardState;
	lobby: any;
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
	private addFriendsMenu: RefObject<AddFriendsMenu> = createRef();

	constructor(props: IProps) {
		super(props);

		this.state = {
			currentState: DashBoardState.Idle,
			lobby: undefined,
		};
	}

	render() {
		const currentRoom = UserSingleton.getInstance().getUserInfo()
			.currentRoom;

		switch (this.state.currentState) {
			case DashBoardState.Idle:
				return this.renderDashBoard();
			case DashBoardState.RedirectServerList:
				if (currentRoom) {
					currentRoom.leave();
					UserSingleton.getInstance().setUserInfo({
						currentRoom: undefined,
					});
				}
				return <Redirect to="/servers"></Redirect>;
			case DashBoardState.RedirectCreateMatch:
				return (
					<Redirect
						to={
							"/match?id=" +
							UserSingleton.getInstance().getUserInfo()
								.currentRoom?.id
						}
					></Redirect>
				);
			case DashBoardState.RedirectQuickJoin:
				return (
					<Redirect
						to={`/match?id=${
							UserSingleton.getInstance().getUserInfo()
								.currentRoom?.id
						}`}
					/>
				);
			case DashBoardState.RedirectCreateGame:
				if (currentRoom) {
					currentRoom.leave();
					UserSingleton.getInstance().setUserInfo({
						currentRoom: undefined,
					});
				}

				return <Redirect to="/create"></Redirect>;
			case DashBoardState.Logout:
				// Logout using Firebase
				if (currentRoom) {
					currentRoom.leave();
					UserSingleton.getInstance().setUserInfo({
						currentRoom: undefined,
					});
				}
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
							Welcome back
							{UserSingleton.getInstance()?.getUserInfo()
								.firebaseUser?.displayName && " "}
							{
								UserSingleton.getInstance()?.getUserInfo()
									.firebaseUser?.displayName
							}
							!
						</p>
					</div>
					<div />
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
								<div
									className={styles.cardContent}
									onClick={() => {
										this.joinFriendsCard.current?.setNextChild();
									}}
								>
									<img
										src="icons/join-friends-icon.svg"
										alt=""
									></img>
									<p>Add Friends</p>
								</div>

								<AddFriendsMenu
									onClickCancel={() => {
										this.joinFriendsCard.current?.setCurrentChild(
											0
										);
									}}
									onClickQR={() => {
										this.joinFriendsCard.current?.setNextChild();
									}}
								/>

								<div className={styles.QRCodeWrapper}>
									<QRCode
										value={
											"https://stateofthe.cards/dashboard?add_uid=" +
											UserSingleton.getInstance().getUserInfo()
												.firebaseUser?.uid
										}
									/>

									<div className={stylesB.buttonWrapper}>
										<button
											className={
												stylesB.buttonBase +
												" " +
												stylesB.buttonFilledTertiary
											}
											onClick={() => {
												this.joinFriendsCard.current?.setCurrentChild(
													1
												);
											}}
										>
											Back
										</button>
									</div>
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
								<div
									className={styles.cardContent}
									onClick={() => {
										this.createMatchCard.current?.setNextChild();

										const currentRoom = UserSingleton.getInstance().getUserInfo()
											.currentRoom;
										if (currentRoom) {
											currentRoom.leave();
											UserSingleton.getInstance().setUserInfo(
												{
													currentRoom: undefined,
												}
											);
										}

										UserSingleton.getInstance()
											.getUserInfo()
											.colyseusClient?.create(
												"game_room",
												{
													playerInfo: {
														firebaseUID: UserSingleton.getInstance().getUserInfo()
															.firebaseUser?.uid,
														username: UserSingleton.getInstance().getUserInfo()
															.displayName,
													},
												}
											)
											.then((room: Room<any>) => {
												UserSingleton.getInstance().setUserInfo(
													{
														currentRoom: room,
													}
												);

												this.setState({
													currentState:
														DashBoardState.RedirectCreateMatch,
												});
											})
											.catch((e) => {
												console.error("ERROR: ", e);
											});
									}}
								>
									<img
										src="icons/create-match-icon.svg"
										alt=""
									></img>
									<p>Create Match</p>
								</div>
								<div>
									<ScaleLoader radius={2} color={"#33658a"} />
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

										UserSingleton.getInstance()
											?.getUserInfo()
											?.colyseusClient?.joinOrCreate(
												"quick_game_room",
												{
													playerInfo: {
														firebaseUID: UserSingleton.getInstance().getUserInfo()
															.firebaseUser?.uid,
														username: UserSingleton.getInstance().getUserInfo()
															.displayName,
													},
												}
											)
											.then((room: Room<any>) => {
												UserSingleton.getInstance().setUserInfo(
													{
														currentRoom: room,
													}
												);

												room.onMessage(
													"startMatch",
													(message) => {
														this.setState({
															currentState:
																DashBoardState.RedirectQuickJoin,
														});
													}
												);

												room.state.onChange = (
													changes: any
												) => {
													let players = [];
													for (let key in room.state
														.players) {
														players.push(
															room.state.players[
																key
															].username
														);
													}

													this.quickJoinMenu.current?.setLobbyInfo(
														{
															lobbyId: room.id,
															lobbyName:
																room.state
																	.roomName,
															passwordProtected: false,
															players: players,
															gameInfo: {
																identifier:
																	room.state
																		.gameInfo
																		.identifier,
																minPlayers:
																	room.state
																		.gameInfo
																		.minPlayers,
																maxPlayers:
																	room.state
																		.gameInfo
																		.maxPlayers,
																name:
																	room.state
																		.gameInfo
																		.name,
																description:
																	room.state
																		.gameInfo
																		.description,
																cardLogo:
																	room.state
																		.gameInfo
																		.cardLogo,
																color:
																	room.state
																		.gameInfo
																		.color,
																author:
																	room.state
																		.gameInfo
																		.author,
															},
														}
													);
												};
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
											UserSingleton.getInstance()
												.getUserInfo()
												.currentRoom?.leave();
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
								<div
									className={styles.cardContent}
									onClick={() => {
										this.setState({
											currentState:
												DashBoardState.RedirectCreateGame,
										});
									}}
								>
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
