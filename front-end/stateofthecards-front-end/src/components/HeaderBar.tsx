import React from "react";
import styles from "./HeaderBar.module.css";

interface IProps {
	children: React.ReactElement[];
}

interface IState {}

class HeaderBar extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);
	}

	render() {
		return (
			<div className={styles.headerWrapper}>
				{this.props.children.map((child) => {
					return child;
				})}
			</div>
		);
	}
}

export default HeaderBar;
