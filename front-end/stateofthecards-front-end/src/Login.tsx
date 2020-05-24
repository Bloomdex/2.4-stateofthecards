import React, { Component } from "react";
import styles from "./Login.module.css";
import { Redirect } from "react-router-dom";

interface IProps {}

interface IState {
	post: boolean;
	username: string;
	password: string;
}

class Login extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
		this.state = { post: false, username: "", password: "" };
	}

	handleLogin = (event: any) => {
		event.preventDefault();

		// Instead of printing it to the console
		//  Login to the back-end
		console.log(this.state.username, this.state.password);

		// When succesfull, re-direct the user
		//  To the dashboard.
		this.setState({ post: true });
	};

	handleUsernameInput = (event: any) => {
		this.setState({
			username: event.target.value,
		});
	};

	handlePasswordInput = (event: any) => {
		this.setState({
			password: event.target.value,
		});
	};

	render() {
		if (this.state.post) return <Redirect to="/dashboard"></Redirect>;
		else
			return (
				<div className={styles.wrapper}>
					<form
						onSubmit={this.handleLogin}
						method="post"
						name="LoginForm"
						className={styles.formSignin}
					>
						<div className={styles.branding}>
							<h3 className={styles.heading}>
								State of the Cards
							</h3>
							<img
								className={styles.logo}
								src="stateofthecards-logo.png"
								alt=""
							/>
						</div>
						<hr className={styles.colorGraph} />
						<input
							type="text"
							className={styles.formControl}
							name="Username"
							placeholder="Username"
							required
							autoFocus
							value={this.state.username}
							onChange={this.handleUsernameInput}
						/>
						<input
							className={styles.formControl}
							id="password"
							name="Password"
							placeholder="Password"
							type="password"
							required
							value={this.state.password}
							onChange={this.handlePasswordInput}
						/>
						<button
							className={`${styles.formControl} ${styles.loginButton}`}
							name="Submit"
							value="Login"
							type="submit"
						>
							Login
						</button>
					</form>
				</div>
			);
	}
}

export default Login;
