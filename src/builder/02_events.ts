import type * as nanostores from "nanostores";
import { StateMachineStatesBuilder } from "./03_01_states.ts";

export class StateMachineEventsBuilder<CONTEXT_TYPE> {
	private createAtom: () => nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>;

	constructor(
		createAtom: () => nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>,
	) {
		this.createAtom = createAtom;
	}

	events<EVENTS extends { [key: string]: [] | [unknown] }>() {
		return new StateMachineStatesBuilder<
			CONTEXT_TYPE,
			{
				[key in keyof EVENTS]: EVENTS[key] extends []
					? undefined
					: EVENTS[key][0];
			}
		>(this.createAtom);
	}
}
