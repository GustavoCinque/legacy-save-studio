# Legacy Save Studio

[![Build Electron](https://github.com/GustavoCinque/legacy-save-studio/actions/workflows/build-electron.yml/badge.svg)](https://github.com/GustavoCinque/legacy-save-studio/actions/workflows/build-electron.yml)

Editor completo e offline para saves de **Brave Frontier: Legacy**, desenvolvido com Next.js, TypeScript e Electron.

## Funcionalidades

- Abre automaticamente o save padrão do Windows ou permite escolher outra pasta.
- Edita jogador, unidades, tipos, níveis, experiência, BB, SBB, bônus e Imps.
- Suporta os tipos Lord, Anima, Breaker, Guardian, Oracle e Rex.
- Filtra unidades por nome, ID, elemento, estrelas e tipo.
- Adiciona unidades individualmente ou em lote pelo catálogo.
- Edita grupos, slots e líder.
- Valida a integridade dos três arquivos JSON antes da gravação.
- Cria backups automáticos e restaura versões anteriores com cópia de segurança.
- Preserva campos desconhecidos do save.
- Interface em inglês, português, francês e espanhol.

## Desenvolvimento web

```powershell
npm ci
npm run dev
```

O frontend fica disponível em `http://localhost:3000`. A abertura e gravação de saves dependem da API segura fornecida pelo Electron.

## Desenvolvimento Electron

```powershell
npm ci
npm run dev:electron
```

## Testes

```powershell
npm test
npm run eval
npm run build
```

## Gerar o pacote Windows localmente

```powershell
npm run build:portable
```

O ZIP será gerado em `release/LegacySaveStudio-Windows-x64.zip`.

## CI/CD

O workflow `.github/workflows/build-electron.yml` executa testes, evals e o build Electron em Windows.

- Em pushes e pull requests, o ZIP fica disponível como artifact da execução por 30 dias.
- Tags no formato `v*`, como `v0.1.5`, também publicam o ZIP em GitHub Releases.
- A pasta `dist/` existe apenas durante o pipeline e não é versionada, pois o ZIP ultrapassa o limite de 100 MB por arquivo do GitHub.

Para publicar uma versão:

```powershell
git tag v0.1.5
git push origin v0.1.5
```
