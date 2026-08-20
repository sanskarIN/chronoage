declare global {
  interface Array<T> {
    at(index: number): T | undefined;
  }

  interface ReadonlyArray<T> {
    at(index: number): T | undefined;
  }
}

if (typeof Array.prototype.at !== 'function') {
  Object.defineProperty(Array.prototype, 'at', {
    configurable: true,
    writable: true,
    value<T>(this: T[], index: number): T | undefined {
      const length = this.length;
      let relativeIndex = Number(index);
      if (Number.isNaN(relativeIndex)) relativeIndex = 0;
      if (relativeIndex !== 0 && Number.isFinite(relativeIndex)) {
        relativeIndex = Math.trunc(relativeIndex);
      }
      const actualIndex = relativeIndex >= 0 ? relativeIndex : length + relativeIndex;
      if (actualIndex < 0 || actualIndex >= length) return undefined;
      return this[actualIndex];
    },
  });
}

export {};
