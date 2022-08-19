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

const Foo = () => <div style={{ padding: tokens.SpaceStandard }}>Hi</div>;
```

Or as JSON:

```jsx
import tokens from "@altinn/figma-design-tokens/dist/tokens.json";

const Foo = () => (
  <div style={{ padding: tokens.space.standard.value }}>Hi</div>
);
```

(Note that in TypeScript you'll want to set `resolveJsonModule: true` for the above to work.)

## Editing tokens

You should use Figma to edit the tokens. You'll need the [Figma Tokens](https://docs.tokens.studio/) plugin installed in Figma, and configured to sync with this GitHub repo.

1. [Install](https://www.figma.com/community/plugin/843461159747178978/Figma-Tokens) the Figma Tokens plugin
1. Generate a new Personal Access Token (PAT) in [GitHub Developer Settings](https://github.com/settings/tokens) with scope `repo`
1. Copy the PAT (you can only see it once)
1. In the Figma Tokens plugin, under `Sync > GitHub`, add new credentials:
   - Name: `Altinn Figma Tokens`
   - Personal Access Token: _your PAT_
   - Repository: `Altinn/figma-design-tokens`
   - Default Branch: `main`
   - File Path: `tokens.json`

You can now "pull from GitHub" (button on top right) to fetch the tokens. When done editing tokens, you should "push to GitHub" (second button on top right).

## Releasing a new version

Go to Github Actions, and trigger a new Release. For most cases, `auto` should be the preferred option. This will automatically identify breaking changes, new features, or changed values between previous release and the current release. A changelog with the differences will also be created and added to the release.

There may be edge cases where you want to force the release to be of a certain type, where you can select one of the other options.
