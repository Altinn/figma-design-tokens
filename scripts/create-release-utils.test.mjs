import { it, describe } from "node:test";
import assert from "node:assert/strict";
import {
  checkEnv,
  getNewVersionArg,
  getChanges,
} from "./create-release-utils.mjs";

describe("checkEnv", () => {
  it("should return false env.GITHUB_ACTOR is not set", () => {
    const actor = process.env.GITHUB_ACTOR;
    delete process.env.GITHUB_ACTOR;
    assert.strictEqual(checkEnv(), false);
    process.env.GITHUB_ACTOR = actor;
  });

  it("should return true when env.GITHUB_ACTOR is set", () => {
    const actor = process.env.GITHUB_ACTOR;
    process.env.GITHUB_ACTOR = "test";
    assert.strictEqual(checkEnv(), true);
    process.env.GITHUB_ACTOR = actor;
  });
});

describe("getNewVersionArg", () => {
  it("should return major when env.RELEASE_TYPE is auto and there are breaking changes", () => {
    const releaseType = process.env.RELEASE_TYPE;
    process.env.RELEASE_TYPE = "auto";
    assert.strictEqual(
      getNewVersionArg({
        breakingChanges: ["breaking change"],
        newChanges: [],
      }),
      "major"
    );
    process.env.RELEASE_TYPE = releaseType;
  });

  it("should return major when env.RELEASE_TYPE is auto and there are breaking changes and new features", () => {
    const releaseType = process.env.RELEASE_TYPE;
    process.env.RELEASE_TYPE = "auto";
    assert.strictEqual(
      getNewVersionArg({
        breakingChanges: ["breaking change"],
        newChanges: ["new feature"],
      }),
      "major"
    );
    process.env.RELEASE_TYPE = releaseType;
  });

  it("should return minor when env.RELEASE_TYPE is auto and there are no breaking changes, only new features", () => {
    const releaseType = process.env.RELEASE_TYPE;
    process.env.RELEASE_TYPE = "auto";
    assert.strictEqual(
      getNewVersionArg({ breakingChanges: [], newChanges: ["new feature"] }),
      "minor"
    );
    process.env.RELEASE_TYPE = releaseType;
  });

  it("should return patch when env.RELEASE_TYPE is auto and there are no breaking changes and no new features", () => {
    const releaseType = process.env.RELEASE_TYPE;
    process.env.RELEASE_TYPE = "auto";
    assert.strictEqual(
      getNewVersionArg({ breakingChanges: [], newChanges: [] }),
      "patch"
    );
    process.env.RELEASE_TYPE = releaseType;
  });

  it("should return major when env.RELEASE_TYPE is major even when there are no breaking changes", () => {
    const releaseType = process.env.RELEASE_TYPE;
    process.env.RELEASE_TYPE = "major";
    assert.strictEqual(
      getNewVersionArg({ breakingChanges: [], newChanges: [] }),
      "major"
    );
    process.env.RELEASE_TYPE = releaseType;
  });

  it("should return minor when env.RELEASE_TYPE is minor even when there are breaking changes", () => {
    const releaseType = process.env.RELEASE_TYPE;
    process.env.RELEASE_TYPE = "minor";
    assert.strictEqual(
      getNewVersionArg({
        breakingChanges: ["breaking changes"],
        newChanges: [],
      }),
      "minor"
    );
    process.env.RELEASE_TYPE = releaseType;
  });

  it("should return patch when env.RELEASE_TYPE is patch even when there are breaking changes", () => {
    const releaseType = process.env.RELEASE_TYPE;
    process.env.RELEASE_TYPE = "patch";
    assert.strictEqual(
      getNewVersionArg({
        breakingChanges: ["breaking change"],
        newChanges: [],
      }),
      "patch"
    );
    process.env.RELEASE_TYPE = releaseType;
  });

  it("should return patch when env.RELEASE_TYPE is patch", () => {
    const releaseType = process.env.RELEASE_TYPE;
    process.env.RELEASE_TYPE = "patch";
    assert.strictEqual(
      getNewVersionArg({ breakingChanges: [], newChanges: [] }),
      "patch"
    );
    process.env.RELEASE_TYPE = releaseType;
  });

  it("should throw when env.RELEASE_TYPE is not a known keyword", () => {
    const releaseType = process.env.RELEASE_TYPE;
    process.env.RELEASE_TYPE = "banana";
    assert.throws(() => {
      getNewVersionArg({ breakingChanges: [], newChanges: [] });
    }, Error);
    process.env.RELEASE_TYPE = releaseType;
  });
});

describe("getChanges", () => {
  it("should identify breaking changes when properties have been removed", () => {
    const prevTokens = {
      foo: {
        bar: "baz",
      },
      fizz: {
        buzz: "bazz",
      },
      altinn: {
        component: {
          button: {
            default: {
              value: "red",
              type: "color",
            },
            primary: {
              value: "blue",
              type: "color",
            },
          },
        },
      },
    };
    const currentTokens = {
      foo: {
        bar: "baz",
      },
      altinn: {
        component: {
          button: {
            default: {
              value: "red",
              type: "color",
            },
          },
        },
      },
    };
    const result = getChanges({ prevTokens, currentTokens });

    const expected = {
      breakingChanges: [
        "`fizz` has been removed",
        "`altinn.component.button.primary` has been removed",
      ],
      newChanges: [],
      patchChanges: [],
    };

    assert.deepStrictEqual(result, expected);
  });

  it("should identify new features changes when properties have been added", () => {
    const prevTokens = {
      foo: {
        bar: "baz",
      },
      fizz: {
        buzz: "bazz",
      },
    };
    const currentTokens = {
      foo: {
        bar: "baz",
      },
      fizz: {
        buzz: "bazz",
        bar: "baz",
      },
      fruit: "banana",
      altinn: {
        component: {
          button: {
            default: {
              value: "red",
              type: "color",
            },
          },
        },
      },
    };
    const result = getChanges({ prevTokens, currentTokens });

    const expected = {
      breakingChanges: [],
      newChanges: [
        "`fruit` has been added with the value: `banana`",
        "`altinn.component.button.default.value` has been added with the value: `red`",
        "`altinn.component.button.default.type` has been added with the value: `color`",
        "`fizz.bar` has been added with the value: `baz`",
      ],
      patchChanges: [],
    };

    assert.deepStrictEqual(result, expected);
  });

  it("should identify patch changes when property values have been modified", () => {
    const prevTokens = {
      foo: {
        bar: "baz",
      },
      fizz: {
        buzz: "bazz",
      },
      altinn: {
        component: {
          button: {
            default: {
              value: "red",
              type: "color",
            },
          },
        },
      },
    };
    const currentTokens = {
      foo: {
        bar: "baz2",
      },
      fizz: {
        buzz: "bazz2",
      },
      altinn: {
        component: {
          button: {
            default: {
              value: "blue",
              type: "color",
            },
          },
        },
      },
    };
    const result = getChanges({ prevTokens, currentTokens });

    const expected = {
      breakingChanges: [],
      newChanges: [],
      patchChanges: [
        "`foo.bar` value has changed from `baz` to `baz2`",
        "`fizz.buzz` value has changed from `bazz` to `bazz2`",
        "`altinn.component.button.default.value` value has changed from `red` to `blue`",
      ],
    };

    assert.deepStrictEqual(result, expected);
  });
});
