import type * as nanostores from "nanostores";
import { StateMachineInitialBuilder } from "./04_initial.ts";

export class StateMachineStatesBuilder<
	CONTEXT_TYPE,
	EVENTS extends { [key: string]: unknown },
> {
	private createAtom: () => nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>;

	constructor(
		createAtom: () => nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>,
	) {
		this.createAtom = createAtom;
	}

	states<STATE_TYPES extends string>() {
		return new StateMachineInitialBuilder<
			CONTEXT_TYPE,
			STATE_TYPES | "$_END",
			EVENTS
		>(this.createAtom);
	}
}
