import { Card } from "stateofthecards-gamelib/dist/src/Card";

type CardWithInfo = Card & {
	name: string;
	face: string;
};

export default CardWithInfo;
