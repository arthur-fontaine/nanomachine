import * as nanostores from "nanostores";
import { StateMachineEventsBuilder } from "./02_events.ts";

export class StateMachineContextBuilder {
	context<CONTEXT_TYPE>() {
		const createAtom = () => nanostores.atom({} as CONTEXT_TYPE);
		return new StateMachineEventsBuilder<CONTEXT_TYPE>(createAtom);
	}
}
