interface IAsync<T> {
	exec: T;
}

export class Async<T> implements IAsync<T> {
	readonly exec: T;

	constructor(exec: T) {
		this.exec = exec;
	}
}
