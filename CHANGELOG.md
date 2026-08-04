# Changelog

## [v1.0.10] - 2026-08-04

### Alterações nesta versão:
- Atualizações e melhorias gerais no aplicativo.

---

## [v1.0.9] - 2026-08-04

### Alterações nesta versão:
- feat(gameover): add non-destructive avatar recovery mode preserving custom habits on game over (0110754)
- fix(checks): bind habit checks to individual habit ID to guarantee accurate check calculation (01dcef7)
- feat(habits): allow typing custom habit names and creating multiple habits per area (b9a3aef)
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
