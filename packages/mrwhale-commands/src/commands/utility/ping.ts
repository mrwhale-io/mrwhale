import { CommandOptions } from '@mrwhale-io/core';

export const data: CommandOptions = {
  name: "ping",
  description: "Sends back a pong response.",
  type: "utility",
  usage: "<prefix>ping",
};

export function action(): string {
  const start = process.hrtime();
  const end = process.hrtime(start);

  return `Pong! Execution time ${end[0]}s ${end[1] / 1000000}ms`;
}
