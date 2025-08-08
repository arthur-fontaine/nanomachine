import { StateMachineContextBuilder } from "./builder/01_context.ts";

export function createStateMachine() {
	return new StateMachineContextBuilder();
}
