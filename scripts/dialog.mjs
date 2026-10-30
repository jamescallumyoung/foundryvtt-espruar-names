import { MODULE_ID, LOG_PREFIX, OPTIONS_FLAG, SUBRACES } from "./constants.mjs";
import { generateMultiple } from "./generator.mjs";

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const opt = (value, label, current) =>
  `<option value="${value}" ${String(current) === String(value) ? "selected" : ""}>${label}</option>`;

/**
 * Ask for generation options, then whisper the names, meanings and pronunciations to the current user.
 * Remembers the last choices per user.
 * @returns {Promise<object[]|null>} the generated names, or null if the dialog was closed
 */
export async function openDialog() {
  const last = game.user.getFlag(MODULE_ID, OPTIONS_FLAG) ?? {};

  const content = `
    <div class="form-group">
      <label>Subrace</label>
      <select name="subrace">
        ${opt("high-elf", "High Elf (General)", last.subrace ?? "high-elf")}
        ${opt("sun-elf", "Sun Elf (Ar-Tel-Quessir)", last.subrace)}
        ${opt("moon-elf", "Moon Elf (Teu-Tel-Quessir)", last.subrace)}
        ${opt("wood-elf", "Wood Elf (Sy-Tel-Quessir)", last.subrace)}
        ${opt("drow", "Drow (Ss'tel'Quessir) — beta", last.subrace)}
      </select>
    </div>
    <div class="form-group">
      <label>Gender / Style</label>
      <select name="style">
        ${opt("neutral", "Gender neutral", last.style ?? "neutral")}
        ${opt("feminine", "Feminine (softer sounds)", last.style)}
        ${opt("masculine", "Masculine (stronger sounds)", last.style)}
      </select>
    </div>
    <div class="form-group">
      <label>Length</label>
      <select name="targetSyllables">
        ${opt(3, "Short (2–3 syllables)", last.targetSyllables)}
        ${opt(4, "Ideal (3–5 syllables)", last.targetSyllables ?? 4)}
        ${opt(5, "Long (4–6 syllables)", last.targetSyllables)}
      </select>
    </div>
    <div class="form-group">
      <label>Complexity</label>
      <select name="complexity">
        ${opt("auto", "Auto (follows phonetic rules)", last.complexity ?? "auto")}
        ${opt("simple", "Simple (two components)", last.complexity)}
        ${opt("complex", "Complex (experimental)", last.complexity)}
      </select>
    </div>
    <div class="form-group">
      <label>How many</label>
      <input type="number" name="count" min="1" max="20" step="1" value="${last.count ?? 5}">
    </div>
    <p class="hint">Drow use the Gender / Style choice to pick female or male naming patterns.</p>
  `;

  const choice = await foundry.applications.api.DialogV2.input({
    window: { title: "Espruar Elf Name Generator", icon: "fa-solid fa-leaf" },
    content,
    ok: { label: "Generate", icon: "fa-solid fa-dice" },
    rejectClose: false
  });
  if (!choice) return null;

  const options = {
    subrace: choice.subrace in SUBRACES ? choice.subrace : "high-elf",
    style: choice.style,
    targetSyllables: Number(choice.targetSyllables) || 4,
    complexity: choice.complexity
  };
  const count = Math.clamp(Number(choice.count) || 5, 1, 20);
  await game.user.setFlag(MODULE_ID, OPTIONS_FLAG, { ...options, count });

  let names;
  try {
    names = await generateMultiple(count, options);
  } catch (err) {
    console.error(LOG_PREFIX, err);
    ui.notifications.error(`Espruar Names: could not generate names (${err.message}). See the console for details.`);
    return null;
  }

  const rows = names
    .map(n => `
      <li style="margin-bottom:0.4em">
        <strong style="font-size:1.1em">${esc(n.name)}</strong>
        <span style="opacity:0.75"> · ${esc(n.pronunciation)}</span><br>
        <em>${esc(n.meaning)}</em>
      </li>`)
    .join("");

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ alias: "Espruar" }),
    whisper: [game.user.id],
    content: `
      <h3 style="margin-bottom:0.25em">${esc(SUBRACES[options.subrace])} names (${esc(options.style)})</h3>
      <ul style="list-style:none;padding-left:0;margin:0">${rows}</ul>
      <p style="font-size:0.8em;opacity:0.6;margin-top:0.5em">Generator from espruar.com v3.3.0 (MIT, Bradley Nelson)</p>`
  });
  return names;
}
