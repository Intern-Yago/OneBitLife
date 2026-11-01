const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '../..');
const sourceZip = path.join(projectRoot, '.github/archives/sqlite-amalgamation-3450300.zip');
const expoSqliteDir = path.join(projectRoot, 'node_modules/expo-sqlite/android');
const buildGradlePath = path.join(expoSqliteDir, 'build.gradle');

console.log('[Patch SQLite] Iniciando verificação e aplicação do patch offline do SQLite...');

try {
  if (!fs.existsSync(expoSqliteDir)) {
    console.log('[Patch SQLite] expo-sqlite android não encontrado (pode não estar instalado ainda).');
    process.exit(0);
  }

  // 1. Criar pasta downloads persistente dentro de expo-sqlite/android
  const targetDownloadsDir = path.join(expoSqliteDir, 'downloads');
  if (!fs.existsSync(targetDownloadsDir)) {
    fs.mkdirSync(targetDownloadsDir, { recursive: true });
  }

  // 2. Copiar o arquivo pré-baixado do SQLite para evitar qualquer requisição de rede
  const targetZip = path.join(targetDownloadsDir, 'sqlite-amalgamation-3450300.zip');
  if (fs.existsSync(sourceZip)) {
    fs.copyFileSync(sourceZip, targetZip);
    console.log(`[Patch SQLite] Arquivo SQLite copiado para: ${targetZip}`);
  } else {
    console.warn('[Patch SQLite] Aviso: Arquivo de arquivo .github/archives não encontrado.');
  }

  // 3. Modificar build.gradle para usar a pasta downloads persistente e pular download se o arquivo já existe
  if (fs.existsSync(buildGradlePath)) {
    let gradleContent = fs.readFileSync(buildGradlePath, 'utf8');

    // Substituir downloadsDir para apontar para projectDir/downloads
    gradleContent = gradleContent.replace(
      /def downloadsDir = customDownloadsDir \? new File\(customDownloadsDir\) : new File\("\$buildDir\/downloads"\)/,
      'def downloadsDir = new File(projectDir, "downloads")'
    );

    // Adicionar onlyIf ao task downloadSQLite
    const oldDownloadTask = `def downloadSQLite = tasks.register('downloadSQLite', Download) {
  dependsOn(createNativeDepsDirectories)
  src("https://www.sqlite.org/2024/sqlite-amalgamation-\${SQLITE_VERSION}.zip")
  onlyIfNewer(true)
  overwrite(false)
  dest(new File(downloadsDir, "sqlite-amalgamation-\${SQLITE_VERSION}.zip"))
}`;

    const newDownloadTask = `def downloadSQLite = tasks.register('downloadSQLite', Download) {
  dependsOn(createNativeDepsDirectories)
  src("https://www.sqlite.org/2024/sqlite-amalgamation-\${SQLITE_VERSION}.zip")
  onlyIfNewer(false)
  overwrite(false)
  dest(new File(downloadsDir, "sqlite-amalgamation-\${SQLITE_VERSION}.zip"))
  onlyIf {
    !new File(downloadsDir, "sqlite-amalgamation-\${SQLITE_VERSION}.zip").exists()
  }
}`;

    if (gradleContent.includes("src(\"https://www.sqlite.org/2024/sqlite-amalgamation-${SQLITE_VERSION}.zip\")")) {
      gradleContent = gradleContent.replace(oldDownloadTask, newDownloadTask);
      fs.writeFileSync(buildGradlePath, gradleContent, 'utf8');
      console.log('[Patch SQLite] build.gradle do expo-sqlite modificado com sucesso (modo offline garantido)!');
    } else {
      console.log('[Patch SQLite] build.gradle já parece estar modificado.');
    }
  }
} catch (err) {
  console.error('[Patch SQLite] Erro durante aplicação do patch:', err.message);
}
