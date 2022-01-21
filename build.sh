#!/bin/bash
# Build Date
build_date=$(date "+%Y-%m-%d")
echo "Build Date - $build_date"

# Delete build folder
echo "**************** Preparing for build *******************"
rm -rf iffcargo
echo "Cleanup complete"

# Build server & client
echo "**************** Running build script *******************"
npm run build
echo "Build succeeded"

# copy server, package.json and package-lock.json to build folder
echo "**************** Copy package.json and package-lock.json file *******************"
cp package.json package-lock.json iffcargo
echo "Copied Files"

echo "File size before compression: $(du -sh iffcargo)"

# zip folder
echo "**************** Compressing build folder *******************"
build_artifact="iffcargo-"$build_date.zip
zip -r "$build_artifact" iffcargo
echo "File size after compression: $(du -sh "$build_artifact")"


# Cleanup build folder
echo "**************** Deleting build folder *******************"
rm -rf iffcargo
echo "Folder deleted"



