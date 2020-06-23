import React, { Component, FormEvent } from "react";
import styles from "./LoginForm.module.css";
import stylesB from "../Base.module.css";
import stylesL from "../Login.module.css";

export interface ILFUserInfo {
	email: string;
	password: string;
}

interface IProps {
	onClickLogin: (userinfo: ILFUserInfo) => void;
	onClickRegister: () => void;
}

interface IState {
	errorMessage: string;
	email: string;
	password: string;
}

class LoginForm extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			errorMessage: "",
			email: "",
			password: "",
		};
	}

	onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ email: event.target.value });
	};

	onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ password: event.target.value });
	};

	render() {
		return (
			<div className={stylesL.formWrapper}>
				<div className={styles.header}>
					<div className={styles.branding}>
						<p>State of the Cards</p>
						<img src="icons/stateofthecards-icon.svg" alt="" />
					</div>

					<hr />
				</div>

				<div className={stylesL.inputWrapper}>
					<input
						className={
							stylesB.interactiveFont + " " + stylesB.input
						}
						type="text"
						name="E-mail"
						placeholder="E-mail"
						required
						autoFocus
						onChange={this.onEmailChange}
					/>

					<input
						className={
							stylesB.interactiveFont + " " + stylesB.input
						}
						id="password"
						name="Password"
						placeholder="Password"
						type="password"
						required
						onChange={this.onPasswordChange}
					/>

					<p
						className={
							stylesB.interactiveFont + " " + stylesB.error
						}
					>
						{this.state.errorMessage}
					</p>
				</div>

				<div
					className={
						styles.buttonsWrapper + " " + stylesB.buttonWrapper
					}
				>
					<button
						className={
							stylesB.interactiveFont +
							" " +
							stylesB.buttonBase +
							" " +
							stylesB.buttonFilledPrimary
						}
						name="Submit"
						value="Login"
						type="submit"
						onClick={(event: FormEvent) => {
							event.preventDefault();

							this.props.onClickLogin({
								email: this.state.email,
								password: this.state.password,
							});
						}}
					>
						Login
					</button>

					<button
						className={
							stylesB.interactiveFont +
							" " +
							stylesB.buttonBase +
							" " +
							stylesB.buttonFilledSecondary
						}
						onClick={() => {
							this.props.onClickRegister();
						}}
					>
						Register
					</button>
				</div>
			</div>
		);
	}

	setErrorMessage(message: string) {
		this.setState({ errorMessage: message });
	}
}

export default LoginForm;
