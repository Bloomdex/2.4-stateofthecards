import React, { Component, RefObject, createRef, FormEvent } from "react";
import styles from "./Login.module.css";
import stylesB from "./Base.module.css";
import { Redirect } from "react-router-dom";
import ScaleLoader from "react-spinners/ScaleLoader";
import MenuCard from "./components/MenuCard";
import FirebaseApp from "./config/Firebase";
import LoginForm, { IUserInfo } from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

interface IProps {}

enum PageState {
	Shown,
	Loading,
	Post,
}

enum FormState {
	Login,
	Register,
}

interface IState {
	pageState: PageState;
	formState: FormState;
}

class Login extends Component<IProps, IState> {
	private menuCard: RefObject<MenuCard> = createRef();
	private loginForm: RefObject<LoginForm> = createRef();

	constructor(props: IProps) {
		super(props);
		this.state = {
			pageState: PageState.Shown,
			formState: FormState.Login,
		};
	}

	onSubmitLogin = (userinfo: IUserInfo) => {
		if (this.state.pageState !== PageState.Loading) {
			// While we are waiting for the promise show a loading screen.
			this.setState({ pageState: PageState.Loading });
			this.menuCard.current?.setCurrentChild(1);

			// Instead of logging and waiting
			//  Login to the back-end
			FirebaseApp.auth()
				.signInWithEmailAndPassword(
					userinfo.username,
					userinfo.password
				)
				.catch((error) => {
					// Flip the card back-around
					this.menuCard.current?.setCurrentChild(0);
					this.setState({
						pageState: PageState.Shown,
					});
					this.loginForm.current?.setErrorMessage(error.message);
				});

			// If login is sucessfull App.tsx will redirect Login to Dashboard
		}
	};

	render() {
		if (this.state.pageState === PageState.Post) {
			return <Redirect to="/dashboard"></Redirect>;
		} else {
			// Creates a MenuCard with two childs:
			//  First child is a login-form
			//  Second child is a loading-icon
			return (
				<div
					className={
						stylesB.background +
						" " +
						stylesB.wrapper +
						" " +
						styles.wrapper
					}
				>
					<MenuCard
						ref={this.menuCard}
						cssClass={styles.card}
						currentChild={0}
					>
						<div className={styles.cardContentWrapper}>
							<LoginForm
								ref={this.loginForm}
								onClickLogin={(userinfo: IUserInfo) => {
									this.onSubmitLogin(userinfo);
								}}
								onClickRegister={() => {
									this.menuCard.current?.setCurrentChild(2);
									this.setState({
										formState: FormState.Register,
									});
								}}
							></LoginForm>
						</div>

						<div
							className={
								styles.cardContentWrapper +
								" " +
								styles.cardContentWrapperCenter
							}
						>
							<ScaleLoader
								height={35}
								width={4}
								radius={2}
								margin={2}
								color={"#33658a"}
							/>
						</div>

						<div className={styles.cardContentWrapper}>
							<RegisterForm
								onClickBack={() => {
									this.menuCard.current?.setCurrentChild(0);
									this.setState({
										formState: FormState.Login,
									});
								}}
								onSubmitRegister={() => {}}
							></RegisterForm>
						</div>
					</MenuCard>
				</div>
			);
		}
	}
}

export default Login;
