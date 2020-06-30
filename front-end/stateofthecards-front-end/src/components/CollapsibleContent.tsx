import React, { Component } from "react";

interface IProps {
	name: string;
	children: React.ReactElement[];
	cssClass: string;
	cssClassHeader: string;
	cssClassContent: string;
	isCollapsed: boolean;
}

interface IState {
	name: string;
	isCollapsed: boolean;
}

class MenuCard extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			name: props.name,
			isCollapsed: props.isCollapsed,
		};
	}

	flipIsCollapsed() {
		if (this.state.isCollapsed) {
			this.setState({
				isCollapsed: false,
			});
		} else {
			this.setState({
				isCollapsed: true,
			});
		}
	}

	render() {
		return (
			<div className={this.props.cssClass}>
				<div
					className={this.props.cssClassHeader}
					onClick={() => {
						this.flipIsCollapsed();
					}}
				>
					<p>{this.state.name}</p>
				</div>

				<div
					className={this.props.cssClassContent}
					style={{
						display: this.state.isCollapsed ? "none" : "block",
					}}
				>
					{this.props.children}
				</div>
			</div>
		);
	}
}

export default MenuCard;
