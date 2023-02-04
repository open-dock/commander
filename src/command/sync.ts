interface ISync<T> {
	exec: T;
}

export class Sync<T> implements ISync<T> {
	readonly exec : T;

	constructor(exec: T ) {
		this.exec = exec;
	}
}
