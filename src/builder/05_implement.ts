import type * as nanostores from "nanostores";
import type { StateMachineStateBuilder } from "./03_02_state.ts";
import { StateMachine } from "./99_state_machine.ts";

export class StateMachineFinalBuilder<
	CONTEXT_TYPE,
	STATE_TYPES extends string,
	EVENTS extends { [key: string]: unknown },
> {
	private createAtom: () => nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>;
	private initialState: STATE_TYPES;

	constructor(
		createAtom: () => nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>,
		initialState: STATE_TYPES,
	) {
		this.createAtom = createAtom;
		this.initialState = initialState;
	}

	$: {
		[key in STATE_TYPES]: (
			stateBuilder: StateMachineStateBuilder<CONTEXT_TYPE, STATE_TYPES, EVENTS>,
		) => StateMachineStateBuilder<any, STATE_TYPES, any>;
	} = {} as never;

	implement(
		states: {
			[key in STATE_TYPES]: (
				stateBuilder: StateMachineStateBuilder<
					CONTEXT_TYPE,
					STATE_TYPES,
					EVENTS
				>,
			) => StateMachineStateBuilder<CONTEXT_TYPE, STATE_TYPES, EVENTS>;
		},
	) {
		return new StateMachine<CONTEXT_TYPE, STATE_TYPES, EVENTS>(
			this.createAtom,
			states,
			this.initialState,
		);
	}
}
