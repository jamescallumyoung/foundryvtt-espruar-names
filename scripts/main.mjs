import { MODULE_ID, LOG_PREFIX } from "./constants.mjs";
import { getGenerator, generate, generateMultiple } from "./generator.mjs";
import { openDialog } from "./dialog.mjs";

Hooks.once("init", () => {
  game.modules.get(MODULE_ID).api = Object.freeze({
    openDialog,
    generate,
    generateMultiple,
    getGenerator
  });
  console.log(`${LOG_PREFIX} API registered at game.modules.get("${MODULE_ID}").api`);
});
