import type Sync from './sync';
import type Async from './async';

export interface IMiddleware<M> {
	prio: number;
	onExec: boolean;
	onUndo: boolean;
	exec: Sync<M> | Async<M>;
}

export interface ICommandResponse<T extends Record<string, any>> {
	success: boolean;
	fail: boolean;
	error: string;
	data?: T;
}

export interface ICommandConstructorProps<E> {
	name: string;
	exec: Sync<E> | Async<E>;
	undo?: Sync<E> | Async<E>;
	withHistory?: boolean;
	withQueue?: boolean;
}

/**
 * CommandResponse
 * @alias CommandResponse
 */
export interface CommandResponse<D extends Record<string, any>> {
	success: boolean;
	fail: boolean;
	error: string;
	data?: D;
}
