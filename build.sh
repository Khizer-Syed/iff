#!/bin/bash
# Build Date
build_date=$(date "+%Y-%m-%d")
echo "Build Date - $build_date"

# Delete build folder
echo "**************** Preparing for build *******************"
rm -rf dist
echo "Cleanup complete"

# Build server & client
echo "**************** Running build script *******************"
npm run build:ssr
echo "Build succeeded"

# copy server, package.json and package-lock.json to build folder
echo "**************** Copy package.json and package-lock.json file *******************"
cp package.json package-lock.json dist/iff
echo "Copied Files"

echo "File size before compression: $(du -sh dist)"

# zip folder
echo "**************** Compressing build folder *******************"
build_artifact="dist-"$build_date.zip
zip -r "$build_artifact" dist
echo "File size after compression: $(du -sh "$build_artifact")"


# Cleanup build folder
echo "**************** Deleting build folder *******************"
rm -rf dist
echo "Folder deleted"



