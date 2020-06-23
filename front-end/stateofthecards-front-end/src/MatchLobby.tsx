import React from "react";
import { Redirect } from "react-router-dom";
import ILobbyInfo from "./structures/ILobbyInfo";
import HeaderBar from "./components/HeaderBar";
import styles from "./MatchLobby.module.css";
import stylesB from "./Base.module.css";
import stylesH from "./components/HeaderBar.module.css";
import MatchLobbySettings from "./components/MatchLobbySettings";
import MatchLobbyPlayers from "./components/MatchLobbyPlayers";
import MatchLobbyOverview from "./components/MatchOverview";
import TabSelection from "./components/TabSelection";
import { Room } from "colyseus.js";
import UserSingleton from "./config/UserSingleton";
import { FullscreenErrorOverlay } from "./components/FullscreenErrorOverlay";

interface IProps {}

enum MatchLobbyState {
	Idle,
	RedirectServerList,
}

enum Tabs {
	Overview,
	Invite,
	Settings,
}

interface IState {
	currentState?: MatchLobbyState;
	lobbyInfo?: ILobbyInfo;
	currentTab?: Tabs;
	errorMessage?: string;
}

class MatchLobby extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
	}

	componentWillMount() {
		const search = window.location.search;
		const params = new URLSearchParams(search);
		const lobbyId = params.get("id");

		if (!UserSingleton.getInstance().getUserInfo().currentRoom && lobbyId) {
			UserSingleton.getInstance()
				.getUserInfo()
				.colyseusClient?.joinById(lobbyId, {
					playerInfo: {
						firebaseUID: UserSingleton.getInstance().getUserInfo()
							.firebaseUser?.uid,
						username: UserSingleton.getInstance().getUserInfo()
							.displayName,
					},
				})
				.then((room: Room<any>) => {
					UserSingleton.getInstance().setUserInfo({
						currentRoom: room,
					});

					room.onStateChange(() => {
						this.forceUpdate();
					});
				})
				.catch((e) => {
					this.setState({ errorMessage: "Info: " + e.message });
				});
		}

		this.setState({
			currentState: MatchLobbyState.Idle,
			currentTab: Tabs.Overview,
		});
	}

	componentDidMount() {
		// Rerender has to be forced since react somehow does not
		//  notice the state of the room has updated.
		UserSingleton.getInstance()
			.getUserInfo()
			.currentRoom?.onStateChange(() => {
				this.forceUpdate();
			});
	}

	switchTab(index: number) {
		if (index === 0) {
			this.setState({ currentTab: Tabs.Overview });
		} else if (index === 1) {
			this.setState({ currentTab: Tabs.Invite });
		} else if (index === 2) {
			this.setState({ currentTab: Tabs.Settings });
		}
	}

	render() {
		switch (this.state.currentState) {
			case MatchLobbyState.Idle:
				return this.renderLobby();
			case MatchLobbyState.RedirectServerList:
				return <Redirect to="/servers"></Redirect>;
		}
	}

	renderLobby() {
		let showErrorMessage = this.state.errorMessage ? true : false;

		return (
			<div className={styles.wrapper}>
				<FullscreenErrorOverlay
					message={this.state.errorMessage}
					buttonText="Return to Server List"
					onClickButton={() => {
						this.setState({
							currentState: MatchLobbyState.RedirectServerList,
						});
					}}
					isVisible={showErrorMessage}
				></FullscreenErrorOverlay>
				<HeaderBar>
					<div className={stylesB.buttonWrapper}>
						<button
							className={
								stylesB.buttonBase +
								" " +
								stylesB.buttonFilledTertiary
							}
							onClick={() => {
								UserSingleton.getInstance()
									.getUserInfo()
									.currentRoom?.leave();
								this.setState({
									currentState:
										MatchLobbyState.RedirectServerList,
								});
							}}
						>
							Back
						</button>
					</div>

					<div className={styles.infoWrapper}>
						<p className={stylesH.headerTextLarge}>
							{
								UserSingleton.getInstance().getUserInfo()
									.currentRoom?.state.roomName
							}
						</p>
					</div>

					<TabSelection
						onButtonClicked={(i) => this.switchTab(i)}
						buttons={["Overview", "Invite", "Settings"]}
						cssClass={styles.navButtons}
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
				</HeaderBar>

				<div className={stylesB.background + " " + styles.tabContent}>
					{this.renderTab()}
				</div>
			</div>
		);
	}

	renderTab() {
		switch (this.state.currentTab) {
			case Tabs.Overview:
				return <MatchLobbyOverview />;
			case Tabs.Invite:
				return <MatchLobbyPlayers />;
			case Tabs.Settings:
				return <MatchLobbySettings />;
		}
	}
}

export default MatchLobby;
