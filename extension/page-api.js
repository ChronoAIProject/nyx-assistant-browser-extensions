// Chrome serializes this function into the page's main world. Only JSON crosses back.
export async function accessPageRegistry(href, approved = null, args = {}) {
  if (location.href !== href || document.visibilityState !== "visible") return { error: "apiGone" };
  try {
    const registry = window.nyxPageAPI;
    if (registry === undefined) return { error: "noApis" };
    if (registry?.version !== 1 || !Array.isArray(registry.tools) || registry.tools.length > 16) {
      return { error: "invalidApis" };
    }
    const tools = registry.tools.map(tool => {
      if (typeof tool.execute !== "function") throw Error();
      return { name: tool.name, description: tool.description, parameters: tool.parameters ?? {} };
    });
    const metadata = JSON.stringify(tools);
    if (metadata.length > 16384) return { error: "invalidApis" };
    if (!approved) return { metadata };
    const index = tools.findIndex(tool => tool.name === approved.name);
    const selected = tools[index];
    if (!selected || tools.filter(tool => tool.name === approved.name).length !== 1 ||
        selected.description !== approved.description ||
        Object.keys(selected.parameters).length !== Object.keys(approved.parameters).length ||
        !Object.entries(approved.parameters).every(([key, type]) =>
          Object.hasOwn(selected.parameters, key) && selected.parameters[key] === type)) return { error: "apiGone" };
    const value = JSON.stringify(await registry.tools[index].execute(args));
    return typeof value === "string" && value.length <= 32768 ? { value } : { error: "apiFailed" };
  } catch {
    return { error: approved ? "apiFailed" : "invalidApis" };
  }
}

// Validate again in the extension. A page owns all values returned from its main world.
export function readDescriptors(metadata) {
  if (typeof metadata !== "string" || metadata.length > 16384) throw Error();
  const tools = JSON.parse(metadata);
  if (!Array.isArray(tools) || tools.length > 16) throw Error();
  const names = new Set();
  const validName = name => typeof name === "string" && /^[a-zA-Z][a-zA-Z0-9_]{0,47}$/.test(name) &&
    !Object.hasOwn(Object.prototype, name) && name !== "prototype";
  for (const tool of tools) {
    if (!tool || !validName(tool.name) || names.has(tool.name) ||
        typeof tool.description !== "string" || !tool.description.trim() || tool.description.length > 512 ||
        !tool.parameters || typeof tool.parameters !== "object" || Array.isArray(tool.parameters)) throw Error();
    names.add(tool.name);
    const fields = Object.entries(tool.parameters);
    if (fields.length > 16 || fields.some(([key, type]) =>
      !validName(key) || !["string", "number", "boolean"].includes(type))) throw Error();
  }
  return tools;
}
