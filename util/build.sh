#!/usr/bin/env bash

# Build files for distribution


#-01 Ensure that dist directory exists
if [[ ! -d dist ]]; then
	mkdir -v dist >/dev/null
fi


#-02 Build js bundle in dist
./node_modules/.bin/esbuild src/scripts/index.js --bundle --minify --sourcemap --outfile=dist/bundle.js


#-03 Append hash to bundle filename
cd dist >/dev/null
file=bundle.js
filename_wo_ext=`cut -d"." -f1 <<< "$file"`
filename_ext=`cut -d"." -f2 <<< "$file"`
filename_hash=`shasum "$file" | cut -d' ' -f1`
filename_w_hash="$filename_wo_ext.$filename_hash.$filename_ext"
mv "$file.map" "$filename_w_hash.map"
sed -E "s|(//# sourceMappingURL=)$file(.map)|\1$filename_w_hash\2|" "$file" > "$filename_w_hash"
cd - >/dev/null


#-04 Create dist/index.html with hash-named bundle file selected
sed -E "s|( src=\"./$filename_wo_ext)(.js\")|\1.$filename_hash\2|" src/index.html > dist/index.html


#-05 Copy styles
cp -p src/index.css dist/index.css
