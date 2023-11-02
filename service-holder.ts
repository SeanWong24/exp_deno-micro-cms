// TODO use back TSyringe when decorator metadata is supported in Deno Deploy

type constructor<T> = {
  // deno-lint-ignore no-explicit-any
  new (...args: any[]): T;
};

export const SERVICE_HOLDER = new Map() as {
  get<T>(key: constructor<T>): T;
  set<T>(key: constructor<T>, value: T): void;
};
