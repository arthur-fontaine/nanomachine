import type * as nanostores from "nanostores";
import { StateMachineStatesBuilder } from "./03_01_states.ts";

export class StateMachineEventsBuilder<CONTEXT_TYPE> {
	private atom: nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>;

	constructor(atom: typeof this.atom) {
		this.atom = atom;
	}

	events<EVENTS extends { [key: string]: [] | [unknown] }>() {
		return new StateMachineStatesBuilder<
			CONTEXT_TYPE,
			{
				[key in keyof EVENTS]: EVENTS[key] extends []
					? undefined
					: EVENTS[key][0];
			}
		>(this.atom);
	}
}
