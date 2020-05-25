import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import styles from "./App.module.css";

function App() {
	return (
		<Router>
			<div className="App">
				<div className={styles.contentPanel}>
					<Switch>
						<Route path="/dashboard">
							<Dashboard />
						</Route>
						<Route path="/">
							<Login />
						</Route>
					</Switch>
				</div>
				<div className={styles.alertPanel}>
					<h1>
						Please turn the device horizontally. (Landscape Mode)
					</h1>
				</div>
			</div>
		</Router>
	);
}

export default App;
