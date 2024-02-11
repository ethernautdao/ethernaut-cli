const loadAbi = require('./load-abi');
const { getPopulatedFunctionSignature } = require('../../internal/signatures');
const debug = require('common/debugger');
const prompt = require('common/prompt');

module.exports = async function ({ abiPath }) {
  if (!abiPath) return;

  try {
    const abi = loadAbi(abiPath);
    const isFunction = (fn) =>
      fn.type === 'function' || fn.type === 'fallback' || fn.type === 'receive';
    const abiFns = abi.filter((el) => isFunction(el));
    // const choices = abiFns.map((fn) => getFunctionSignature(fn));
    const choices = abiFns.map((fn) => getPopulatedFunctionSignature(fn));

    return await prompt({
      type: 'autocomplete',
      message: 'Pick a function',
      limit: 15,
      suggest,
      choices,
    });
  } catch (err) {
    debug.log(err, 'interact');
  }
};
