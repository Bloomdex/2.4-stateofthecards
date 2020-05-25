import React, { Component, RefObject, createRef, FormEvent } from "react";
import styles from "./Login.module.css";
import { Redirect } from "react-router-dom";
import ScaleLoader from "react-spinners/ScaleLoader";
import MenuCard from "./components/MenuCard";

interface IProps {}

enum PageState {
	SHOWN,
	LOADING,
	POST,
}

interface IState {
	pageState: PageState;
	username: string;
	password: string;
}

class Login extends Component<IProps, IState> {
	private menuCard: RefObject<MenuCard> = createRef();

	constructor(props: IProps) {
		super(props);
		this.state = {
			pageState: PageState.SHOWN,
			username: "",
			password: "",
		};
	}

	onSubmitLogin = (event: FormEvent) => {
		event.preventDefault();

		if (this.state.pageState !== PageState.LOADING) {
			// Instead of logging and waiting
			//  Login to the back-end
			const promise = new Promise((resolve) => setTimeout(resolve, 1500));

			// While we are waiting for the promise show a loading screen.
			this.setState({ pageState: PageState.LOADING });

			// When succesfull, re-direct the user
			//  To the dashboard.
			promise.then(() => this.setState({ pageState: PageState.POST }));
		}
	};

	onUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ username: event.target.value });
	};

	onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ password: event.target.value });
	};

	render() {
		if (this.state.pageState === PageState.POST) {
			return <Redirect to="/dashboard"></Redirect>;
		} else {
			// Creates a MenuCard with two childs:
			//  First child is a login-form
			//  Second child is a loading-icon
			return (
				<div className={styles.wrapper}>
					<MenuCard ref={this.menuCard} currentChild={0}>
						<form
							onSubmit={(event) => {
								this.menuCard.current?.setCurrentChild(1);
								this.onSubmitLogin(event);
							}}
							name="LoginForm"
							className={
								styles.formSignin + " " + styles.cardSide
							}
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
								onChange={this.onUsernameChange}
							/>
							<input
								className={styles.formControl}
								id="password"
								name="Password"
								placeholder="Password"
								type="password"
								required
								onChange={this.onPasswordChange}
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
						<div className={styles.cardSide}>
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
			);
		}
	}
}

export default Login;
