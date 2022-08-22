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
    const isRunningGithubAction = checkEnv();

    const prevTag = await getPreviousTag();
    const currentTokens = await readTokenFile({ revision: "HEAD" });
    const prevTokens = await readTokenFile({ revision: prevTag });

    const { breakingChanges, newChanges, patchChanges } = getChanges({
      prevTokens,
      currentTokens,
    });

    printChangesToFile({ breakingChanges, newChanges, patchChanges });
    if (isRunningGithubAction) {
      await createVersionCommit({ breakingChanges, newChanges });
      await execa("git", ["push", "--follow-tags"]);
    } else {
      console.log(`This script should only be run from a github action.
No new release has been created, but a preview of the changelog has been printed to changes.md.`);
    }
  } catch (error) {
    console.log(
      "Something unexpected happened when trying to create a release"
    );
    console.log(error);
    process.exit(1);
  }
};

start();
