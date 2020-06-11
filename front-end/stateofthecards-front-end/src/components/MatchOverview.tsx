import React, { Component } from "react";
import styles from "./MatchOverview.module.css";
import stylesB from "./Base.module.css";
import GameCard from "./GameCard";
import IGameInfo from "../structures/IGameInfo";

interface IProps {}

interface IState {}

class MatchOverview extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
	}

	render() {
		const testGame: IGameInfo = {
			minPlayers: 2,
			maxPlayers: 6,
			name: "Blackjack",
			description:
				"Blackjack, formerly also Black Jack and Vingt-Un, is the American member of a global family of banking games known as Twenty-One, whose relatives include Pontoon and Vingt-et-Un. It is a comparing card game between one or more players and a dealer, where each player in turn competes against the dealer.",
			cardLogo: new URL(
				"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Jack_of_clubs_fr.svg/200px-Jack_of_clubs_fr.svg.png"
			),
			color: "#FFFFFF",
		};

		return (
			<div>
				<a href="https://www.youtube.com/watch?v=vpJQk02KJ7Y">
					One Chump Lil Pump
				</a>
			</div>
		);
	}
}

export default MatchOverview;
