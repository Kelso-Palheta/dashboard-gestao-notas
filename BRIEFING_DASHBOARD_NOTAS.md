# 📋 BRIEFING — Dashboard de Gestão de Notas Escolares

## Visão Geral

Construir um **dashboard web completo** para gestão de notas bimestrais de turmas do Ensino Médio. O professor cadastra turmas, importa listas de alunos, lança notas e acompanha o desempenho por bimestre.

---

## Stack Recomendada

- **React + Vite** (frontend)
- **Tailwind CSS** (estilização)
- **SheetJS (xlsx)** — leitura de arquivos Excel/CSV
- **Anthropic SDK** — extração de nomes via IA a partir de PDF e imagens
- **LocalStorage** — persistência dos dados (sem backend por enquanto)

---

## Funcionalidades — Fase 1 (este briefing)

### 1. Gestão de Turmas

- O professor pode **cadastrar turmas** com nome/código (ex: 101, 102, 201...)
- Cada turma tem uma **lista de alunos**
- As turmas ficam salvas no LocalStorage
- Turmas já pré-carregadas (dados reais das planilhas — ver seção de dados abaixo)

### 2. Importação Inteligente de Alunos

O professor pode importar a lista de alunos de uma turma enviando um arquivo. O sistema deve aceitar:

| Formato | Como processar |
|---|---|
| `.xlsx` / `.xls` | Ler com SheetJS, detectar coluna com nomes automaticamente |
| `.csv` | Parsear e detectar coluna com nomes automaticamente |
| `.pdf` | Enviar para a API do Claude (base64) e pedir extração dos nomes |
| Imagem (`.jpg`, `.png`, `.webp`) | Enviar para a API do Claude (base64) e pedir extração dos nomes |

**Fluxo de importação:**
1. Botão "Importar Alunos" dentro da tela de cada turma
2. Drag & drop ou clique para selecionar arquivo
3. Sistema processa automaticamente
4. Mostra preview com lista de nomes extraídos
5. Professor confirma ou edita antes de salvar
6. Alunos são adicionados à turma (sem duplicatas)

**Prompt para a API do Claude (PDF/imagem):**
```
Analise este documento e extraia todos os nomes de alunos encontrados.
Retorne APENAS um JSON no formato: {"alunos": ["NOME COMPLETO 1", "NOME COMPLETO 2", ...]}
Os nomes devem estar em MAIÚSCULAS. Ignore cabeçalhos, títulos, números, datas e qualquer texto que não seja nome de pessoa.
```

**Para xlsx/csv:**
- Detectar automaticamente qual coluna contém nomes (procurar colunas chamadas "Nome", "Aluno", "Student", ou a coluna com mais strings longas)
- Limpar espaços extras e padronizar em maiúsculas

### 3. Lançamento de Notas por Bimestre

Cada turma tem **4 bimestres** independentes. Em cada bimestre:

#### Estrutura de pontuação (total máximo: 10 pontos)

```
NOTA FINAL = (Simulado / 2) + Soma das Atividades
```

- **Simulado**: valor de 0 a 10, mas contribui com metade (0–5 pts) para o total
- **Atividades**: o professor cria quantas quiser, cada uma com valor máximo definido por ele. A soma máxima de todas as atividades deve ser 5 pts. O sistema avisa se ultrapassar.
- **Total final**: máximo de 10 pts

#### Interface da tabela de notas

Colunas: `# | Nome do Aluno | Simulado (0-10) | Atividade 1 | Atividade 2 | ... | TOTAL`

- Células editáveis com clique (inline edit)
- Total calculado automaticamente em tempo real
- Cores por desempenho:
  - 🟢 Verde: ≥ 7,0 (Aprovado)
  - 🟡 Amarelo: 5,0 – 6,9 (Recuperação)
  - 🔴 Vermelho: < 5,0 (Reprovado)

#### Gestão de atividades

- Botão para adicionar nova atividade (nome + valor máximo)
- Botão para remover atividade
- Aviso visual se soma das atividades ultrapassar 5 pts

### 4. Sidebar de Navegação

- Lista de turmas cadastradas
- Seletor de bimestre (1º ao 4º)
- Contador de alunos por turma
- Indicador de média da turma

---

## Dados Iniciais (pré-carregar no sistema)

