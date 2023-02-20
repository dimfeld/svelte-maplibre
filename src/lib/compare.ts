export type DiffApplierCallback<T> = (
  key: keyof T,
  value: T[keyof T] | undefined,
  lastValue: T[keyof T] | undefined
) => void;

export function diffApplier<T extends object>(cb: DiffApplierCallback<T>) {
  let last: T | undefined = undefined;

  return (current: T | undefined) => {
    if (current) {
      for (let key in current) {
        let lastValue = last?.[key];
        let newValue = current[key];
        if (lastValue !== newValue) {
          cb(key, newValue, lastValue);
        }
      }
    } else if (last) {
      for (let key in last) {
        cb(key, undefined, last[key]);
      }
    }

    last = current;
  };
}
