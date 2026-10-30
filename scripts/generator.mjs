import { NameGenerator } from "../vendor/espruar/js/core/NameGenerator.js";
import { LOG_PREFIX } from "./constants.mjs";

const dataUrl = file => new URL(`../vendor/espruar/data/${file}`, import.meta.url);

let generatorPromise = null;

/**
 * The espruar.com v3.3.0 elf name generator, loaded once from this module's own files.
 * @returns {Promise<NameGenerator>}
 */
export function getGenerator() {
  generatorPromise ??= (async () => {
    const load = async file => {
      const response = await fetch(dataUrl(file));
      if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
      return response.json();
    };
    const [components, connectors] = await Promise.all([load("components.json"), load("connectors.json")]);
    console.log(`${LOG_PREFIX} loaded ${components.length} components and ${connectors.length} connectors`);
    return new NameGenerator(components, connectors);
  })().catch(err => {
    generatorPromise = null; // allow a retry on the next call
    throw err;
  });
  return generatorPromise;
}

/**
 * Generate one elf name.
 * @param {object} [options]
 * @param {"high-elf"|"sun-elf"|"moon-elf"|"wood-elf"|"drow"} [options.subrace="high-elf"]
 * @param {"neutral"|"feminine"|"masculine"} [options.style="neutral"]  For drow this picks female or male patterns.
 * @param {3|4|5} [options.targetSyllables=4]  3 = short, 4 = ideal, 5 = long
 * @param {"auto"|"simple"|"complex"} [options.complexity="auto"]
 * @returns {Promise<{name: string, meaning: string, pronunciation: string, syllables: number}>}
 */
export async function generate(options = {}) {
  return (await getGenerator()).generate(options);
}

/**
 * Generate several different elf names with the same options.
 * @param {number} count
 * @param {object} [options]  Same as generate().
 */
export async function generateMultiple(count, options = {}) {
  return (await getGenerator()).generateMultiple(count, options);
}
