import React from "react";
import styles from "./AddFriendsMenu.module.css";
import stylesB from "../Base.module.css";
import FirebaseApp from "../config/Firebase";
import UserSingleton from "../config/UserSingleton";

interface IProps {
	onClickCancel: () => void;
}

interface IState {
	lookingFor: object;
	resultMsg: string;
	resultSuccess: boolean;
	showAddButton: boolean;
}

class AddFriendsMenu extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			lookingFor: {},
			resultMsg: "",
			resultSuccess: false,
			showAddButton: false,
		};

		this.addFriend = this.addFriend.bind(this);
		this.acceptRequest = this.acceptRequest.bind(this);
		this.createRequest = this.createRequest.bind(this);
	}

	onLookingForChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
		let user = null;
		const input = event.target.value;

		FirebaseApp.database()
			.ref("users")
			.orderByChild("email")
			.equalTo(input)
			.on("value", (data) => {
				user = data.val();

				if (input !== "") {
					if (user) {
						this.setState({
							lookingFor: user,
							resultMsg: "",
							resultSuccess: true,
							showAddButton: true,
						});
					} else {
						this.setState({
							resultMsg: "User not found.",
							resultSuccess: false,
							showAddButton: false,
						});
					}
				} else {
					this.setState({
						resultMsg: "",
						resultSuccess: false,
					});
				}
			});
	};

	addFriend() {
		const FriendshipStatus = {
			REQUEST: 1,
			REQUESTED: 2,
			ACCEPT: 3,
			ACCEPTED: 4,
		};

		let friendshipStatus = FriendshipStatus.REQUEST;

		const userId = UserSingleton.getInstance()?.getUserInfo().firebaseUser
			?.uid;

		// get the id of the recipient
		let recipientId = "";

		for (var key in this.state.lookingFor) {
			if (this.state.lookingFor.hasOwnProperty(key)) {
				recipientId = key;
			}
		}

		// ...........................................................
		FirebaseApp.database()
			.ref("friends")
			.once("value", (snapshot) => {})
			.then((val: any) => {});

		FirebaseApp.database()
			.ref("friends")
			.once("value", (snapshot) => {
				let friendDoc: any;
				let friendDocId: string | null = "";

				snapshot.forEach((childSnapshot) => {
					friendDoc = childSnapshot.val();
					friendDocId = childSnapshot.key;

					if (
						friendDoc.requestorId === userId &&
						friendDoc.recipientId === recipientId
					) {
						friendshipStatus = FriendshipStatus.REQUESTED;
						return;
					} else if (
						friendDoc.requestorId === recipientId &&
						friendDoc.recipientId === userId
					) {
						if (friendDoc.status !== "accepted") {
							friendshipStatus = FriendshipStatus.ACCEPT;
						} else {
							friendshipStatus = FriendshipStatus.ACCEPTED;
						}

						return;
					}
				});

				switch (friendshipStatus) {
					case FriendshipStatus.REQUEST:
						this.createRequest(userId, recipientId);
						break;
					case FriendshipStatus.REQUESTED:
						this.setState({
							resultMsg: "You've already added this user.",
							resultSuccess: false,
							showAddButton: false,
						});
						break;
					case FriendshipStatus.ACCEPT:
						this.acceptRequest(friendDocId);
						break;
					case FriendshipStatus.ACCEPTED:
						this.setState({
							resultMsg: "User is already your friend.",
							resultSuccess: false,
							showAddButton: false,
						});
						break;
				}
			});
	}

	acceptRequest(friendDocId: string | null) {
		if (!friendDocId) return;

		// accept user request
		FirebaseApp.database()
			.ref("friends/" + friendDocId)
			.update({
				status: "accepted",
			})
			.then(() => {
				this.setState({
					resultMsg: "User has successfully been added.",
					resultSuccess: true,
					showAddButton: false,
				});
			})
			.catch((error) => {
				this.setState({
					resultMsg: "Something went wrong, try again later.",
					resultSuccess: false,
					showAddButton: true,
				});
			});
	}

	createRequest(userId: string | undefined, recipientId: string | undefined) {
		if (!userId || !recipientId) return;

		// add the user
		FirebaseApp.database()
			.ref("friends/")
			.child(userId + recipientId)
			.set({
				requestorId: userId,
				recipientId: recipientId,
				status: "pending",
			})
			.then(() => {
				this.setState({
					resultMsg: "Request has been sent.",
					resultSuccess: true,
					showAddButton: false,
				});
			})
			.catch((error) => {
				this.setState({
					resultMsg: "Something went wrong, try again later.",
					resultSuccess: false,
					showAddButton: true,
				});
			});
	}

	render() {
		return (
			<div className={styles.frameWrapper}>
				<div className={styles.frame}>
					<p>Add friend</p>

					<div className={styles.inputArea}>
						<input
							className={stylesB.input}
							placeholder="Email"
							onChange={this.onLookingForChanged}
						></input>

						<p
							className={
								stylesB.interactiveFont + " " + stylesB.error
							}
							style={{
								display: this.state.resultSuccess
									? "none"
									: "block",
							}}
						>
							{this.state.resultMsg}
						</p>

						<p
							className={
								stylesB.interactiveFont + " " + stylesB.success
							}
							style={{
								display: this.state.resultSuccess
									? "block"
									: "none",
							}}
						>
							{this.state.resultMsg}
						</p>

						<div
							className={stylesB.buttonWrapper}
							style={{
								display: this.state.showAddButton
									? "block"
									: "none",
							}}
						>
							<button
								className={
									stylesB.buttonBase +
									" " +
									stylesB.buttonFilledPrimary
								}
								onClick={this.addFriend}
							>
								Add
							</button>
						</div>
					</div>

					<div className={stylesB.buttonWrapper}>
						<button
							className={
								stylesB.buttonBase +
								" " +
								stylesB.buttonFilledTertiary
							}
							onClick={() => {
								this.props.onClickCancel();
							}}
						>
							Back
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default AddFriendsMenu;
