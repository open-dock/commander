import { Subject } from 'rxjs';
import { Sync } from './sync';
import { Async } from './async';
// types
import { type ICommandConstructorProps, type IMiddleware } from './types';

export class Command<E extends (...args: any) => any> {
	/**
	 * it should be `unique` amoung all commands
	 */
	public readonly name: string;
	/**
	 * if `true` it will be added to history and both `exec` and `undo` should be provided
	 */
	public readonly withHistory: boolean;
	/**
	 * if `true` the execution will be queued.
	 */
	public readonly withQueue: boolean;

	/**
	 * @internal
	 * provided execute will be treated as an internal
	 * it will be used inside exec method
	 */
	private readonly internalExec;

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
		if (
			this.internalExec instanceof Sync ||
			this.internalExec instanceof Async
		) {
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
		} else {
			// TODO: return new error
			console.log('no exec has been implemented for this command');
		}
	}

	constructor({
		name,
		exec,
		withHistory,
		withQueue,
	}: ICommandConstructorProps<E>) {
		if (exec instanceof Sync || exec instanceof Async) {
			this.name = name;
			this.internalExec = exec;
			this.withHistory = withHistory;
			this.withQueue = withQueue;
		} else {
			throw new Error('exec should be instance of Sync or Async');
		}
	}
}
