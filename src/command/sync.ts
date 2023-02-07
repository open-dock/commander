interface ISync<T> {
	exec: T;
}

export default class Sync<T> implements ISync<T> {
	readonly exec: T;

	constructor(exec: T) {
		this.exec = exec;
	}
}
