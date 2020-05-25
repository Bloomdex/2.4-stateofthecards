import React, { Component, RefObject, createRef } from "react";
import styles from "./Dashboard.module.css";
import MenuCard from "./components/MenuCard";
import ScaleLoader from "react-spinners/ScaleLoader";

class Dashboard extends Component {
	private joinFriendsCard: RefObject<MenuCard> = createRef();
	private serverListCard: RefObject<MenuCard> = createRef();
	private createMatchCard: RefObject<MenuCard> = createRef();
	private quickJoinCard: RefObject<MenuCard> = createRef();

	render() {
		return (
			<div className={styles.wrapper}>
				<div className={styles.headerWrapper}>
					<h2>LOGOUT</h2>
					<div>
						<h1 className={styles.title}>State of the Cards</h1>
						<h2>Welcome back SPELER01!</h2>
					</div>
					<h2>OPTIONS</h2>
				</div>
				<div className={styles.optionsWrapper}>
					<div className={styles.options}>
						<div className={styles.card}>
							<MenuCard
								width={210}
								height={380}
								currentChild={0}
								ref={this.joinFriendsCard}
							>
								<div className={styles.cardContent}>
									<img
										src="icons/join-friends-icon.svg"
										alt=""
									></img>
									<h1>Join Friends</h1>
								</div>
								<div></div>
							</MenuCard>
						</div>

						<div className={styles.card}>
							<MenuCard
								width={210}
								height={380}
								currentChild={0}
								ref={this.serverListCard}
							>
								<div className={styles.cardContent}>
									<img
										src="icons/server-list-icon.svg"
										alt=""
									></img>
									<h1>Server List</h1>
								</div>
								<div></div>
							</MenuCard>
						</div>

						<div className={styles.card}>
							<MenuCard
								width={210}
								height={380}
								currentChild={0}
								ref={this.createMatchCard}
							>
								<div className={styles.cardContent}>
									<img
										src="icons/create-match-icon.svg"
										alt=""
									></img>
									<h1>Create Match</h1>
								</div>
								<div></div>
							</MenuCard>
						</div>

						<div className={styles.card}>
							<MenuCard
								width={210}
								height={380}
								currentChild={0}
								ref={this.quickJoinCard}
							>
								<div className={styles.cardContent}>
									<img
										src="icons/quick-join-icon.svg"
										alt=""
									></img>
									<h1>Quick Join</h1>
								</div>
								<div>
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
					</div>
				</div>
			</div>
		);
	}
}

export default Dashboard;
