#!/usr/bin/env bash

# Build files for distribution


#-01 Build js files
./node_modules/.bin/esbuild scripts/index.js --bundle --minify --sourcemap --outfile=bundle.js

#-02 Create dist directory if it does not exist
if [[ ! -d dist ]]; then
	mkdir -v dist
fi

#-03 Copy bundle.js to dist with hash appended to name
file=bundle.js
filename_wo_ext=`cut -d"." -f1 <<< "$file"`
filename_ext=`cut -d"." -f2 <<< "$file"`
filename_hash=`shasum "$file" | cut -d' ' -f1`
filename_w_hash="$filename_wo_ext.$filename_hash.$filename_ext"
cp -p "$file" dist/"$filename_wo_ext.$filename_hash.$filename_ext"

#-04 Create dist/index.html with correct hash file selected
sed -E "s|( src=\"./$filename_wo_ext)(.js\")|\1.$filename_hash\2|" index.html > dist/index.html

#-05 Copy styles
cp -p index.css dist/index.css
