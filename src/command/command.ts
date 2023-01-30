// import { IDGenerator } from './tools';

interface IConfig {
	id?: {
		alphabets?: string;
		size?: number;
	};
}
type TConfig = IConfig | undefined;

abstract class CommandAbstract<P> {
	abstract readonly __name: string;
	abstract readonly __config: TConfig;
	abstract readonly __store: boolean;
	abstract readonly __props: P;
	abstract execute<R>(props: P): R;
	abstract undo?(): void;
}

export class Command<P> extends CommandAbstract<P> {
	readonly __name;
	readonly __config;
	readonly __store;
	readonly __props;
	public execute;
	public undo;

	constructor({
		name,
		config,
		store,
		props,
		execute,
		undo,
	}: {
		name: string;
		config: TConfig;
		store: boolean;
		props: P;
		execute: <R, P>(props: P) => R;
		undo?: () => void;
	}) {
		super();
		this.__config = config;
		this.__name = name;
		this.__store = store;
		this.__props = props;
		this.execute = execute;
		this.undo = undo;
	}
}
