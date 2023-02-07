import { Command, ERRORS } from '../command';
import Sync from '../sync';

// interfaces
interface IExecProps {
	name: string;
}

type TExecSync = (props: IExecProps) => { result: string };

// mock functions
const EXEC: TExecSync = (props) => {
	return {
		result: `hello ${props.name}`,
	};
};

// constants
const NAME = 'command';

describe('Command', () => {
	describe('constructor', () => {
		// fail
		it(ERRORS.nameIsRequired, () => {
			try {
				// @ts-ignore
				new Command({
					exec: new Sync(EXEC),
				});
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect((error as Error).message).toBe(ERRORS.nameIsRequired);
			}
		});

		it(ERRORS.execInstanceof, () => {
			try {
				new Command({
					name: NAME,
					// @ts-ignore
					exec: EXEC,
				});
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect((error as Error).message).toBe(ERRORS.execInstanceof);
			}
		});

		it(ERRORS.undoIsRequired, () => {
			try {
				new Command({
					name: NAME,
					exec: new Sync(EXEC),
					withHistory: true,
				});
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect((error as Error).message).toBe(ERRORS.undoIsRequired);
			}
		});

		it(ERRORS.undoInstanceof, () => {
			try {
				new Command({
					name: NAME,
					exec: new Sync(EXEC),
					withHistory: true,
					// @ts-ignore
					undo: EXEC,
				});
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect((error as Error).message).toBe(ERRORS.undoInstanceof);
			}
		});

		// pass
		it('pass -> command constructor should work properly', () => {
			const command = new Command({
				name: NAME,
				withHistory: true,
				withQueue: true,
				exec: new Sync(EXEC),
				undo: new Sync(EXEC),
			});

			expect(command.name).toBe(NAME);
			expect(command.withHistory).toBe(true);
			expect(command.withQueue).toBe(true);
		});
	});
});
