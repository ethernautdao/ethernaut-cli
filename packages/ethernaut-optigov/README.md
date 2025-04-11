# ethernaut-optigov

Tasks for interacting with the Optimism Agora API, including RetroPGF rounds, governance proposals, and delegation.

## What

This plugin enables seamless interaction with Optimism’s Retroactive Public Goods Funding (RetroPGF) rounds, allowing users to access RetroPGF rounds, governance proposals, delegation, and voting data. It streamlines participation in governance and funding processes within the Optimism ecosystem. Perfect for tracking funding and engaging with the RetroPGF process.

## Installation

```bash
npm install ethernaut-optigov
```

Import the plugin in your `hardhat.config.js`:

```js
require('ethernaut-optigov')
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import 'ethernaut-optigov'
```

## Required plugins

This plugin doesn't depend on any other plugins.

## Tasks

This plugin adds the tasks listed below.

- login Logs in to the Agora RetroPGF API with SIWE (Sign in with Ethereum)
- projects Prints a list of projects registered in RetroPGF, given specified filters
- proposals Prints a list of proposals registered in RetroPGF, given specified filters
- delegate Prints a list of delegates on Agora, or details a specific delegate, with optional related data (votes or delegators)


## Environment extensions

This plugin doesn't extend the hre.

## Configuration

This plugin doesn't add any fields to the hardhat configuration file.

## Usage

Just install it and all tasks will be available with `npx hardhat <task> <params>`
