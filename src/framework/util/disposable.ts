/**
 * Objects that implement a `dispose()` method.
 */
export interface DisposableLike {
  dispose: () => void;
}

/**
 * Represents a type which can release resources, such
 * as event listening or a timer.
 *
 * Idea and type definition taken from
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/vscode/index.d.ts
 */
export class Disposable implements DisposableLike {
  /**
   * Combine many disposable-likes into one. You can use this method when having objects with
   * a dispose function which aren't instances of `Disposable`.
   *
   * @param disposables - Objects that have at least a `dispose`-function member.
   *  Note that asynchronous dispose-functions aren't awaited.
   * @returns - A new disposable which, upon dispose, will
   *  dispose all provided disposables.
   */
  static from(...disposables: DisposableLike[]): Disposable {
    return new Disposable(() => {
      disposables.forEach((d) => {
        d.dispose();
      });
    });
  }

  private readonly _onDispose: () => void;

  /**
   * Creates a new disposable that calls the provided function
   * on dispose.
   *
   * *Note* that an asynchronous function is not awaited.
   *
   * @param onDispose - Function that disposes something.
   */
  constructor(onDispose: () => void) {
    this._onDispose = onDispose;
  }

  /**
   * Dispose this object.
   */
  dispose() {
    this._onDispose();
  }
}
