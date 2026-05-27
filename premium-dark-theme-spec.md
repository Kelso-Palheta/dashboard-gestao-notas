# Spec: Redesign do Dashboard com Tema Escuro Premium

**Versão:** 1.0  
**Status:** Rascunho  
**Autor:** Antigravity  
**Data:** 2026-05-26  

---

## 1. Resumo

Esta especificação detalha o redesign visual do aplicativo "Dashboard - Gestão de Notas", restabelecendo o tema escuro premium baseado no briefing original do projeto (#0f0e17 base) e corrigindo a quebra de estilização causada pela incompatibilidade de variáveis CSS OKLCH com o Tailwind v3.

---

## 2. Contexto e Motivação

**Problema:**
A tentativa anterior de redesenhar a aplicação em um modo claro ("Carbon Light Mode") desconfigurou os contrastes visuais (como textos brancos sobre a sidebar cinza clara) e causou uma discrepância estética, pois o painel principal permaneceu escuro enquanto a sidebar ficou clara. Além disso, a definição de cores usando a função `oklch()` dentro de variáveis CSS causou falhas de compilação/renderização no Tailwind CSS v3 (o qual tenta envelopar variáveis com a função `rgb(...)`), quebrando os backgrounds e as cores de texto em várias partes da interface.

**Evidências:**
- Feedback do usuário ("ficou horrível").
- Elementos como sidebar com baixo contraste e campos de input ilegíveis.
- Estilos aplicados no Tailwind (`bg-ink-900`) sendo descartados pelo navegador devido a cores mal formatadas.

---

## 3. Goals (Objetivos)

- [ ] G-01: Reverter totalmente o layout para o **Tema Escuro Premium** com fundo base `#0f0e17` e acentos em tons de índigo/violeta.
- [ ] G-02: Garantir contraste e legibilidade impecáveis (AA/AAA em conformidade com W3C/WCAG) para todos os textos, links e entradas de dados sobre fundos escuros.
- [ ] G-03: Corrigir a definição de cores no `tailwind.config.js` e `index.css` de forma a usar cores HSL puras ou hexadecimais, evitando a incompatibilidade de opacidade do Tailwind v3 com `oklch()`.
- [ ] G-04: Manter o design responsivo, com suporte a micro-animações, efeitos hover em botões e glassmorphism nos cards.

---

## 4. Non-Goals (Fora do Escopo)

- NG-01: Migração para um banco de dados server-side (permanece no `localStorage`).
- NG-02: Adição de novas rotas ou visões não contidas na Fase 1.

---

## 5. Usuários e Personas

- **Usuário Primário**: Professor de Ensino Médio que gerencia turmas e notas em ambientes escolares, muitas vezes sob iluminação artificial variável, demandando uma interface escura confortável aos olhos e com números legíveis.

---

## 6. Requisitos Funcionais

### 6.1 Requisitos Principais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Fundo principal deve ser escuro | Must | O elemento de fundo principal deve renderizar a cor `#0f0e17`. |
| RF-02 | Tipografia deve ser de alta legibilidade | Must | Nomes usam sans-serif (`Inter`); notas e valores numéricos usam monoespaçada (`JetBrains Mono` ou similar). |
| RF-03 | Status de aprovação bem visível | Must | Cores de status (Aprovado, Recuperação, Reprovado) devem ser brilhantes com fundos translúcidos adequados para visualização escura. |
| RF-04 | Elementos de formulário e inputs legíveis | Must | Inputs de notas e inputs de turmas devem ter fundo escuro contrastante e texto claro de fácil leitura. |
| RF-05 | Sidebar em sintonia com tema | Must | A sidebar deve ter fundo escuro integrado (`#171421` ou similar) com botões contrastantes. |

### 6.2 Design tokens e esquema de cores

A paleta de cores será definida no CSS usando valores HSL brutos ou HEX puros para permitir que as utilidades de opacidade do Tailwind v3 funcionem perfeitamente.

```
Fundo Principal (Canvas): #0f0e17 (escuro profundo)
Fundo da Sidebar: #14121f (um tom acima do fundo para contraste)
Cards e Tabelas: #1e1b29 (com opacidade e desfoque glassmorphism)
Texto Principal: #fffffe (branco puro para legibilidade)
Texto Secundário: #a7a9be (cinza claro tech)
Acento (Violeta/Indigo): #a78bfa (violeta-400) / #6366f1 (indigo-500)
Status Aprovado: #22c55e (verde-500)
Status Recuperação: #eab308 (amarelo-500)
Status Reprovado: #ef4444 (vermelho-500)
```

---

## 7. Requisitos Não-Funcionais

| ID | Requisito | Valor alvo | Observação |
|----|-----------|-----------|------------|
| RNF-01 | Contraste de cores | Ratio mínimo 4.5:1 | Conforme diretrizes da WCAG para elementos textuais |
| RNF-02 | Performance de Renderização | Zero lag ao digitar notas | Atualização instantânea nas células da tabela |
| RNF-03 | CSS modular | Sem uso de utilitários ad-hoc | Cores centralizadas em variáveis CSS no `index.css` |

---

## 8. Segurança e Privacidade

- **Chave de API**: Armazenada no LocalStorage ou via `.env` client-side para o processamento de IA.
- **Dados dos alunos**: Processados localmente, garantindo conformidade com a LGPD escolar.
