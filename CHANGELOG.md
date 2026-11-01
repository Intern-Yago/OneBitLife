# Changelog

## [v1.2.0] - 2026-11-01

### Alterações nesta versão:
- feat(mascot): add standby state when user has no active routines (969c2b8)

---

## [v1.1.4] - 2026-11-01

### Alterações nesta versão:
- fix(mascot): restore robot visibility with explicit Lottie dimensions and dynamic Tamagotchi hunger states (a2645c8)

---

## [v1.1.3] - 2026-10-31

### Alterações nesta versão:
- fix(runtime): eliminate launch crash and white flash with Lottie source guards, robust SQLite adapter, and CyberErrorBoundary (f326523)

---

## [v1.1.2] - 2026-10-31

### Alterações nesta versão:
- fix(build): pre-bundle SQLite amalgamation archive and enforce IPv4 to resolve download failure (6ad6d12)

---

## [v1.1.1] - 2026-10-31

### Alterações nesta versão:
- fix(ci): restore missing dependencies for Expo SDK 51 and remove restrictive memory cap in eas.json (316cc00)

---

## [v1.1.0] - 2026-10-31

### Alterações nesta versão (SemVer Minor):
- feat(books): integração com Open Library API (Internet Archive) para busca universal de livros em qualquer disciplina (Biologia, Direito, Medicina, Arte, etc.) com capas ao vivo e links de compra (977a44d)
- feat(release): migração para o Expo SDK 51, React Native 0.74 e conformidade com Android API 34 da Play Store (0adc514)
- feat(workouts): bateria oficial de avaliação física biomecânica (Calistenia 13 testes + Musculação 12 testes com força relativa e estimativa submáxima segura de 1RM)
- feat(habits): forjador de metas inteligente com botão 'Gerar Automático' sem duplicações e alerta de sobrecarga cognitiva
- fix(audio): efeitos sonoros sintetizados em arquivos nativos WAV PCM 16-bit com reprodução em alto-falante e haptic feedback
- fix(xp): cálculo unificado de XP e pontuação no SQLite somando checks de rotinas e +50 XP por Side Quest concluída
- feat(ui): substituição de popups nativos brancos pelo CyberModal dark neon e eliminação do excesso de emojis por ícones SVG e tipografia Anthropic

---

## [v1.0.14] - 2026-10-31

### Alterações nesta versão:
- feat(books): integrate Open Library universal book search with live covers, area chips, and buy links (977a44d)
- feat(release): merge Expo SDK 51 migration with physical assessments, expanded wisdom library, audio sfx, and cyber forge (0adc514)
- feat(rpg): physical assessment battery, expanded wisdom library with wishlist and buy links, auto-forge routine, cognitive overload alert, and xp bug fix (7112564)
- feat(mobile): fix sound effects with bundled wav assets, add sqlite modern adapter, and smart build skip filter in CI (d03683d)
- ci: sync eas-cli npm install fix to v51 upgrade branch (7fcff20)

---

## [v1.0.13] - 2026-10-31

### Alterações nesta versão:
- feat(landing): redesign GitHub Pages landing page with Anthropic cyber aesthetics and live audio simulator (7838a59)

---

## [v1.0.12] - 2026-10-31

### Alterações nesta versão:
- ci: fix eas-cli installation using npm instead of yarn action (890d9b0)

---

## [v1.0.11] - 2026-10-31

### Alterações nesta versão:
- ci: trigger release workflow automatically on push to main (8d59dc1)
- security: apply mobile hardening (allowBackup false, sanitized inputs, hardened CI/CD workflow) (a3e952c)
- feat: complete overhaul to OneBitLife 2.0 (quests, workouts, books, focus zen, audio sfx, daily challenges, badges) (251752e)

---

## [v1.0.10] - 2026-08-04

### Alterações nesta versão:
- Atualizações e melhorias gerais no aplicativo.

---

## [v1.0.9] - 2026-08-04

### Alterações nesta versão:
- feat(gameover): add non-destructive avatar recovery mode preserving custom habits on game over (0110754)
- fix(checks): bind habit checks to individual habit ID to guarantee accurate check calculation (01dcef7)
- feat(habits): allow typing custom habit names and practical multiple habits per area (b9a3aef)
- fix(notifications): resolve notification crashes, add safe area transparent bars, and implement achievements panel (3013bcf)

---

## [v1.0.8] - 2026-08-03

### Alterações nesta versão:
- fix(eas): remove invalid node property in eas.json (f100c81)

---

## [v1.0.7] - 2026-08-03

### Alterações nesta versão:
- fix(ci): use build-output.json and jq pattern in release workflow and add owner to app.json (55163e4)
- fix(eas): limit Gradle JVM memory usage and specify Node 20.x in androidApk build profile (a6a822c)

---

## [v1.0.6] - 2026-08-03

### Alterações nesta versão:
- fix(ci): avoid tag collision and force-update tags on re-run (d7816f3)
- fix(ci): update build artifact download logic in release workflow (55b01c2)
- style: enlarge navbar logo to 56px and remove all remaining emojis from buttons (76a0001)
- style: update dailyChecks text to futuristic HUD style without emojis (9008aa3)
- style: replace emojis with futuristic SVG HUD icons and Cyberpunk RPG tags (0e7c86c)

---

## [v1.0.5] - 2026-08-03

### Alterações nesta versão:
- fix(build): add postinstall patch for expo-modules-core boost download URL (a80ed3a)

---

## [v1.0.4] - 2026-08-03

### Alterações nesta versão:
- fix(eas): add Boost mirror URL to fix android gradle build Not in GZIP format error (834891b)
- refactor: restore instant hardcore Game Over reset mechanic (afbd97e)
- feat: add RPG player leveling system, haptic vibration feedback and reset confirmation (6ab4bb9)
- docs: add technical README documentation and web landing page (73713c8)

---

## [v1.0.3] - 2026-08-03

### Alterações nesta versão:
- fix(ci): use eas build:download to fetch APK artifact from EAS Cloud (fd224d1)

---

## [v1.0.2] - 2026-08-03

### Alterações nesta versão:
- fix(ci): update Node version to 20, fix expo dependencies and add expo doctor step (b258d57)

---

## [v1.0.1] - 2026-08-03

### Alterações nesta versão:
- fix(ci): remove RELEASE_NOTES.md from git add in release workflow (dc27ba2)
- ci: add release workflow, changelog and versioning script (21c4602)
- reconfigurando (d174344)
- reconfigurando (52d47a0)
- ajustando cores (04455c7)
- androidAPK (97cc9e4)
- criando gameover (841d1d4)
- soma de checks (86b48d0)
- acordando check com barra (d19d95e)
- estruturando animações (afd5108)

---

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

---

## [v1.0.0] - 2026-08-03

### Lançamento Inicial
- Versão inicial do aplicativo OneBitLife.
