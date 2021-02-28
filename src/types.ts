export type Lifecycle = 'merge' | 'rewrite' | 'checkout' | 'since';

export type Flags = {
  simple: boolean | void;
  toast: boolean | void;
  prefix: string;
  color: string;
};
