# Altinn Figma Design Tokens

Design tokens generated from Figma.

### Yarn 2+

Run `yarn add @altinn/figma-design-tokens`

### NPM

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

There may have been tokens that have been renamed or removed, which means consumers of this package need to take action before upgrading. So before creating a new version, be sure to **check the commit history for breaking changes**.

For now this is a manual process. Look at the [commit history](https://github.com/Altinn/figma-design-tokens/commits/main) for the main branch, and inspect the commits up until the previous tagged commit.

Then go to the Github Actions, and trigger a new Release with the correct version bump. If there is a breaking change, release it as a major version. If there is no breaking changes, release it as a minor version.
