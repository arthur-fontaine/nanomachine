import * as nanostores from "nanostores";
import { StateMachineStateBuilder } from "./03_02_state.js";

export class StateMachine<
	CONTEXT_TYPE,
	STATE_TYPES extends string,
	EVENTS extends {
		[key: string]: unknown;
	},
> {
	private $stateAtom: nanostores.PreinitializedWritableAtom<STATE_TYPES>;
	private started = false;
	private atom: nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>;
	private states: {
		[key in STATE_TYPES]: (
			stateBuilder: StateMachineStateBuilder<CONTEXT_TYPE, STATE_TYPES, EVENTS>,
		) => void;
	};
	private resolve: () => void;
	private reject: (error: Error) => void;
	private promise: Promise<void>;

	constructor(
		atom: nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>,
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
		this.$stateAtom = nanostores.atom(initialState);
		this.atom = atom;
		this.states = states;

		const { promise, resolve, reject } = Promise.withResolvers<void>();
		this.promise = promise;
		this.resolve = resolve;
		this.reject = reject;
	}

	start(context: CONTEXT_TYPE) {
		if (this.started) {
			return this;
		}
		this.started = true;
		this.atom.set(context);
		this.$stateAtom.subscribe((state) => {
			this.states[state]?.(
				new StateMachineStateBuilder(
					this.atom,
					this.$stateAtom,
					null!,
					null!,
					this.emit.bind(this),
					this.resolve,
					this.reject,
				),
			);
		});

		this.promise.catch((error) => {
			this.started = false;
		});

		return this;
	}

	get() {
		return this.atom.get();
	}

	set(value: CONTEXT_TYPE) {
		this.atom.set(value);
	}

	emit<K extends keyof EVENTS>(
		...[event, payload]: EVENTS[K] extends undefined ? [K] : [K, EVENTS[K]]
	) {
		if (!this.started) {
			return;
		}
		const state = this.$stateAtom.get();
		this.states[state]?.(
			new StateMachineStateBuilder(
				this.$atom,
				this.$stateAtom,
				event,
				payload as never,
				this.emit.bind(this),
				this.resolve,
				this.reject,
				["onReceive"],
			),
		);
	}

	subscribe(listener: (value: CONTEXT_TYPE) => void): () => void {
		return this.atom.subscribe(listener);
	}

	get $atom() {
		return this.atom;
	}

	get $promise() {
		return this.promise;
	}
}
