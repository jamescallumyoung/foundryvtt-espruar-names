# Espruar Names

A FoundryVTT v14 module that generates Forgotten Realms elf and drow names. It uses the name generator from [espruar.com](https://espruar.com/) **v3.3.0** (13 December 2025). That version was replaced by v4 in October 2026, so this module ships the old generator with it and doesn't need the internet or espruar.com.

It doesn't depend on a game system.

## Install

Copy the `espruar-names` folder into your Foundry `Data/modules/` folder and enable the module in your world.

## Macro

Create a script macro with one line:

```js
game.modules.get("espruar-names").api.openDialog();
```

A dialog asks for subrace, gender/style, length, complexity and how many names you want. It remembers each user's last choices. The names are whispered to you in chat with their pronunciation and meaning.

## API

`game.modules.get("espruar-names").api`:

| Function | What it does |
| --- | --- |
| `openDialog()` | Shows the dialog and posts the names to chat. Returns the names, or `null` if the dialog was closed. |
| `generate(options)` | Returns one name (async). |
| `generateMultiple(count, options)` | Returns `count` different names (async). |
| `getGenerator()` | Returns the underlying `NameGenerator` (async). |

`options`, all optional:

| Option | Values | Default |
| --- | --- | --- |
| `subrace` | `"high-elf"`, `"sun-elf"`, `"moon-elf"`, `"wood-elf"`, `"drow"` | `"high-elf"` |
| `style` | `"neutral"`, `"feminine"`, `"masculine"` (for drow, picks female or male patterns) | `"neutral"` |
| `targetSyllables` | `3` short, `4` ideal, `5` long | `4` |
| `complexity` | `"auto"`, `"simple"`, `"complex"` | `"auto"` |

Each name has `name`, `meaning`, `pronunciation` and `syllables`, plus the components it was built from.

Example: name the selected token's actor.

```js
const { name } = await game.modules.get("espruar-names").api.generate({ subrace: "moon-elf", style: "feminine" });
await canvas.tokens.controlled[0]?.actor.update({ name });
```

## Vendored code

`vendor/espruar/` holds these files from the [elf-name-generator repository](https://github.com/bradleynelson/elf-name-generator), unchanged from commit `042f6c5` (the v3.3.0 release):

- `js/core/NameGenerator.js`, `js/config.js`, `js/utils/phonetics.js`
- `data/components.json`, `data/connectors.json`
- `LICENSE` (MIT, © 2025 Brad Nelson). The MIT License requires keeping this notice with the code.

The site's dwarf, gnome, halfling and orc generators from the same release are not included.
