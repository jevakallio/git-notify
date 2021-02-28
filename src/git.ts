import SimpleGit from 'simple-git';
import log from 'git-raw-commits';
import { Lifecycle } from './types';

const git = SimpleGit();

/**
 * Gets the second item on the reflog. In post-merge hook, this
 * should be the HEAD of the branch before the merge.
 *
 * If this assumption turns out not to be correct, this may
 * under- or over-report notifications
 */
export function getLastRef(): Promise<string> {
  return git
    .raw('reflog', '--pretty=format:"%h"', '--no-patch', '-1', 'HEAD@{1}')
    .then(value => value.replace(/"/g, ''));
}

export async function getLogStream(lifecycle: Lifecycle, args: string[]) {
  switch (lifecycle) {
    case 'merge':
      // all commits since the previous HEAD on this branch
      return log({ from: await getLastRef() });

    case 'rewrite':
      // perhaps not the most accurate method, PRs welcome
      return log({ from: 'origin', to: 'HEAD' });

    case 'checkout':
      // post-checkout hook receives old and new branch HEAD as args
      const [from, to] = args;
      return log({ from, to });

    case 'since':
      // since is our own command, not called by any git hook
      return log({ from: args[0] });

    default:
      throw new Error('[git-notify] unsupported git hook: ' + lifecycle);
  }
}
