import { Subject } from 'rxjs';
import { Sync } from './sync';
import { Async } from './async';
// types
import { type ICommandConstructorProps, type IMiddleware } from './types';

export class Command<E extends (...args: any) => any> {
	public readonly name: string;
	public readonly withHistory: boolean;
	public readonly withQueue: boolean;
	public readonly exec;
	protected middlewares = new Map();

	public isRunning = new Subject<boolean>();
	public onComplete = new Subject();

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

	public async internalExec(props: Parameters<E>[0]) {
		if (this.exec instanceof Sync || this.exec instanceof Async) {
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

				if (this.exec instanceof Sync) {
					res.data = this.exec.exec(props);
				} else {
					res.data = await this.exec.exec(props);
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
			this.exec = exec;
			this.withHistory = withHistory;
			this.withQueue = withQueue;
		} else {
			throw new Error('exec should be instance of Sync or Async');
		}
	}
}
