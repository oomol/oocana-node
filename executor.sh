#!/usr/bin/env bash
set -xeuo pipefail

DIR=$(cd $(dirname "$0"); pwd -P)
echo $DIR
cd $DIR

mp=m

sudo ovmlayer create executor
corepack enable

pnpm install && pnpm build
tarball=$(cd packages/executor && pnpm pack --pack-destination /tmp/executor)
tar -zxvf $tarball -C /tmp/executor
(cd /tmp/executor/package && npm pkg delete devDependencies && pnpm install)
(cd /tmp/executor/package/dist && chmod +x nodejs-executor)

mv /tmp/executor/package /tmp/executor/executor

sudo ovmlayer cp --mode host2layer /tmp/executor/executor executor:/
sudo ovmlayer cp --mode host2layer $DIR/install-node.sh executor:/

sudo ovmlayer merge -l executor -m $mp
sudo ovmlayer run --all-devices --merged-point=$mp bash -c 'echo "export PATH=/executor/dist:\$PATH" >> ~/.zshrc'
sudo ovmlayer run --all-devices --merged-point=$mp zsh -c -i '/install-node.sh'
sudo ovmlayer unmerge $mp
