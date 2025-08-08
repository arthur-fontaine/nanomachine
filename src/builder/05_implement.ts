import type * as nanostores from "nanostores";
import type { StateMachineStateBuilder } from "./03_02_state.ts";
import { StateMachine } from "./99_state_machine.ts";

export class StateMachineFinalBuilder<
	CONTEXT_TYPE,
	STATE_TYPES extends string,
	EVENTS extends { [key: string]: unknown },
> {
	private atom: nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>;
	private initialState: STATE_TYPES;

	constructor(atom: typeof this.atom, initialState: typeof this.initialState) {
		this.atom = atom;
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
			this.atom,
			states,
			this.initialState,
		);
	}
}
