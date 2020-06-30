import React, { Component } from "react";
import styles from "./MatchLobbySettings.module.css";
import stylesB from "../Base.module.css";
import CollapsibleContent from "./CollapsibleContent";
import TabSelection from "./TabSelection";
import UserSingleton from "../config/UserSingleton";
import FirebaseApp from "../config/Firebase";
import LogoCard from "./LogoCard";

interface IProps {}

enum Tab {
	AllGames,
	FavoriteGames,
	MyGames,
	FriendGames,
}

interface IState {
	currentTab: Tab;
	allGames: JSX.Element[];
	favoriteGames: JSX.Element[];
	myGames: JSX.Element[];
	friendGames: JSX.Element[];
}

class MatchLobbySettings extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			currentTab: Tab.AllGames,
			allGames: [],
			favoriteGames: [],
			myGames: [],
			friendGames: [],
		};
	}

	componentWillMount() {
		this.loadAllGames();
	}

	onInputServerNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		UserSingleton.getInstance()
			.getUserInfo()
			.currentRoom?.send("setRoomName", event.target.value);
	};

	onInputServerPasswordChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		UserSingleton.getInstance()
			.getUserInfo()
			.currentRoom?.send("setRoomPassword", event.target.value);
	};

	render() {
		return (
			<div className={styles.pageWrapper}>
				<div className={styles.sidePanel}>
					<CollapsibleContent
						name="Server games"
						cssClass=""
						cssClassHeader={stylesB.collapsibleHeader}
						cssClassContent={stylesB.collapsibleContent}
						isCollapsed={false}
					>
						<div className={styles.settings}>
							<input
								className={stylesB.input}
								placeholder="Search..."
							></input>

							<TabSelection
								onButtonClicked={(i) => {
									this.switchTab(i);
								}}
								buttons={[
									"All Games",
									"Favorite games",
									"My Games",
									"Friends games",
								]}
								cssClass={styles.filterButtons}
								cssButtonWrapperClass={stylesB.buttonWrapper}
								cssButtonActiveClass={
									stylesB.buttonBase +
									" " +
									stylesB.buttonFilledPrimary
								}
								cssButtonInactiveClass={
									stylesB.buttonBase +
									" " +
									stylesB.buttonFilledSecondary
								}
							/>
						</div>
						<div />
					</CollapsibleContent>

					<CollapsibleContent
						name="Server settings"
						cssClass=""
						cssClassHeader={stylesB.collapsibleHeader}
						cssClassContent={stylesB.collapsibleContent}
						isCollapsed={false}
					>
						<div className={styles.settings}>
							<input
								className={stylesB.input}
								placeholder="Server name"
								maxLength={40}
								onChange={this.onInputServerNameChange}
								defaultValue={
									UserSingleton.getInstance().getUserInfo()
										.currentRoom?.state.roomName
								}
							/>

							<input
								className={stylesB.input}
								placeholder="Server password"
								maxLength={64}
								onChange={this.onInputServerPasswordChange}
								defaultValue={
									UserSingleton.getInstance().getUserInfo()
										.currentRoom?.state.roomPassword
								}
							/>
						</div>
						<div />
					</CollapsibleContent>
				</div>

				{this.renderTab()}
			</div>
		);
	}

	switchTab(index: number) {
		if (index === 0) {
			this.loadAllGames();
		} else if (index === 1) {
			this.loadFavoriteGames();
		} else if (index === 2) {
			this.loadMyGames();
		} else if (index === 3) {
			this.loadFriendGames();
		}
	}

	renderTab() {
		switch (this.state.currentTab) {
			case Tab.AllGames:
				return (
					<div className={styles.gamesCollection}>
						{this.state.allGames}
					</div>
				);
			case Tab.FavoriteGames:
				return (
					<div className={styles.gamesCollection}>
						{this.state.favoriteGames}
					</div>
				);
			case Tab.MyGames:
				return (
					<div className={styles.gamesCollection}>
						{this.state.myGames}
					</div>
				);
			case Tab.FriendGames:
				return (
					<div className={styles.gamesCollection}>
						{this.state.friendGames}
					</div>
				);
		}
	}

	loadAllGames() {
		FirebaseApp.database()
			.ref("/games")
			.once("value", (snapshot) => {
				let allGames: JSX.Element[] = [];

				snapshot.forEach((value) => {
					if (value) {
						const game = value.val();
						const key = value.key!;

						const gameInfo = {
							identifier: key,
							minPlayers: game.minPlayers,
							maxPlayers: game.maxPlayers,
							name: game.name,
							description: game.description,
							cardLogo: game.cardLogo,
							color: game.color,
							author: game.author,
						};

						allGames.push(
							<LogoCard
								key={gameInfo.identifier}
								game={gameInfo}
								showExtraInfo={true}
								onClickCard={() =>
									UserSingleton.getInstance()
										.getUserInfo()
										.currentRoom?.send(
											"setGame",
											gameInfo.identifier
										)
								}
							></LogoCard>
						);
					}
				});

				this.setState({ allGames: allGames, currentTab: Tab.AllGames });
			});
	}

	async loadFavoriteGames() {
		const userUid = UserSingleton.getInstance().getUserInfo().firebaseUser
			?.uid;
		let favoriteGameKeys: string[] = [];

		await FirebaseApp.database()
			.ref("users/" + userUid + "/favorites")
			.once("value", (snapshot) => {
				snapshot.forEach((value) => {
					if (value && value.key) {
						favoriteGameKeys.push(value.key);
					}
				});
			});

		if (!favoriteGameKeys) return;

		let favoriteGames: JSX.Element[] = [];
		for (let i = 0; i < favoriteGameKeys.length; i++) {
			let gameKey = favoriteGameKeys[i];

			await FirebaseApp.database()
				.ref("/games/" + gameKey)
				.once("value", (snapshot) => {
					const game = snapshot.val();

					if (game) {
						const gameInfo = {
							identifier: gameKey,
							minPlayers: game.minPlayers,
							maxPlayers: game.maxPlayers,
							name: game.name,
							description: game.description,
							cardLogo: game.cardLogo,
							color: game.color,
							author: game.author,
						};

						favoriteGames.push(
							<LogoCard
								key={gameInfo.identifier}
								game={gameInfo}
								showExtraInfo={true}
								onClickCard={() =>
									UserSingleton.getInstance()
										.getUserInfo()
										.currentRoom?.send(
											"setGame",
											gameInfo.identifier
										)
								}
							></LogoCard>
						);
					}
				});
		}

		this.setState({
			favoriteGames: favoriteGames,
			currentTab: Tab.FavoriteGames,
		});
	}

	async loadMyGames() {
		const userUid = UserSingleton.getInstance().getUserInfo().firebaseUser
			?.uid;
		let myGameKeys: string[] = [];

		await FirebaseApp.database()
			.ref("users/" + userUid + "/games")
			.once("value", (snapshot) => {
				snapshot.forEach((value) => {
					if (value && value.key) {
						myGameKeys.push(value.key);
					}
				});
			});

		if (!myGameKeys) return;

		let myGames: JSX.Element[] = [];
		for (let i = 0; i < myGameKeys.length; i++) {
			let gameKey = myGameKeys[i];

			await FirebaseApp.database()
				.ref("/games/" + gameKey)
				.once("value", (snapshot) => {
					const game = snapshot.val();

					if (game) {
						const gameInfo = {
							identifier: gameKey,
							minPlayers: game.minPlayers,
							maxPlayers: game.maxPlayers,
							name: game.name,
							description: game.description,
							cardLogo: game.cardLogo,
							color: game.color,
							author: game.author,
						};

						myGames.push(
							<LogoCard
								key={gameInfo.identifier}
								game={gameInfo}
								showExtraInfo={true}
								onClickCard={() =>
									UserSingleton.getInstance()
										.getUserInfo()
										.currentRoom?.send(
											"setGame",
											gameInfo.identifier
										)
								}
							></LogoCard>
						);
					}
				});
		}

		this.setState({
			myGames: myGames,
			currentTab: Tab.MyGames,
		});
	}

	async loadFriendGames() {
		const userUid = UserSingleton.getInstance().getUserInfo().firebaseUser
			?.uid;

		let myFriendRelationshipIDs: string[] = [];

		// Get friend relationship id.
		await FirebaseApp.database()
			.ref("users/" + userUid + "/friends/")
			.once("value", (snapshot) => {
				const game = snapshot.val();

				snapshot.forEach((childSnapshot) => {
					myFriendRelationshipIDs.push(childSnapshot.val().friendId);
				});
			});

		// Get friend ids.
		let myFriendIDs: string[] = [];
		for (let relationshipID of myFriendRelationshipIDs) {
			await FirebaseApp.database()
				.ref("friends/" + relationshipID)
				.once("value", (snapshot) => {
					const data = snapshot.val();

					if (data.recipientId !== userUid) {
						myFriendIDs.push(data.recipientId);
					} else if (data.requestorId !== userUid) {
						myFriendIDs.push(data.requestorId);
					}
				});
		}

		// Get friend games.
		let friendGames: JSX.Element[] = [];
		for (let friendId of myFriendIDs) {
			let friendGameKeys: string[] = [];

			// Get friend game keys.
			await FirebaseApp.database()
				.ref("users/" + friendId + "/games")
				.once("value", (snapshot) => {
					snapshot.forEach((value) => {
						if (value && value.key) {
							friendGameKeys.push(value.key);
						}
					});
				});

			// Get friend games using the keys.
			for (let i = 0; i < friendGameKeys.length; i++) {
				let gameKey = friendGameKeys[i];

				await FirebaseApp.database()
					.ref("/games/" + gameKey)
					.once("value", (snapshot) => {
						const game = snapshot.val();

						if (game) {
							const gameInfo = {
								identifier: gameKey,
								minPlayers: game.minPlayers,
								maxPlayers: game.maxPlayers,
								name: game.name,
								description: game.description,
								cardLogo: game.cardLogo,
								color: game.color,
								author: game.author,
							};

							friendGames.push(
								<LogoCard
									key={gameInfo.identifier}
									game={gameInfo}
									showExtraInfo={true}
									onClickCard={() =>
										UserSingleton.getInstance()
											.getUserInfo()
											.currentRoom?.send(
												"setGame",
												gameInfo.identifier
											)
									}
								></LogoCard>
							);
						}
					});
			}
		}

		this.setState({
			friendGames: friendGames,
			currentTab: Tab.FriendGames,
		});
	}
}

export default MatchLobbySettings;
