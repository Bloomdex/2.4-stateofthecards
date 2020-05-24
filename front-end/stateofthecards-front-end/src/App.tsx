import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";

function App() {
	return (
		<Router>
			<div className="App">
				<Switch>
					<Route path="/dashboard">
						<Dashboard />
					</Route>
					<Route path="/">
						<Login />
					</Route>
				</Switch>
			</div>
		</Router>
	);
}

export default App;
