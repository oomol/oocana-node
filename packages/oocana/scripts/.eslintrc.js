/** @type {import("eslint").Linter.Config */
const config = {
  root: true,
  env: {
    node: true,
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
  },
};

// eslint-disable-next-line no-undef
module.exports = config;
