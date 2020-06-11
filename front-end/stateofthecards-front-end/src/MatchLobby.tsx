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
	currentState: MatchLobbyState;
	lobbyInfo: ILobbyInfo;
	currentTab: Tabs;
}

class MatchLobby extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
	}

	componentWillMount() {
		this.setState({
			currentState: MatchLobbyState.Idle,
			currentTab: Tabs.Overview,
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
		return (
			<div className={styles.wrapper}>
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
									currentState:
										MatchLobbyState.RedirectServerList,
								});
							}}
						>
							Back
						</button>
					</div>

					<div className={styles.infoWrapper}>
						<p className={stylesH.headerTextLarge}>LOBBY NAME</p>
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
