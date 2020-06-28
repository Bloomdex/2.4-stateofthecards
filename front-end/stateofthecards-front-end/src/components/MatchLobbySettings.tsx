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
}

interface IState {
	currentTab: Tab;
	allGames: JSX.Element[];
	favoriteGames: JSX.Element[];
}

class MatchLobbySettings extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			currentTab: Tab.AllGames,
			allGames: [],
			favoriteGames: [],
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
				return <div />;
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
}

export default MatchLobbySettings;
