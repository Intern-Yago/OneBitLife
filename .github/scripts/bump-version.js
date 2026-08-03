const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Caminhos dos arquivos
const pkgPath = path.join(__dirname, '../../package.json');
const appJsonPath = path.join(__dirname, '../../app.json');
const changelogPath = path.join(__dirname, '../../CHANGELOG.md');
const releaseNotesPath = path.join(__dirname, '../../RELEASE_NOTES.md');

// Argumento de release type: patch | minor | major
const bumpType = process.argv[2] || 'patch';

// 1. Ler package.json e app.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// 2. Incrementar versão SemVer
const currentVersion = pkg.version || '1.0.0';
const versionParts = currentVersion.split('.').map(Number);
let [major, minor, patch] = versionParts;

if (bumpType === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
} else if (bumpType === 'minor') {
  minor += 1;
  patch = 0;
} else {
  // patch por padrão
  patch += 1;
}

const newVersion = `${major}.${minor}.${patch}`;
console.log(`Bumping version: ${currentVersion} -> ${newVersion} (${bumpType})`);

// 3. Atualizar package.json
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// 4. Atualizar app.json (Expo)
if (appJson.expo) {
  appJson.expo.version = newVersion;
  if (!appJson.expo.android) {
    appJson.expo.android = {};
  }
  const currentVersionCode = appJson.expo.android.versionCode || 1;
  appJson.expo.android.versionCode = currentVersionCode + 1;

  if (!appJson.expo.ios) {
    appJson.expo.ios = {};
  }
  appJson.expo.ios.buildNumber = newVersion;
}
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

// 5. Coletar logs do git para o Changelog
let commitLogs = '';
try {
  let lastTag = '';
  try {
    lastTag = execSync('git describe --tags --abbrev=0', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
  } catch (e) {
    lastTag = '';
  }

  const logCmd = lastTag 
    ? `git log ${lastTag}..HEAD --pretty=format:"- %s (%h)"` 
    : `git log -n 10 --pretty=format:"- %s (%h)"`;

  commitLogs = execSync(logCmd, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
} catch (err) {
  console.warn('Não foi possível obter os logs do git:', err.message);
}

if (!commitLogs) {
  commitLogs = '- Atualizações e melhorias gerais no aplicativo.';
}

const dateStr = new Date().toISOString().split('T')[0];

const releaseSection = `## [v${newVersion}] - ${dateStr}\n\n### Alterações nesta versão:\n${commitLogs}\n`;

// 6. Escrever RELEASE_NOTES.md
fs.writeFileSync(releaseNotesPath, releaseSection);

// 7. Atualizar CHANGELOG.md
let changelogContent = '';
if (fs.existsSync(changelogPath)) {
  changelogContent = fs.readFileSync(changelogPath, 'utf8');
} else {
  changelogContent = `# Changelog\n\nTodas as alterações notáveis neste projeto serão documentadas neste arquivo.\n\n---\n`;
}

// Inserir a nova seção logo após o cabeçalho principal do Changelog
if (changelogContent.includes('# Changelog')) {
  changelogContent = changelogContent.replace(
    /# Changelog\n+/,
    `# Changelog\n\n${releaseSection}\n---\n\n`
  );
} else {
  changelogContent = `# Changelog\n\n${releaseSection}\n---\n\n` + changelogContent;
}

fs.writeFileSync(changelogPath, changelogContent);

// 8. Definir output para GitHub Actions se aplicável
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${newVersion}\n`);
}

console.log(`Versão v${newVersion} gerada com sucesso!`);
