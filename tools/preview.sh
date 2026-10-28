#!/bin/sh
# Publish the game files of the current checkout to the preview site (https://drag0nblad3.github.io/Blackharbor-preview/)
# so a change can be played before its pull request. Usage, from the repo root on your branch: sh tools/preview.sh
# Replaces the game files on drag0nblad3/Blackharbor-preview main; its Pages workflow deploys them with a separate save key.
set -eu
root=$(git rev-parse --show-toplevel); cd "$root"
files=$(ls index.html *.css *.js)
if [ -n "$(git status --porcelain -- $files)" ]; then echo "Commit the game file changes first, so the preview matches a commit."; exit 1; fi
branch=$(git rev-parse --abbrev-ref HEAD); sha=$(git rev-parse --short HEAD); subj=$(git log -1 --format=%s)
dir=${PREVIEW_DIR:-$root/../blackharbor-preview}
[ -d "$dir/.git" ] || git clone --depth 1 https://github.com/drag0nblad3/blackharbor-preview "$dir"
git -C "$dir" fetch -q --depth 1 origin main && git -C "$dir" checkout -q -B main origin/main
(cd "$dir" && git rm -q --ignore-unmatch -- $(ls index.html *.css *.js 2>/dev/null) >/dev/null)
cp $files "$dir/"
printf '# Blackharbor preview\n\nSource: `%s` @ %s\n\n%s\n\nPublished by tools/preview.sh in drag0nblad3/Blackharbor. The live game is https://drag0nblad3.github.io/Blackharbor/\n' "$branch" "$sha" "$subj" > "$dir/PREVIEW_STATUS.md"
cd "$dir"; git add -A
if git diff --cached --quiet; then echo "Preview already shows $branch @ $sha."; else git commit -q -m "Preview $branch @ $sha: $subj" && git push -q origin main; fi
echo "Preview: https://drag0nblad3.github.io/Blackharbor-preview/ (deploys in about a minute; runs: https://github.com/drag0nblad3/Blackharbor-preview/actions)"
