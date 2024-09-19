import { button } from './button.js';
import { challenge } from './challenge.js';
import { modal } from './modal.js';
import { select } from './selectMenu.js';
import { test } from './test.js';

/**
 * List of available commands. Used to aggregate commands during registration,
 * and to enumerate over for command execution.
 */
export const commands = [
  button,
  challenge,
  modal,
  select,
  test,
];
