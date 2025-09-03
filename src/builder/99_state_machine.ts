import * as nanostores from "nanostores";
import { StateMachineStateBuilder } from "./03_02_state.ts";

export class StateMachine<
	CONTEXT_TYPE,
	STATE_TYPES extends string,
	EVENTS extends { [key: string]: unknown },
> {
	private initialState: STATE_TYPES;
	private createAtom: () => nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>;
	private states: {
		[key in STATE_TYPES]: (
			stateBuilder: StateMachineStateBuilder<CONTEXT_TYPE, STATE_TYPES, EVENTS>,
		) => void;
	};

	constructor(
		createAtom: () => nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>,
		states: {
			[key in STATE_TYPES]: (
				stateBuilder: StateMachineStateBuilder<
					CONTEXT_TYPE,
					STATE_TYPES,
					EVENTS
				>,
			) => void;
		},
		initialState: STATE_TYPES,
	) {

		this.createAtom = createAtom;
		this.states = states;
		this.initialState = initialState;
	}

	start(context: CONTEXT_TYPE) {
		const atom = this.createAtom();
		const stateAtom = nanostores.atom<STATE_TYPES>(this.initialState);

		const { promise, resolve, reject } = Promise.withResolvers<void>();

		const states = this.states;

		function get() {
			return atom.get();
		}

		function set(value: CONTEXT_TYPE) {
			atom.set(value);
		}

		function emit<K extends keyof EVENTS>(
			...[event, payload]: EVENTS[K] extends undefined ? [K] : [K, EVENTS[K]]
		) {
			const state = stateAtom.get();
			states[state]?.(
				new StateMachineStateBuilder(
					atom,
					stateAtom,
					event,
					payload as never,
					emit,
					resolve,
					reject,
					["onReceive"],
				),
			);
		}

		function subscribe(listener: (value: CONTEXT_TYPE) => void): () => void {
			return atom.subscribe(listener);
		}

		atom.set(context);
		stateAtom.subscribe((state) => {
			this.states[state]?.(
				new StateMachineStateBuilder(
					atom,
					stateAtom,
					null!,
					null!,
					emit,
					resolve,
					reject,
				),
			);
		});

		return {
			get,
			set,
			emit,
			subscribe,
			$atom: atom,
			$promise: promise,
		};
	}
}
