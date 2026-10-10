# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```
See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Deployment On Windows

Open PowerShell on your Windows computer.

Create an ssh key for gitea deployment:

```powershell
ssh-keygen -t ed25519 -C "gitea-deploy" -f "$HOME\.ssh\gitea_deploy_key"
```

In a VPS server, create the deployment user

```bash
sudo adduser gitea-deployer
sudo install -d -m 700 -o deploy -g deploy /home/gitea-deployer/.ssh
```

Because no ssh-copy-id is available on Windows, you need to copy the public key to the server manually.

```powershell
type $HOME\.ssh\gitea_deploy_key.pub | ssh gitea-deployer@112.213.91.239 -p 2212 "cat >> ~/.ssh/authorized_keys"
```

Test ssh connected with a private key

```powershell
ssh gitea-deployer@112.213.91.239 -p 2212 -i "$HOME\.ssh\gitea_deploy_key" -o IdentitiesOnly=yes
```


