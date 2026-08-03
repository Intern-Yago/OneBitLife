const fs = require('fs');
const path = require('path');

const fileToPatch = path.join(__dirname, '../../node_modules/expo-modules-core/android/build.gradle');

try {
  if (fs.existsSync(fileToPatch)) {
    let content = fs.readFileSync(fileToPatch, 'utf8');
    
    // Substituir a URL morta do jfrog.io pela URL oficial em funcionamento da archives.boost.io
    const oldUrlPattern = /https:\/\/boostorg\.jfrog\.io\/artifactory\/main\/release\/\$\{BOOST_VERSION\.replace\("_", "\."\)\}\/source\/boost_\$\{BOOST_VERSION\}\.tar\.gz/g;
    const newUrl = 'https://archives.boost.io/release/${BOOST_VERSION.replace("_", ".")}/source/boost_${BOOST_VERSION}.tar.gz';
    
    if (content.match(oldUrlPattern)) {
      content = content.replace(oldUrlPattern, newUrl);
      fs.writeFileSync(fileToPatch, content, 'utf8');
      console.log('[Patch Boost] Sucesso: URL do Boost corrigida para archives.boost.io em expo-modules-core!');
    } else {
      console.log('[Patch Boost] URL já estava corrigida ou padrão não encontrado.');
    }
  } else {
    console.warn('[Patch Boost] Aviso: expo-modules-core build.gradle não encontrado.');
  }
} catch (error) {
  console.error('[Patch Boost] Erro ao aplicar o patch:', error.message);
}
