import SimpleGit from 'simple-git';
import log from 'git-raw-commits';
import { Lifecycle } from './types';

const git = SimpleGit();

export function getLastRef(): Promise<string> {
  return git
    .raw('reflog', '--pretty=format:"%h"', '--no-patch', '-1', 'HEAD@{1}')
    .then(value => value.replace(/"/g, ''));
}

export async function getLogStream(lifecycle: Lifecycle, args: string[]) {
  switch (lifecycle) {
    case 'merge':
      return log({ from: await getLastRef() });

    case 'rewrite':
      // perhaps not the most accurate method, PRs welcome
      return log({ from: 'origin', to: 'HEAD' });

    case 'checkout':
      const [from, to] = args;
      return log({ from, to });

    case 'since':
      return log({ from: args[0] });

    default:
      throw new Error('[git-notify] unsupported git hook: ' + lifecycle);
  }
}
