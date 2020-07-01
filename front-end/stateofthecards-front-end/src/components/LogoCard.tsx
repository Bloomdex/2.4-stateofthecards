import React, { useState, FunctionComponent } from "react";
import styles from "./InteractableCard.module.css";
import IGameInfo from "../structures/IGameInfo";
import UserSingleton from "../config/UserSingleton";
import FirebaseApp from "../config/Firebase";

interface IProps {
	game: IGameInfo;
	hideFavorite?: boolean;
	showExtraInfo?: boolean;
	onClickCard?: () => void;
}

const LogoCard: FunctionComponent<IProps> = (props: IProps) => {
	const [favorite, setFavorite] = useState(false);
	const [isProcessingFavorite, setIsProcessingFavorite] = useState(false);

	const onClickFavorite = () => {
		if (isProcessingFavorite) {
			return;
		} else {
			setIsProcessingFavorite(true);
		}

		if (favorite) {
			// remove this card from the favorites
			const userUid = UserSingleton.getInstance().getUserInfo()
				.firebaseUser?.uid;

			FirebaseApp.database()
				.ref("users/" + userUid + "/favorites/" + props.game.identifier)
				.remove()
				.then(() => {
					setFavorite(false);
					setIsProcessingFavorite(false);
				});
		} else {
			// Add this card to the favorites
			const userUid = UserSingleton.getInstance().getUserInfo()
				.firebaseUser?.uid;

			FirebaseApp.database()
				.ref("users/" + userUid + "/favorites/" + props.game.identifier)
				.set({ gameName: props.game.name }, () => {
					setFavorite(true);
					setIsProcessingFavorite(false);
				});
		}
	};

	const doFavoriteCheck = async () => {
		if (isProcessingFavorite) return;

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

	let info = props.game.name;

	if (props.showExtraInfo) {
		info += ` (${props.game.minPlayers}-${props.game.maxPlayers})`;
	}

	return (
		<div
			className={styles.wrapper}
			onClick={() => {
				if (props.onClickCard) props.onClickCard();
			}}
		>
			<figure className={styles.card + " " + styles.interactable}>
				<img src={props.game.cardLogo} alt="" />

				<div className={styles.slideOut}>
					<figcaption>{info}</figcaption>
					{!props.hideFavorite && (
						<img
							alt="Favorite"
							onClick={() => {
								onClickFavorite();
							}}
							src={favoriteIconUrl}
						></img>
					)}
				</div>
			</figure>
		</div>
	);
};

export default LogoCard;
