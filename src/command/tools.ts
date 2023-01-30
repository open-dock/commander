import { urlAlphabet, customAlphabet } from 'nanoid';

/**
 * ID GENERATOR
 */
abstract class IDGeneratorAbstract {
	abstract generator(): string;
}

interface IIDGeneratorProps {
	alphabets: string;
	size: number;
}
export class IDGenerator extends IDGeneratorAbstract {
	public generator;

	constructor(
		{ alphabets, size }: IIDGeneratorProps = { alphabets: urlAlphabet, size: 5 }
	) {
		super();
		this.generator = customAlphabet(alphabets, size);
	}
}
