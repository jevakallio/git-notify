import meow from 'meow';
import showNotifications from './showNotifications';
import { getLogStream } from './git';
import { Lifecycle, Flags } from './types';

const cli = meow(
  `
	Usage
	  $ git-notify <method> [options] $GIT_PARAMS

  Methods
    since <commit>  show all notifications since commit
    merge           run on git pull/merge
    rewrite         run on git rebase
    checkout        run on git checkout/switch

	Options
    --prefix, -p    prefix to  look for in commit messages (default: "git-notify:")
    --simple, -s    show a plain, unboxed notification
    --color, -c     color of displayed notification

	Examples
    $ git-notify since HEAD~5
    $ git-notify checkout $GIT_PARAMS --prefix "\@everyone:"
    $ git-notify merge $GIT_PARAMS --simple --color "\#ff6f6f"
`,
  {
    flags: {
      toast: {
        type: 'boolean',
        alias: 't',
      },
      simple: {
        type: 'boolean',
        alias: 's',
      },
      prefix: {
        type: 'string',
        alias: 'p',
        default: 'git-notify:',
      },
      color: {
        type: 'string',
        alias: 'c',
        default: 'cyan',
        description:
          'hex value like #ff0000, or one of: black, red, green, yellow, blue, magenta, cyan, white, gray',
      },
    },
  }
);

async function hook(lifecycle: Lifecycle, args: string[], flags: Flags) {
  // get all commit messages for the relevant revision range
  // depending on which git hook / command was executed
  const logs = await getLogStream(lifecycle, args);

  // stream through logs and print any found notifications
  showNotifications(logs, flags);
}

// first argument is the git hook method
const lifecycle = cli.input[0] as Lifecycle;

// rest of the positional args come from the git hook
const gitHookArgs = cli.input.slice(1);

hook(lifecycle, gitHookArgs, cli.flags);
