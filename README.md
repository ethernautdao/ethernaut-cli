![Colored ASCII Art](demos/banner.png)

[![Dynamic JSON Badge](https://img.shields.io/npm/v/ethernaut-cli.svg)](https://www.npmjs.com/package/ethernaut-cli)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/theethernaut/ethernaut-cli/ci.yml)](https://github.com/theethernaut/ethernaut-cli/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/theethernaut/ethernaut-cli/badge.svg)](https://coveralls.io/github/theethernaut/ethernaut-cli)

## What is it?

A universal Ethereum swiss army knife with an AI duck taped onto it.

A CLI for non-technical users, trying to bridge the gap between graphical UIs and CLIs.

A framework for rapid tool building; integrate a new tool in a matter of hours.

An extensible framework composed of [hardhat](https://github.com/NomicFoundation/hardhat) plugins.

Example usages:

`ethernaut what is the total supply of USDC`

or

`ethernaut complete level 2 of the ethernaut challenges`

It can also be used as a regular cli:

`ethernaut util unit 5 --from ether --to wei`

And also features an interactive mode that allows easy navigation of tasks and collection of task arguments.

### Prerequisites:

Node.js

`curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`

`sudo apt install nodejs`

Anvil

`curl -L https://foundry.paradigm.xyz | bash`

`foundryup`

xClip (on Debian/Ubuntu systems)

`sudo apt install xclip`

## Development

This is a monorepo built with [lerna](https://lerna.js.org/), composed of [hardhat](https://github.com/NomicFoundation/hardhat) plugins. The global nodejs application entry point is in `packages/ethernaut-cli/ethernaut`. All code is vanilla javascript.

### Setup

Clone the repo.

Installs all monorepo dependencies.

`npm install`

Bootstraps lerna and runs build scripts for all packages.

`npm run build`

Compiles any contracts in the monorepo's packages.

`npm run compile`

### Running

Use the global `ethernaut` binary to run the CLI.

`./packages/ethernaut-cli/ethernaut <command> <args>`

You may want to add this binary to your PATH in your .zshrc or .bashrc, so that you can run it with an abbreviation such as 'eth'.

`eth <command> <args>`

This would allow you to have an `eth` develpment version as well as an `ethernaut` official version installed on your system as a global npm package.

To run the CLI with verbose output, run:

`DEBUG=* eth <command> <args>` // All packages

`DEBUG=*hardhat* eth <command> <args>` // Hardhat packages

`DEBUG=*ethernaut* eth <command> <args>` // ethernaut packages

`DEBUG=*ethernaut:ui* eth <command> <args>` // ethernaut-ui packages

### Testing

Some tests require a network to be running. You can start one with:

`npm run chain`

Tests all packages in the monorepo.

`npm run test`

To test a single package, run:

`cd packages/ethernaut-ai && npm test`

To run tests with verbose output, run:

`DEBUG=* npm test` // All packages

`DEBUG=*hardhat* npm test` // Hardhat packages

`DEBUG=*ethernaut* npm test` // ethernaut packages

`DEBUG=*ethernaut:ui* npm test` // ethernaut-ui packages

## Tutorials and articles

- [Announcing the ethernaut-cli](https://mirror.xyz/theethernaut.eth/0HP3L4mWzb4isXYERfsncBQgzT1T99uQTH8tvJvICmE)

## Features

### Intuitive navigation

No more man pages. No more --help.

Just type `ethernaut` and jump straight into an enquirer based navigation mode. Select a scope, select a task, and boom.

<details>
  <summary>Navigation demo</summary>
  <img src="demos/nav.gif" alt="Enquirer navigation">
</details>

## Smart interactive mode

Once in a task, interactive mode kicks in, and parameters are collected through enquirer prompts.

<details>
  <summary>Enquirer param collection</summary>
  <img src="demos/interactive.gif" alt="Enquirer param collection">
</details>

### Normal CLI interaction

This is still a regular CLI app, so commands can be called without all the fancy ui or ai stuff:

<details>
  <summary>Normal CLI mode</summary>
  <img src="demos/normal.gif" alt="Normal CLI mode">
</details>

## Ui extensions

Plugins of plugins? Why not.

Plugins that enhance parameter collection prompts in other plugins with even cooler prompts, smart suggestions, etc.

For example, the ui extension of the interact plugin can fetch the abi from Etherscan if you didn't provide an abi:

<details>
  <summary>Custom ABI Prompt</summary>
  <img src="demos/custom.gif" alt="Etherscan custom ABI prompt">
</details>

But after you've interacted with the contract, it already has the abi, so the abi is instead suggested:

<details>
  <summary>Abi suggestion</summary>
  <img src="demos/custom1.gif" alt="Abi suggestion">
</details>

Another example is the extension for the model param in `ethernaut ai config --model`, which queries the openai API and presents a list of available models.

### Natural language to cli commands

If that wasn't easy enough, just type whatever you want and AI will kick in to try to make sense of what you typed, and the right command or sequence of commands will be executed.

<details>
  <summary>Ai natural language interpretation</summary>
  <img src="demos/interpret.gif" alt="Ai natural language interpretation">
</details>

You want the AI to also teach you how the commands work? Sure.

<details>
  <summary>Ai command explanation</summary>
  <img src="demos/explain.gif" alt="Ai command explanation">
</details>

You want the AI to also teach you about Ethereum. Also sure.

<details>
  <summary>Complete level 1</summary>
  <img src="demos/teach.gif" alt="Complete level 1">
</details>

### Extensibility through hardhat plugins

You don't have to use this entire plethora of features tho. You can use a single feature in your regular hardhat project with exactly what you need. This is because the ethernaut-cli is completely built with hardhat plugins.

You just want task navigation and interactive mode in your project: use the `ethernaut-ui` plugin.

Or the ai stuff: use `ethernaut-ai` plugin.

All the plugins combined conform the ethernaut-cli.

<details>

<summary>List of packages</summary>

| Title                                                             | Description                                                                                            |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [ethernaut-ai](packages/ethernaut-ai/README.md)                   | AI assistant that interprets user input and executes hardhat tasks and talks to Optimism documentation |
| [ethernaut-ai-ui](packages/ethernaut-ai-ui/README.md)             | Ui extensions for the ethernaut-ai package                                                             |
| [ethernaut-cli](packages/ethernaut-cli/README.md)                 | Main hardhat project                                                                                   |
| [ethernaut-challenges](packages/ethernaut-challenges/README.md)   | Tasks for playing the Open Zeppelin Ethernaut challenges from the CLI                                  |
| [ethernaut-common](packages/ethernaut-common/README.md)           | Common utils used by several ethernaut-cli plugins                                                     |
| [ethernaut-interact](packages/ethernaut-interact/README.md)       | Tasks for sending transactions and interacting with contracts                                          |
| [ethernaut-interact-ui](packages/ethernaut-interact-ui/README.md) | Ui extensions for the ethernaut-interact package                                                       |
| [ethernaut-network](packages/ethernaut-network/README.md)         | Tasks for interacting with different networks                                                          |
| [ethernaut-network-ui](packages/ethernaut-network-ui/README.md)   | Ui extensions for the ethernaut-network package                                                        |
| [ethernaut-ui](packages/ethernaut-ui/README.md)                   | Intuitive navigation and interactive param collection for hardhat tasks                                |
| [ethernaut-util](packages/ethernaut-util/README.md)               | Simple, everyday utilities for Ethereum devs                                                           |
| [ethernaut-util-ui](packages/ethernaut-util-ui/README.md)         | Ui extensions for the ethernaut-util package                                                           |
| [ethernaut-wallet](packages/ethernaut-wallet/README.md)           | Tasks for interacting from different Ethereum accounts                                                 |
| [ethernaut-wallet-ui](packages/ethernaut-wallet-ui/README.md)     | Ui extensions for the ethernaut-wallet package                                                         |

</details>
