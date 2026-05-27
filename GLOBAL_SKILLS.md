# 🛠️ Hierarquia de Habilidades Globais (Skills)

Este documento descreve todas as habilidades e plugins globais ativados no projeto, organizados em uma estrutura hierárquica por área de atuação e responsabilidade.

---

## 💻 1. Core Development & Web Standards (Desenvolvimento Web e UI/UX)
Habilidades essenciais para o desenvolvimento de interfaces modernas, responsivas e de alta performance.

- **`modern-web-guidance`**: Guia para desenvolvimento web moderno, com foco em:
  - Layouts avançados (CSS Grid, Flexbox, Container Queries, `:has()`).
  - Scroll-driven animations, View Transitions e parallax.
  - Otimização de Core Web Vitals (LCP, INP) e carregamento de recursos.
  - Acessibilidade (a11y) e padrões HTML5/JS modernos.
- **`chrome-extensions`**: Desenvolvimento de extensões Manifest V3 para o Google Chrome, permissões e comunicação em segundo plano.

---

## ☁️ 2. Database, Cloud & Backend Integration (Firebase Suite)
Habilidades para gerenciamento de dados persistentes, segurança, autenticação e deploy.

- **`firebase-basics`**: Configuração básica e gerenciamento de projetos via CLI do Firebase.
- **`firebase-firestore`**: Banco de dados não-relacional escalável (regras de segurança, queries, índices).
- **`firebase-auth-basics`**: Autenticação segura de usuários.
- **`firebase-data-connect`**: Integração de banco de dados SQL relacional (PostgreSQL) integrado ao ecossistema Firebase.
- **`firebase-security-rules-auditor`**: Auditoria e validação de regras de segurança do Firestore/Storage.
- **`firebase-hosting-basics`**: Deploy clássico de aplicações estáticas e Single Page Applications (SPAs).
- **`firebase-app-hosting-basics`**: Deploy moderno de aplicações server-side e frameworks (Next.js, Angular).
- **`firebase-remote-config-basics`**: Gerenciamento de Feature Flags e comportamento dinâmico.
- **`firebase-crashlytics`**: Monitoramento e tratamento de erros em tempo real.

---

## 🔍 3. Quality Assurance, Diagnostics & Debugging
Habilidades dedicadas a testes, auditorias de desempenho, acessibilidade e correção de bugs.

- **`chrome-devtools`**: Depuração avançada de páginas web via Chrome DevTools.
- **`a11y-debugging`**: Auditorias de acessibilidade digital baseadas nas diretrizes web.dev.
- **`debug-optimize-lcp`**: Otimização de tempo de carregamento da interface (Largest Contentful Paint).
- **`memory-leak-debugging`**: Diagnóstico de vazamento de memória em JavaScript/Node.js usando snapshots de heap.
- **`troubleshooting`**: Resolução de falhas de conexão de ferramentas de diagnóstico.

---

## 📱 4. Mobile Development (Desenvolvimento Mobile)
Configuração e orquestração de projetos nativos móveis.

- **`android-cli`**: Criação de projetos, builds, configuração de SDKs e depuração no Android.
- **`xcode-project-setup`**: Modificações de projetos iOS (.pbxproj), Swift Package Manager e dependências.

---

## 🧬 5. Scientific Research & Domain Databases (Ciência e Pesquisa)
Habilidades voltadas à extração e análise de dados científicos, farmacêuticos, médicos e biológicos.

### 🧬 Genômica e Análise de Variantes
- **`alphagenome-single-variant-analysis`**: Análise de efeitos de variantes em expressão gênica e regulação.
- **`clinvar-database`**: Classificações de patogenicidade de variantes genéticas.
- **`dbsnp-database`**: Mapeamento de rsIDs e coordenadas genômicas.
- **`gnomad-database`**: Consulta de frequência alélica na população.
- **`gtex-database`**: Expressão gênica em tecidos humanos saudáveis.
- **`ucsc-conservation-and-tfbs`**: Conservação evolutiva de regiões genômicas.

### 🧪 Estrutura de Proteínas e Sequenciamento
- **`alphafold-database-fetch-and-analyze`**: Análise estrutural baseada em previsões do AlphaFold.
- **`pymol`**: Visualização e renderização 3D de macromoléculas.
- **`foldseek-structural-search`**: Alinhamento e busca por similaridade estrutural 3D de proteínas.
- **`protein-sequence-msa`**: Alinhamento múltiplo de sequências proteicas.
- **`protein-sequence-similarity-search`**: Busca de homólogos de sequência (BLAST/MMseqs2).
- **`uniprot-database`**: Banco de dados unificado de anotação de proteínas.
- **`human-protein-atlas-database`**: Localização espacial de proteínas nos tecidos.

### 💊 Fármacos, Ensaios e Associações Clínicas
- **`chembl-database`**: Compostos bioativos e afinidades de ligação (IC50/Ki).
- **`pubchem-database`**: Propriedades químicas de moléculas pequenas.
- **`openfda-database`**: Dados regulatórios da FDA (efeitos adversos, recalls, bulas).
- **`clinical-trials-database`**: Registro e busca de ensaios clínicos mundiais.
- **`opentargets-database`**: Associação entre alvos terapêuticos e doenças.

### 🕸️ Ontologias, Vias Metabólicas e Redes
- **`reactome-database`**: Análise de vias metabólicas e biológicas.
- **`quickgo-database`**: Mapeamento de termos de Gene Ontology (GO).
- **`embl-ebi-ols`**: Serviço de busca de ontologias biomédicas.
- **`string-database`**: Rede de interações proteína-proteína.
- **`interpro-database`**: Identificação de domínios e famílias de proteínas.
- **`unibind-database`**: Mapeamento de sítios de ligação de fatores de transcrição.
- **`ncbi-sequence-fetch`**: Recuperação de sequências de nucleotídeos e proteínas do NCBI.

### 📚 Literatura Científica
- **`literature-search-openalex`**: Catálogo de metadados acadêmicos globais.
- **`literature-search-arxiv`**: Busca de pré-prints (física, matemática, ciência da computação).
- **`literature-search-biorxiv`**: Pré-prints de ciências biológicas e médicas.
- **`literature-search-europepmc`**: Acesso à base de dados biomédica do Europe PMC.
- **`pubmed-database`**: Pesquisa na base PubMed (MEDLINE).

---

## 🤖 6. Agent Automation & Workflows (Automação de Agentes)
Ferramentas de orquestração interna e automação.

- **`google-antigravity-sdk`**: Programação de agentes autônomos e sistemas multiagentes.
- **`workflow-skill-creator`**: Geração automática de novas ferramentas com base em tarefas completadas.
- **`uv`**: Gerenciador de dependências Python de alta performance.
