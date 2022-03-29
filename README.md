# Altinn Figma Design Tokens

Design tokens generated from Figma.

## Installation

- [Acquire a GitHub PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token). The only permission you need to grant is `read:packages`
- Assign the PAT to the `GITHUB_PACKAGES_PAT` environment variable:
  - Mac/Linux: add the line `export GITHUB_PACKAGES_PAT=<PAT>` to `~/.bash_profile` and restart the terminal
  - Windows: Run `setx GITHUB_PACKAGES_PAT=<PAT>` and restart the terminal

### Yarn 2+

In `.yarnrc`:

```yaml
npmScopes:
  altinn:
    npmRegistryServer: https://npm.pkg.github.com
    npmAuthToken: ${GITHUB_PACKAGES_PAT:-}
```

Run `yarn add @altinn/figma-design-tokens`

### NPM / Yarn 1

In `.npmrc`:

```plain
@altinn:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_PAT}
```

Run `npm i @altinn/figma-design-tokens`

## Usage

You can use CSS variables:

```js
import "@altinn/figma-design-tokens/dist/tokens.css";
```

```css
div {
  padding: var(--space-standard);
}
```

Or use the tokens as a module:

```jsx
import tokens from "@altinn/figma-design-tokens";

const Foo = () => <div style={{ padding: tokens.SpaceStandard }}>Hi</div>
```

Or as JSON:

```jsx
import tokens from "@altinn/figma-design-tokens/dist/tokens.json";

const Foo = () => <div style={{ padding: tokens.space.standard.value }}>Hi</div>
```

(Note that in TypeScript you'll want to set `resolveJsonModule: true` for the above to work.)

## Editing tokens

You should use Figma to edit the tokens. You'll need the [Figma Tokens](https://docs.tokens.studio/) plugin installed in Figma, and configured to sync with this GitHub repo.

1. [Install](https://www.figma.com/community/plugin/843461159747178978/Figma-Tokens) the Figma Tokens plugin
1. Generate a new Personal Access Token (PAT) in [GitHub Developer Settings](https://github.com/settings/tokens) with scope `repo`
1. Copy the PAT (you can only see it once)
1. In the Figma Tokens plugin, under `Sync > GitHub`, add new credentials:
    - Name: `Altinn Figma Tokens`
    - Personal Access Token: *your PAT*
    - Repository: `Altinn/figma-design-tokens`
    - Default Branch: `main`
    - File Path: `tokens.json`

You can now "pull from GitHub" (button on top right) to fetch the tokens. When done editing tokens, you should "push to GitHub" (second button on top right).

## Releasing a new version

Run `yarn release <patch|minor|major>` and push with tags: `git push --follow-tags`. The CI/CD GitHub Action will build and release a new package to the GitHub NPM repo.