### Turma 101
```
ADRIAN DO CARMO ANTUNES, ANTONY LUCIANO DA SILVA VEIGA, BIANCA ALVES FARIAS,
CLARISSA LIMA DE AQUINO, CLARISSE MIRANDA CARVALHO, CLEISILAYNE DOS SANTOS CRAVEIRO,
ELAIARA BORGES FERREIRA, ELOA VICTORIA DE SOUZA FERREIRA, EMELLYN SAVANNA BARROS DE SOUZA,
EMILY VITORIA OLIVEIRA LOPES, EVEN MANUELA MOUTA ALVES, GRAZIELLI VICTORIA SOUZA MOARES,
HORRANY CRISTINA DO NASCIMENTO COSTA, ISAAC RAMON DA COSTA WARISS, ISAQUE PAIXAO GUIMARAES,
JOAO PEDRO DE OLIVEIRA DAMASCENO, KLEVERTON ISACK SOUZA DA COSTA, MARIA CLARA DA SILVA LIMA,
MARIA LUIZA FAGUNDES DA SILVA, PEDRO HENRIQUE RIBEIRO NASCIMENTO, PEDRO VITOR DOS SANTOS LIMA,
RIAN CARLOS DE OLIVEIRA BARROS, SAMELA ARIELE PINHEIRA DA SILVA, SARA VITORIA RIBEIRO DA SILVA,
SIBELLY VITORIA DUARTE QUEIROZ, TAYRON MESSIAS DA SILVA ALEIXO, VINICIUS SOUSA SANTOS,
VITORIA DO ROSARIO LIMA, WILLIAN GABRIEL SALES DO NASCIMENTO
```

### Turma 102
```
ADONAI DE FARIAS COSTA, ALANA GABRIELY DA SILVA RAMOS, ANA LIDIA SOUSA DE SOUSA,
ANA LIGIA SOUSA DE SOUSA, ANNA LETICIA DE ARAUJO CARVALHO, CARLA MELISSA BASTOS DOS SANTOS,
DANRLEY DOS SANTOS BARATA, DANYELLA LIMA BARROS, EDSON DA CRUZ MEDEIROS,
EDUARDA LUANNY XIMENDES SANTOS, ELORRANNY THIFFANY SOUSA SILVA, ESTEFANY LORRANE SOUSA DOS SANTOS,
EVELLIN OLIVEIRA DE LIMA, GUSTAVO BRITO RODRIGUES, HEITOR RAIOL DA SILVA,
JHONATAN WESLLEY RODRIGUES PEREIRA, JOABE BASTOS DE MORAES, JOANA SANTOS DO ROSARIO,
LARISSA SILVA DOS SANTOS, LUCAS FELIPE FRANCA DO NASCIMENTO, MARIA EDUARDA ALVES DA SILVA,
MARIA EDUARDA SANTOS DOS SANTOS, MARIA SOFFYA SILVA SALES, MOIZES JUNIOR DOS SANTOS PANTOJA,
RAQUELE SOUSA DA COSTA, SAMUEL KAUA DA SILVA DA SILVA, THAYSON HENRIQUE SANTOS GUIMARAES,
WESLEY GUSTAVO PALHA SOARES, ZIDANE MURILO RIBEIRO BARBOSA
```

### Turma 103
```
ALUIZIO SOARES DA SILVA, ANDRIEL VILHENA DOS SANTOS, BRUNO SILVA DA COSTA,
CARLOS ALERANDRO DE SOUZA MONTEIRO, ELOAH CRISTINA FREITAS MANITO, EMILLY BORRALHOS TORRES,
ESTHEFANE LETICIA DIAS PEREIRA, HUGO HENRIQUE FERREIRA VARELA, JACIVALDO BORRALHOS DIAS,
JHON MARCOS RODRIGUES DICKSON, JOAO BARATA FERREIRA, JOAO VICTOR FERREIRA ANDRADE,
JOAO VICTOR SOUSA DA SILVA, KEYVILLON MACIO RIBEIRO FONSECA, LARISSA SOUSA SILVA,
LUCIANO CORREA MONTEIRO VILELA, LUIZ HENRIQUE DO ROSARIO SILVA, PAMELA VITORIA DE MENEZES ALEIXO,
PAULO VICTOR LOBATO TRINDADE, RAISSA FREITAS MANITO, THAYLLA ADRIANA COSTA DE SOUSA,
VITORIA DOS SANTOS VITOR, WAGNER DARLAN LEAL DE MORAES, WAGNER FELIPE BORRALHOS MORAIS,
WENDY THIELLY DA SILVA DE MORAES, YVAN HENRIQUE CAMARAO DE ALMEIDA
```

