import React, { Component } from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect,
} from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import styles from "./App.module.css";
import stylesB from "./Base.module.css";
import ServerList from "./ServerList";
import MatchLobby from "./MatchLobby";
import FirebaseApp from "./config/Firebase";
import UserSingleton from "./config/UserSingleton";
import * as Colyseus from "colyseus.js";
import CreateGameScreen from "./CreateGameScreen";

interface IProps {}

interface IState {
	user: firebase.User | null;
	checkAuthState: boolean;
}

class App extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			user: null,
			checkAuthState: false,
		};
	}

	authListener() {
		FirebaseApp.auth().onAuthStateChanged((user) => {
			this.setState({ checkAuthState: true });

			let client = new Colyseus.Client("ws://localhost:2567");

			if (user) {
				UserSingleton.getInstance()?.setUserInfo({
					firebaseUser: user,
					colyseusClient: client,
					displayName: user.displayName,
					email: user.email,
				});

				if (!client.auth.username) {
					client.auth.username = user.uid;
				}
			} else {
				UserSingleton.getInstance().setUserInfo({
					firebaseUser: undefined,
				});

				const currentRoom = UserSingleton.getInstance().getUserInfo()
					.currentRoom;
				if (currentRoom !== undefined) {
					currentRoom.leave();
				}
			}

			this.setState({ user: user });
		});
	}

	componentDidMount() {
		this.authListener();
	}

	render() {
		let loggedOut = <div />;
		if (this.state.checkAuthState === true) {
			loggedOut = (
				<Switch>
					<Route path="/">
						<Login />
					</Route>
				</Switch>
			);
		}

		const loggedIn = (
			<Switch>
				<Route path="/create">
					<CreateGameScreen />
				</Route>
				<Route path="/match">
					<MatchLobby />
				</Route>
				<Route path="/servers">
					<ServerList />
				</Route>
				<Route path="/dashboard">
					<Dashboard />
				</Route>
				<Route path="/">
					<Redirect to="/dashboard"></Redirect>
				</Route>
			</Switch>
		);

		let chosenRoute = this.state.user ? loggedIn : loggedOut;

		return (
			<Router>
				<div className="App">
					<div className={styles.contentPanel}>{chosenRoute}</div>
					<div
						className={
							stylesB.background +
							" " +
							stylesB.wrapper +
							" " +
							styles.alertPanel
						}
					>
						<h1>
							Please turn the device horizontally. (Landscape
							Mode)
						</h1>
					</div>
				</div>
			</Router>
		);
	}
}

export default App;
