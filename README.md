<div align="center">

  <img src="./src/assets/icons/logo3.png" alt="OneBitLife Logo" width="360" />

  ### [ CYBER GAMIFICATION SYSTEM ] Transforme sua vida em um RPG real.

  [![React Native](https://img.shields.io/badge/React_Native-0.70.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-SDK_47-000000?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![GitHub Release](https://img.shields.io/github/v/release/Intern-Yago/OneBitLife?style=for-the-badge&color=85BB65)](https://github.com/Intern-Yago/OneBitLife/releases)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

  <br />

  [ [ 🌐 LANDING PAGE ] ](./index.html) • [ [ 📱 BAIXAR APK ] ](https://github.com/Intern-Yago/OneBitLife/releases) • [ [ 📖 DOCUMENTAÇÃO ] ](#-sumário)

</div>

---

## [ SUMÁRIO ]

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Os 4 Pilares da Vida](#-os-4-pilares-da-vida)
- [Sistema de Níveis & XP](#-sistema-de-níveis--xp)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura de Pastas](#-arquitetura-de-pastas)
- [Como Executar o Projeto](#-como-executar-o-projeto)
- [Pipeline de CI/CD & Automação de Release](#-pipeline-de-cicd--automação-de-release)
- [Licença](#-licença)

---

## [ SOBRE O PROJETO ]

O **OneBitLife** é um aplicativo mobile desenvolvido com React Native e Expo que aplica os princípios de **gamificação avançada na construção de hábitos**.

Como em um RPG hardcore, o usuário gerencia um avatar cujos sistemas vitais dependem diretamente do cumprimento de hábitos em tempo real. Se o usuário negligenciar seus compromissos e suas barras de status chegarem a zero, o jogo entra em **Game Over** instantâneo, forçando a disciplina e consistência de forma intensa.

---

## [ FUNCIONALIDADES PRINCIPAIS ]

- **[ CORE ] Gestão de Hábitos**: Criação, edição e exclusão de hábitos em 4 categorias vitais.
- **[ FREQUENCY ] Frequências Customizadas**: Definição de hábitos Diários, Semanais ou Mensais.
- **[ HUD ] Barras de Status Dinâmicas**: Acompanhamento dos sistemas vitais em tempo real.
- **[ HAPTIC ] Feedback Tátil**: Resposta tátil por vibração ao concluir metas.
- **[ HARDCORE ] Game Over Instantâneo**: Mecânica sem tolerância para barras zeradas.
- **[ LEVEL ] Sistema de XP**: Progressão de patentes de acordo com o total de checks efetuados.
- **[ DB ] Persistência Offline**: Banco de dados relacional SQLite local embarcado.
- **[ PUSH ] Notificações Locais**: Agendamento de alertas em horários personalizados.

---

## [ OS 4 PILARES DA VIDA ]

O aplicativo divide os hábitos em quatro módulos fundamentais:

| Módulo | Cor | Descrição |
| :--- | :---: | :--- |
| **[ MENTE ]** | `#90B7F3` | Leitura, estudos, aprendizado contínuo e foco mental. |
| **[ FINANCEIRO ]** | `#85BB65` | Gestão de recursos, economia, investimentos e reserva. |
| **[ CORPO ]** | `#FF0044` | Exercícios físicos, hidratação, nutrição e descanso. |
| **[ HUMOR ]** | `#FE7F23` | Saúde mental, conexões pessoais, lazer e renovação. |

---

## [ SISTEMA DE NÍVEIS & XP ]

Progressão de patente calculada com base no acumulado de checks efetuados:

- **0 a 9 Checks** → `Nível 1 • Cyber Recruta`
- **10 a 24 Checks** → `Nível 2 • Operador Neon`
- **25 a 49 Checks** → `Nível 3 • Guardião do Core`
- **50 a 99 Checks** → `Nível 4 • Mestre dos Hábitos`
- **100+ Checks** → `Nível 5 • Lenda Cyberpunk`

---

## [ TECNOLOGIAS UTILIZADAS ]

### Core & UI
- **React Native** (v0.70.8) - Framework multiplataforma.
- **Expo SDK** (v47) - Ecossistema mobile.
- **React Navigation** (v6) - Navegação Native Stack.
- **React Native Paper** - Componentes de interface.
- **Lottie React Native** - Animações de estado.

### Banco de Dados & Serviços
- **Expo SQLite** - Armazenamento de dados offline-first.
- **Expo Notifications** - Notificações locais.

### Automação & CI/CD
- **GitHub Actions** - Workflows automatizados de release.
- **Expo EAS Build** - Compilação na nuvem do APK Android.

---

## [ ARQUITETURA DE PASTAS ]

```text
OneBitLife/
├── .github/
│   ├── scripts/
│   │   ├── bump-version.js       # Script de versionamento semântico e Changelog
│   │   └── patch-boost.js        # Patch de compilação da dependência Boost C++
│   └── workflows/
│       └── release.yml           # Workflow do GitHub Actions para Build e Release
├── src/
│   ├── assets/                   # Ícones e animações do avatar
│   ├── components/               # Componentes reutilizáveis de UI
│   ├── Database/                 # Inicialização e SQL do Expo SQLite
│   ├── pages/                    # Telas da aplicação (Start, Explanation, Home, HabitPage)
│   ├── routes/                   # Configuração das rotas de navegação
│   └── services/                 # Serviços de negócio (Habits, Checks, Navigation)
├── app.json                      # Configurações do Expo (Versão, versionCode, etc.)
├── eas.json                      # Perfil de compilação EAS (androidApk)
├── CHANGELOG.md                  # Histórico de alterações do projeto
├── index.html                    # Página de apresentação / Landing Page Web
└── package.json                  # Dependências e scripts do projeto
```

---

## [ COMO EXECUTAR O PROJETO ]

### Pré-requisitos
- **Node.js** (v20.x)
- **Expo CLI** (`npm install -g expo-cli`)
- Aplicativo **Expo Go** ou Emulador Android/iOS.

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/Intern-Yago/OneBitLife.git
   cd OneBitLife
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Iniciar o servidor:**
   ```bash
   npm start
   ```

---

## [ LICENÇA ]

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  Desenvolvido por <a href="https://github.com/Intern-Yago">Intern-Yago</a>
</div>
