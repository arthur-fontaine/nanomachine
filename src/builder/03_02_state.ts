import type * as nanostores from "nanostores";
import type { MergeDeep } from "type-fest";
import type { MaybePromise } from "../types/MaybePromise.ts";

export class StateMachineStateBuilder<
	CONTEXT_TYPE,
	STATE_TYPES extends (string & {}) | "$_END",
	EVENTS extends {
		[key: string]: unknown;
	},
	NEXT_STATE_TYPES extends STATE_TYPES = never,
> {
	private atom: nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>;
	private stateAtom: nanostores.PreinitializedWritableAtom<STATE_TYPES>;
	private event: keyof EVENTS;
	private payload: EVENTS[keyof EVENTS];
	private emit: <K extends keyof EVENTS>(
		...[event, payload]: EVENTS[K] extends undefined ? [K] : [K, EVENTS[K]]
	) => void;
	private stopPropagation = false;
	private enabledEvents: ("onReceive" | "onEntry" | "after")[] = [
		"onEntry",
		"onReceive",
		"after",
	];
	private resolve: () => void;
	private reject: (error: Error) => void;

	constructor(
		atom: nanostores.PreinitializedWritableAtom<CONTEXT_TYPE>,
		stateAtom: nanostores.PreinitializedWritableAtom<STATE_TYPES>,
		event: keyof EVENTS,
		payload: EVENTS[keyof EVENTS],
		emit: typeof this.emit,
		resolve: () => void,
		reject: (error: Error) => void,
		enabledEvents?: typeof this.enabledEvents,
	) {
		this.atom = atom;
		this.stateAtom = stateAtom;
		this.event = event;
		this.payload = payload;
		this.emit = emit;
		this.enabledEvents = enabledEvents ?? this.enabledEvents;
		this.resolve = resolve;
		this.reject = reject;
	}

	localEvent<
		EVENT_NAME extends string,
		EVENT_PAYLOAD,
	>(): StateMachineStateBuilder<
		CONTEXT_TYPE,
		STATE_TYPES,
		{
			[key in keyof EVENTS]: EVENTS[key];
		} & {
			[key in EVENT_NAME]: EVENT_PAYLOAD;
		}
	> {
		return this as never;
	}

	guard<NEXT_STATE_TYPE extends STATE_TYPES>(
		evalGuard: (state: CONTEXT_TYPE) => boolean,
		fallbackState: NEXT_STATE_TYPE,
	): StateMachineStateBuilder<
		CONTEXT_TYPE,
		STATE_TYPES,
		EVENTS,
		NEXT_STATE_TYPES | NoInfer<NEXT_STATE_TYPE>
	> {
		try {
			this.stopPropagation =
				this.stopPropagation || !evalGuard(this.atom.get());
			if (this.stopPropagation) this.stateAtom.set(fallbackState);
		} catch (error) {
			this.reject(new Error(`Guard evaluation failed: ${error}`));
			this.stopPropagation = true;
		}
		return this;
	}

	guardContext<
		K extends keyof CONTEXT_TYPE,
		T extends CONTEXT_TYPE[K],
		NEXT_STATE_TYPE extends STATE_TYPES,
	>(
		property: K,
		evalGuard: (state: CONTEXT_TYPE[K]) => state is T,
		fallbackState: NEXT_STATE_TYPE,
	): StateMachineStateBuilder<
		MergeDeep<CONTEXT_TYPE, { [key in K]: T }>,
		STATE_TYPES,
		EVENTS,
		NEXT_STATE_TYPES | NoInfer<NEXT_STATE_TYPE>
	> {
		try {
			const currentState = this.atom.get();

			this.stopPropagation =
				this.stopPropagation || !evalGuard(currentState[property]);
			if (this.stopPropagation) this.stateAtom.set(fallbackState);
		} catch (error) {
			this.reject(new Error(`Guard evaluation failed: ${error}`));
			this.stopPropagation = true;
		}

		return this as never;
	}

	onEntry(
		action: (
			state: CONTEXT_TYPE,
			set: (value: Partial<CONTEXT_TYPE>) => void,
			emit: typeof this.emit,
		) => MaybePromise<void>,
	): typeof this {
		if (!this.enabledEvents.includes("onEntry")) return this;
		if (this.stopPropagation) return this;

		// TODO: Lock to prevent changes while the state is already changed
		Promise.resolve(
			action(
				this.atom.get(),
				(value) => this.atom.set({ ...this.atom.get(), ...value }),
				this.emit.bind(this),
			),
		).catch((err) => this.reject(err));
		return this;
	}

	onReceive<NEXT_STATE_TYPE extends STATE_TYPES>(
		events: {
			[key in keyof EVENTS]?: (
				...[context, set, payload]: EVENTS[key] extends undefined
					? [CONTEXT_TYPE, (value: Partial<CONTEXT_TYPE>) => void]
					: [CONTEXT_TYPE, (value: Partial<CONTEXT_TYPE>) => void, EVENTS[key]]
			) => NEXT_STATE_TYPE | false | undefined;
		},
	): StateMachineStateBuilder<
		CONTEXT_TYPE,
		STATE_TYPES,
		EVENTS,
		NEXT_STATE_TYPES | NoInfer<NEXT_STATE_TYPE>
	> {
		if (!this.enabledEvents.includes("onReceive")) return this;
		if (this.stopPropagation) return this;

		const newState = (
			events[this.event] as (
				...args: unknown[]
			) => ReturnType<NonNullable<(typeof events)[keyof EVENTS]>> | undefined
		)?.(
			this.atom.get(),
			(value: CONTEXT_TYPE) => this.atom.set({ ...this.atom.get(), ...value }),
			this.payload,
		);

		if (newState === "$_END") {
			this.resolve();
			this.stopPropagation = true;
			return this;
		}

		if (newState) this.stateAtom.set(newState as never);
		return this;
	}

	after(timeout: number, stateType: STATE_TYPES): typeof this {
		if (!this.enabledEvents.includes("after")) return this;
		if (this.stopPropagation) return this;

		const expectedState = this.stateAtom.get();
		setTimeout(() => {
			if (this.stateAtom.get() === expectedState) {
				this.stateAtom.set(stateType);
			}
		}, timeout);
		return this;
	}
}
