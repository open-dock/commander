import { urlAlphabet, nanoid, customAlphabet } from 'nanoid'

import { Command } from './command'

// command abstract
// command concrete
// command factory abstract
// command factory concrete
// command result

// factory design pattern;

interface IConfig {
  id?: {
    alphabets?: string
    size?: number
  }
}
type TConfig = IConfig | undefined

export interface CommandFactoryAbstract {
  generate: () => Command
}
export abstract class CommandFactoryAbstract {
  abstract config: TConfig
}

export default class CommandFactory
  extends CommandFactoryAbstract {
  /** MEMBERS */
  private _config: TConfig
  set config (config: TConfig) {
    this._config = config
    if ((this.config?.id) == null) {
      this.nanoid = nanoid
    } else {
      const { alphabets = urlAlphabet, size = 21 } = this.config.id
      this.nanoid = customAlphabet(alphabets, size)
    }
  }

  get config () {
    return this._config
  }

  // public nanoid: typeof nanoid = nanoid;
  private nanoid = nanoid

  // throw new Error("Method not implemented.");

  /** CONSTRUCTOR */
  constructor (config?: TConfig) {
    super()
    this.config = config
  }

  /** METHODS */

  /** STATICS */
  public generate () {
    const id = this.nanoid()
    const newCommand = new Command({ id })
    return newCommand
  }
}
