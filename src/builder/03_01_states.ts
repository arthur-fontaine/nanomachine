import type * as nanostores from "nanostores";
import { StateMachineInitialBuilder } from "./04_initial.ts";

export class StateMachineStatesBuilder<
	CONTEXT_TYPE,
	EVENTS extends { [key: string]: unknown },
> {
	private atom: nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>;

	constructor(atom: typeof this.atom) {
		this.atom = atom;
	}

	states<STATE_TYPES extends string>() {
		return new StateMachineInitialBuilder<CONTEXT_TYPE, STATE_TYPES, EVENTS>(
			this.atom,
		);
	}
}
