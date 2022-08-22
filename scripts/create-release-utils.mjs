import fs from "node:fs";
import jsonDiff from "json-diff";
import { execa } from "execa";

const deletedIdentifier = "__deleted";
const addedIdentifier = "__added";
const newValueIdentifier = "__new";
const oldValueIdentifier = "__old";

export const getValueByPath = (obj, path) =>
  path.split(".").reduce((node, i) => node[i], obj);

export const getChanges = ({ prevTokens, currentTokens }) => {
  const diff = jsonDiff.diff(prevTokens, currentTokens, { full: true });

  const breakingChanges = [];
  const newChanges = [];
  const patchChanges = [];

  const getNewValues = (tokens, initialPath = "") => {
    const newValues = [];

    const traverseAndIdentifyNewChanges = (t, pathToKey = "") => {
      for (const [key, value] of Object.entries(t)) {
        if (typeof value === "object") {
          traverseAndIdentifyNewChanges(value, `${pathToKey}${key}.`);
        } else {
          newValues.push(
            `\`${pathToKey}${key}\` has been added with the value: \`${value}\``
          );
        }
      }
    };

    traverseAndIdentifyNewChanges(tokens, initialPath);

    return newValues;
  };

  const traverseTokensAndIdentifyChanges = (tokens, pathToKey = "") => {
    for (const [key, value] of Object.entries(tokens)) {
      if (typeof value === "object") {
        traverseTokensAndIdentifyChanges(value, `${pathToKey}${key}.`);
      }

      if (key.endsWith(newValueIdentifier)) {
        const path = pathToKey.substring(0, pathToKey.length - 1); // Remove final period
        const oldValue = getValueByPath(diff, path)[oldValueIdentifier];

        patchChanges.push(
          `\`${path}\` value has changed from \`${oldValue}\` to \`${value}\``
        );
      }

      if (key.endsWith(deletedIdentifier)) {
        breakingChanges.push(
          `\`${pathToKey}${key.replace(
            deletedIdentifier,
            ""
          )}\` has been removed`
        );
      }

      if (key.endsWith(addedIdentifier)) {
        const cleanedKey = key.replace(addedIdentifier, "");

        if (typeof value === "object") {
          newChanges.push(...getNewValues(value, `${pathToKey}${cleanedKey}.`));
        } else {
          newChanges.push(
            `\`${pathToKey}${cleanedKey}\` has been added with the value: \`${value}\``
          );
        }
      }
    }
  };

  if (diff) {
    traverseTokensAndIdentifyChanges(diff);
  }

  return { breakingChanges, newChanges, patchChanges };
};

export const printChangesToFile = ({
  breakingChanges,
  newChanges,
  patchChanges,
}) => {
  let file;
  try {
    file = fs.createWriteStream("./changes.md");

    if (
      breakingChanges.length === 0 &&
      newChanges.length === 0 &&
      patchChanges.length === 0
    ) {
      file.write("_No token changes in this release_");
    } else {
      if (patchChanges.length > 0) {
        file.write("## 🐛 Fixes:\n");
        patchChanges.forEach((change) => file.write(`- ${change}\n`));
        file.write("\n");
      }

      if (newChanges.length > 0) {
        file.write("## ✨ New features:\n");
        newChanges.forEach((change) => file.write(`- ${change}\n`));
        file.write("\n");
      }

      if (breakingChanges.length > 0) {
        file.write("## 💣 Breaking changes:\n");
        breakingChanges.forEach((change) => file.write(`- ${change}\n`));
      }
    }
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    file.end();
  }
};

export const readTokenFile = async ({ revision }) => {
  const { stdout } = await execa("git", ["show", `${revision}:tokens.json`]);
  return JSON.parse(stdout);
};

export const getPreviousTag = async () => {
  const { stdout } = await execa("git", ["describe", "--tags", "--abbrev=0"]);
  return stdout;
};

export const checkEnv = () => Boolean(process.env.GITHUB_ACTOR);

export const getNewVersionArg = ({ breakingChanges, newChanges }) => {
  const releaseType = process.env.RELEASE_TYPE;
  const validReleaseTypes = ["major", "minor", "patch", "auto"];
  if (!validReleaseTypes.includes(releaseType)) {
    throw new Error(
      `Release type should be one of ${validReleaseTypes.join(", ")}`
    );
  }

  if (releaseType === "auto") {
    if (breakingChanges.length > 0) {
      return "major";
    }
    if (newChanges.length > 0) {
      return "minor";
    }

    return "patch";
  }

  return releaseType;
};

export const createVersionCommit = async ({ breakingChanges, newChanges }) => {
  const newVersionArg = getNewVersionArg({ breakingChanges, newChanges });
  const author = process.env.GITHUB_ACTOR;
  await execa("git", ["config", "user.name", author]);
  await execa("git", [
    "config",
    "user.email",
    `${author}@users.noreply.github.com`,
  ]);
  await execa("npm", ["version", newVersionArg]);
};
