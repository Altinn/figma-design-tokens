import { execa } from "execa";

import {
  readTokenFile,
  checkEnv,
  getPreviousTag,
  getChanges,
  printChangesToFile,
  createVersionCommit,
} from "./create-release-utils.mjs";

const start = async () => {
  try {
    checkEnv();
    const prevTag = await getPreviousTag();
    const currentTokens = await readTokenFile({ revision: "HEAD" });
    const prevTokens = await readTokenFile({ revision: prevTag });

    const { breakingChanges, newChanges, patchChanges } = getChanges({
      prevTokens,
      currentTokens,
    });

    printChangesToFile({ breakingChanges, newChanges, patchChanges });
    await createVersionCommit({ breakingChanges, newChanges });
    await execa("git", ["push", "--follow-tags"]);
  } catch (error) {
    console.log(
      "Something unexpected happened when trying to create a release"
    );
    console.log(error);
    process.exit(1);
  }
};

start();
