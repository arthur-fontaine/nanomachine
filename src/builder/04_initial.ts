import type * as nanostores from "nanostores";
import { StateMachineFinalBuilder } from "./05_implement.ts";

export class StateMachineInitialBuilder<
	CONTEXT_TYPE,
	STATE_TYPES extends string,
	EVENTS extends { [key: string]: unknown },
> {
	private createAtom: () => nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>;

	constructor(
		createAtom: () => nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>,
	) {
		this.createAtom = createAtom;
	}

	initial(initialState: STATE_TYPES) {
		return new StateMachineFinalBuilder<CONTEXT_TYPE, STATE_TYPES, EVENTS>(
			this.createAtom,
			initialState,
		);
	}
}
