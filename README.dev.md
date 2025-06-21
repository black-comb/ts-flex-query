# ts-flex-query development notes

## Publishing a new version

* In the [package.json](./package.json), set the desired new version.

* In the [CHANGELOG.md](./CHANGELOG.md), add an entry for the new version.

* In this README file, update the [Dependency versions](#dependency-versions) table for the new version if it is a new feature or major version.

* Run the script `do-publish`.

## TypeScript update

* Add a new package alias `"typescript-[OLD_MINOR_VERSION]": "npm:typescript@~[OLD_VERSION]"` to the devDependencies in the [package.json](./package.json) file.

  Example: `"typescript-4.8": "npm:typescript@~4.8.4"`

* Update the typescript version in devDependencies to `"~[NEW_VERSION]"`.

  Example: `"typescript": "~4.9.3"`

* Add a new script `"tsc-[OLD_MINOR_VERSION]"` to the [package.json](./package.json) file which will invoke the old tsc.

  Example: `"tsc-4.8": "node ./node_modules/typescript-4.8/bin/tsc"`

* Extend the `build-with-samples` script to build the samples using the newly created tsc script.

  Example: `npm run tsc-4.8 -- -p ./samples/tsconfig.json`

* By running `npm run build-with-samples`, determine if old TypeScript versions are still building. If not, remove the respective TypeScript versions from the package.json (package alias, script, build-samples script part).

* In this README.md file, update the [Dependency Versions](#dependency-versions) table.

These steps will ensure that, for future changes, compatibility with old TypeScript versions is ensured. If compatibilty with an old version breaks, a new major version of ts-flex-query needs to be released according to the following section.

Immediately publishing a new version of ts-flex-query is only required if changes were necessary to build with the new TypeScript version.
