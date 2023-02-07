import { Subject } from 'rxjs';
import Sync from './sync';
import Async from './async';
// types
import { type ICommandConstructorProps, type IMiddleware } from './types';

export const ERRORS = {
	nameIsRequired: 'command name is required',
	execInstanceof: 'exec should be instance of Sync or Async',
	undoIsRequired:
		'if withHistory is required and undo function method should be provided',
	undoInstanceof: 'undo should be instance of Sync or Async',
} as const;

export class Command<E extends (...args: any) => any> {
	/**
	 * it should be `unique` amoung all commands
	 */
	public readonly name: string;

	/**
	 * if `true` it will be added to history and both `exec` and `undo` should be provided
	 * default is `false`
	 */
	public readonly withHistory: boolean;

	/**
	 * if `true` the execution will be queued.
	 * default is `false`
	 */
	public readonly withQueue: boolean;

	/**
	 * @internal
	 * provided execute will be treated as an internal
	 * it will be used inside the public exec method
	 */
	private readonly internalExec;

	/**
	 * @internal
	 * provided undo will be treated as an internal
	 * it will be used inside the public undo method
	 */
	private readonly internalUndo;

	/**
	 * `observable`, observe if you want to know when the execution start and when it is done
	 */
	public isRunning = new Subject<boolean>();

	/**
	 * `observable`, observe if you want to need the data
	 */
	public onComplete = new Subject();

	protected middlewares = new Map();

	public use<M>(name: string, middleware: IMiddleware<M>) {
		if (middleware instanceof Sync || middleware instanceof Async) {
			throw new Error('middleware should be instance of Sync or Async');
		}

		this.middlewares.set(name, middleware);
		if (this.middlewares.size > 1) {
			// NOTE - sort middleware based on prio
			this.middlewares = new Map(
				[...this.middlewares.entries()].sort(
					(a: [string, IMiddleware<M>], b: [string, IMiddleware<M>]) => {
						return a[1].prio - b[1].prio;
					}
				)
			);
		}
	}

	public async exec(props: Parameters<E>[0]) {
		this.isRunning.next(true);

		const res: Record<string, any> = {};
		const mData: Record<string, any> = {}; // TODO: Better types

		try {
			for (const entry of this.middlewares.entries()) {
				const [key, value] = entry;
				// console.log({ key, value });
				// let : ReturnType<typeof value.exec.exec>;
				if (value.exec instanceof Sync) {
					const d = value.exec.exec(props);
					mData[key] = d;
				} else {
					const d = await value.exec.exec(props);
					mData[key] = d;
				}
			}

			res.mData = mData;

			if (this.internalExec instanceof Sync) {
				res.data = this.internalExec.exec(props);
			} else {
				res.data = await this.internalExec.exec(props);
			}
		} catch (error) {
			console.error(error);
		} finally {
			this.isRunning.next(false);
			this.onComplete.next(res);
		}
	}

	constructor({
		name,
		exec,
		undo,
		withHistory,
		withQueue,
	}: ICommandConstructorProps<E>) {
		if (name === undefined) {
			throw new Error(ERRORS.nameIsRequired);
		}

		if (!(exec instanceof Sync) && !(exec instanceof Async)) {
			throw new Error(ERRORS.execInstanceof);
		}

		if (withHistory === true  && undo === undefined) {
			throw new Error(ERRORS.undoIsRequired);
		}

		if (Boolean(undo) && !(exec instanceof Sync) && !(exec instanceof Async)) {
			throw new Error(ERRORS.undoInstanceof);
		}

		this.name = name;
		this.internalExec = exec;
		this.internalUndo = undo ?? undefined;
		this.withHistory = withHistory ?? false;
		this.withQueue = withQueue ?? false;

		// TODO: remove - in case of unused private readonly
		console.log(this.internalUndo);
	}
}
