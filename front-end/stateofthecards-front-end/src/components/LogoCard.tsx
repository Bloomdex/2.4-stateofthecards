import React, { useState, FunctionComponent } from "react";
import styles from "./LogoCard.module.css";
import IGameInfo from "../structures/IGameInfo";
import UserSingleton from "../config/UserSingleton";
import FirebaseApp from "../config/Firebase";

interface IProps {
	game: IGameInfo;
	onClickCard?: () => void;
}

const LogoCard: FunctionComponent<IProps> = (props: IProps) => {
	const [favorite, setFavorite] = useState(false);

	const onClickFavorite = () => {
		if (favorite) {
			// remove this card from the favorites
			const userUid = UserSingleton.getInstance().getUserInfo()
				.firebaseUser?.uid;

			FirebaseApp.database()
				.ref("users/" + userUid + "/favorites/" + props.game.identifier)
				.remove()
				.then(() => {
					setFavorite(false);
				});
		} else {
			// Add this card to the favorites
			const userUid = UserSingleton.getInstance().getUserInfo()
				.firebaseUser?.uid;

			FirebaseApp.database()
				.ref("users/" + userUid + "/favorites/" + props.game.identifier)
				.set({ gameName: props.game.name }, () => {
					setFavorite(true);
				});
		}
	};

	const doFavoriteCheck = async () => {
		const userUid = UserSingleton.getInstance().getUserInfo().firebaseUser
			?.uid;

		await FirebaseApp.database()
			.ref("users/" + userUid + "/favorites/" + props.game.identifier)
			.once("value", (snapshot) => {
				if (snapshot.val()) {
					setFavorite(true);
				} else {
					setFavorite(false);
				}
			});
	};

	doFavoriteCheck();

	const favoriteIconUrl = favorite
		? "icons/favorite-icon-selected.svg"
		: "icons/favorite-icon.svg";

	return (
		<div
			className={styles.wrapper}
			onClick={() => {
				if (props.onClickCard) props.onClickCard();
			}}
		>
			<figure className={styles.card}>
				<img src={props.game.cardLogo} alt="" />

				<div className={styles.slideOut}>
					<figcaption>{props.game.name}</figcaption>
					<img
						alt=""
						onClick={() => {
							onClickFavorite();
						}}
						src={favoriteIconUrl}
					></img>
				</div>
			</figure>
		</div>
	);
};

export default LogoCard;
