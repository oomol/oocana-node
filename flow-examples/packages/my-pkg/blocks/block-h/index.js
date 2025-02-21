/**
 * @typedef {import("@oomol/oocana-types").Context} Context;
 * @typedef {Object} Inputs
 * @property {number} [count]
 */

/**
 * @param {Inputs} inputs
 * @param {Context} context
 * @returns {Promise<void>}
 */
export default async function (inputs, context) {
  for (let i = 0; i < 5; i++) {
    context.reportProgress(i * 25);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  await context.output("count", (inputs.count || 0) + 1);
}
