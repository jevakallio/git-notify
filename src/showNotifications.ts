import * as Stream from 'stream';
import { Flags } from './types';
import detectNewline from 'detect-newline';
import boxen from 'boxen';
import chalk from 'chalk';

/**
 * Reads given stream of git log messages and prints
 * out any lines prefixed with the git-notify tag
 */
export default async function showNotifications(
  messageStream: Stream.Readable,
  flags: Flags
) {
  let detectedNewline;

  // for each commit message
  for await (const chunk of messageStream) {
    // read message in stream
    const message: string = chunk.toString();
    detectedNewline = detectedNewline || detectNewline(message);

    // for each paragraph in message
    const newline = detectedNewline || '\n';
    const paragraphs = message.split(`${newline}${newline}`);
    for (const paragraph of paragraphs) {
      const notifications = paragraph.split(flags.prefix).slice(1);

      // for each notification on this paragraph
      notifications.forEach(notification => {
        // display notification
        notify(notification.trim(), flags);
      });
    }
  }
}

function notify(message: string, flags: Flags) {
  const chalkPreset: chalk.ChalkFunction | void = (chalk as any)[flags.color];
  const simpleColor = chalkPreset || chalk.hex(flags.color);
  const borderColor = chalkPreset
    ? flags.color
    : flags.color.startsWith('#')
    ? flags.color
    : `#${flags.color}`;

  const display = flags.simple
    ? simpleColor(message)
    : boxen(message, {
        padding: 1,
        margin: 1,
        borderStyle: 'doubleSingle',
        borderColor,
        float: 'center',
        align: 'center',
      });

  // notify to console
  console.log(display);
}