### Turma 104
```
ANA CLARA SILVA DA SILVA, AUGUSTO CESAR E SILVA BARATA, CARLOS AUGUSTO BRASIL DE SOUZA NETO,
CARLOS EDUARDO SILVA GADELHA, CLEBER NICOLAS FERREIRA DE ARAUJO, DANIEL DOS SANTOS BARBOSA,
DANILO DA LUZ BARBOSA, ELIELSON DE JESUS NOGUEIRA DE LIMA, EMILLY EDUARDA NASCIMENTO SOUZA,
EMILLY KELEN FERREIRA TRINDADE, ESTEFANE ELOAH DOS SANTOS RIBEIRO, EVELIN LORRANNY RIPARDO OLIVEIRA,
FELIPE COSTA DE ATAIDE, FERNANDA VITORIA NUNES FERREIRA, GABRIEL NASCIMENTO DE PAIVA,
KAUAN HENRIQUE DE SOUZA DA PAIXAO, LAURA BEATRIZ PARANHOS COSTA, LAYLA VITORIA GUIMARAES DA SILVA,
LUCAS RODRIGO DOS SANTOS DA SILVA, MARCO ANTONIO RODRIGUES DA ROCHA, MARIA EDUARDA COSTA SOEIRO,
MARIA HELOISA PINTO GUIMARAES, MELISSA YASMIN DICKSON BORRALHOS, PETRIN SANTANA MARTINS,
PRISCILLA RAYANA MARQUES MARTINS, RAISSA VITORIA DA LUZ DIAS, SOPHIA SANDRES FERREIRA,
VINICIUS GABRIEL MONTEIRO DA SILVA, YASMIN MAELY SILVA PACIFICO
```

---

## Design Visual

- **Tema escuro** (fundo #0f0e17, tons de índigo/violeta)
- Fonte monoespaçada para números, sans-serif para nomes
- Tabela com linhas alternadas, células clicáveis com borda tracejada
- Cores de status bem visíveis (verde/amarelo/vermelho)
- Sidebar fixa à esquerda com turmas e bimestres
- Header fixo no topo com nome do sistema

---

## Estrutura de Arquivos Sugerida

```
dashboard-notas/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── TurmaView.jsx
│   │   ├── TabelaNotas.jsx
│   │   ├── ImportModal.jsx        ← modal de importação de alunos
│   │   └── NumCell.jsx            ← célula editável inline
│   ├── hooks/
│   │   ├── useNotas.js            ← estado + persistência no localStorage
│   │   └── useTurmas.js
│   ├── utils/
│   │   ├── calculos.js            ← calcTotal, clamp, fmt
│   │   ├── importXlsx.js          ← leitura de xlsx/csv com SheetJS
│   │   └── importIA.js            ← chamada à API Claude para PDF/imagem
│   └── data/
│       └── turmasIniciais.js      ← dados das 4 turmas pré-carregadas
├── package.json
├── vite.config.js
└── .env.example                   ← VITE_ANTHROPIC_API_KEY=
```

---

## Variáveis de Ambiente

```env
VITE_ANTHROPIC_API_KEY=sua_chave_aqui
```

Usada em `importIA.js` para chamar `https://api.anthropic.com/v1/messages` com o arquivo em base64.

---

## Fase 2 (próximo briefing — não implementar agora)

- **Mapa de Notas**: visão consolidada de todas as turmas com as 4 AVAs (bimestres), coluna de REC, média final anual
- Exportação para Excel (.xlsx) com o layout original das planilhas
- Gráficos de desempenho por turma

---

## Observações Finais

- Todo o estado deve persistir no **LocalStorage** (sem backend)
- Ao importar alunos, nunca duplicar nomes já existentes (comparar em uppercase sem acentos)
- O campo de simulado aceita valores de 0 a 10, mas na fórmula é dividido por 2
- As atividades são configuradas **por turma/bimestre** (cada bimestre pode ter atividades diferentes)
- Nomes dos alunos devem ser exibidos em **Title Case** (ex: "Maria Clara Da Silva Lima"), mas armazenados em MAIÚSCULAS
