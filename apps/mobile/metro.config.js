// Metro, unlike Node's CJS resolver, doesn't walk up parent node_modules
// directories on its own — in an npm workspace monorepo, almost everything
// is hoisted to the repo root rather than living in apps/mobile/node_modules
// (which doesn't exist at all), so without this config Metro can't resolve
// any dependency, including expo-router's own entry point.
// https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules"), path.resolve(monorepoRoot, "node_modules")];

// Web mode bootstraps via an HTML <script src>, and browsers collapse ".."
// segments before ever sending the request — so when Metro's server root is
// the project root, a hoisted entry point (expo-router/entry lives in the
// monorepo root's node_modules, above apps/mobile) produces a bundle URL
// like /../../node_modules/... that no real browser can ever fetch (it
// silently collapses to /node_modules/..., which 404s). Pointing the server
// root at the monorepo root instead means every path — app source and
// hoisted deps alike — resolves to a plain, non-negative relative path.
config.server = { ...config.server, unstable_serverRoot: monorepoRoot };

module.exports = config;
