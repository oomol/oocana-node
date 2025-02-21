apt update && apt install -y curl unzip
# github action 的 SHELL 变量应该是 bash，导致 fnm 永远安装到 bash 的环境变量中
export SHELL=/bin/zsh
# Download and install fnm:
curl -o- https://fnm.vercel.app/install | zsh

. ~/.zshrc

fnm install 22
# Download and install Node.js:

# Verify the Node.js version:
node -v # Should print "v22.14.0".
# Verify npm version:
npm -v # Should print "10.9.2".
npm install -g pnpm
corepack enable