# Release to npm

This project uses pnpm and Changesets. The default branch is `master`. Release the
versioned commit from `master` after you push it to GitHub.

## Prepare the release

1. Get the latest `master` commit. Confirm that your working copy has no changes
   and that local `master` matches `master@origin`.

   ```sh
   jj git fetch
   jj new master
   jj status
   jj log -r 'master | master@origin'
   ```

   Do not start the release if `master` and `master@origin` differ.

2. Confirm that you can publish to the npm registry and that the new version is
   not already published.

   ```sh
   pnpm whoami
   pnpm view svelte-maplibre version dist-tags --json
   pnpm changeset status
   ```

   If `pnpm whoami` fails, sign in with `pnpm login` or set up a valid npm
   publish token before you continue. npm may require a second authentication
   step when you publish, even if `pnpm whoami` works.

   If there is no changeset for a change that affects the package, add one with
   `pnpm changeset` before you version the release. Review the proposed version
   against the changes since the last release.

3. Install from the lockfile, then run the project checks.

   ```sh
   pnpm install --frozen-lockfile
   pnpm run check
   pnpm run lint
   pnpm run package
   pnpm run build
   pnpm test
   ```

4. Generate the version and changelog from the changesets. This command uses
   `gh auth token` to let the changelog link to GitHub contributors and pull
   requests.

   ```sh
   pnpm run generate-changelog
   ```

   Review `package.json`, `CHANGELOG.md`, and the consumed changeset files. Check
   that the version is greater than the published version. Commit the release
   files and push `master` before publishing:

   ```sh
   jj commit -m "vX.Y.Z"
   jj bookmark move master --to @-
   jj git push -b master
   ```

5. Check the package contents and publish the new version under `latest`.

   ```sh
   pnpm pack --dry-run
   pnpm changeset publish --no-git-tag
   ```

   `changeset publish` publishes versions that are not yet on npm. Complete any
   npm authentication prompt. Do not run the publish command again until you
   check the registry if a publish attempt fails.

## Verify and tag

Confirm that `latest` points to the new version. Tag the `master` release commit,
then push the tag.

```sh
pnpm view svelte-maplibre version dist-tags --json
git tag vX.Y.Z "$(jj log -r master -T commit_id)"
git push origin vX.Y.Z
```

Replace `X.Y.Z` with the new version. Check that the tag points to the release
commit. Do not publish the same version again: npm does not allow a published
version to be replaced.

## Create the GitHub release

Use the matching section of `CHANGELOG.md` as the GitHub release notes. Create
the release only after npm shows the new version and the Git tag is on GitHub.

```sh
awk -v version="X.Y.Z" '$0 == "## " version { in_release=1; next } in_release && /^## / { exit } in_release { print }' CHANGELOG.md > /tmp/svelte-maplibre-release-notes.md
gh release create vX.Y.Z --verify-tag --title vX.Y.Z --notes-file /tmp/svelte-maplibre-release-notes.md
```

Replace `X.Y.Z` in both commands. Check the release page to confirm that its
notes match the changelog.
