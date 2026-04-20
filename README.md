# 💰 Finanças Pessoais

Aplicativo de controle financeiro pessoal — Progressive Web App (PWA).

## 📁 Estrutura do projeto

```
financas/
├── index.html          ← Página principal (entry point)
├── manifest.json       ← Manifesto PWA (nome, ícones, cores)
├── sw.js               ← Service Worker (cache offline)
├── assets/
│   ├── icon-192.png    ← Ícone do app (tela inicial)
│   └── icon-512.png    ← Ícone splash screen
├── css/
│   └── style.css       ← Todos os estilos
└── js/
    ├── config.js       ← Categorias, cores e constantes padrão
    ├── storage.js      ← Persistência (localStorage) + PIN/auth
    ├── helpers.js      ← Funções utilitárias (datas, formatação)
    ├── parsers.js      ← Parser de notificações + importação Mobills
    └── components/
        ├── Icons.jsx         ← Componente de ícones SVG
        ├── Calc.jsx          ← Calculadora inline
        ├── Shared.jsx        ← Modal base, PickerModal, DonutChart
        ├── Auth.jsx          ← Tela de PIN / autenticação
        ├── NotifImporter.jsx ← Importador de notificações bancárias
        ├── Banners.jsx       ← Banner de instalação PWA + formatos de import
        ├── FilterModal.jsx   ← Modal de filtros de transações
        ├── FabTxRow.jsx      ← Botão FAB e linha de transação
        ├── Pages.jsx         ← Páginas: Dashboard, Transações, Cartões, Contas, Mais
        ├── Modals.jsx        ← Todos os formulários modais
        └── app.jsx           ← Componente raiz (App) + montagem React
```

---

## 🚀 Como publicar no GitHub Pages

### Passo 1 — Criar repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique em **"New repository"** (botão verde no canto superior direito)
3. Preencha:
   - **Repository name:** `financas` (ou qualquer nome)
   - **Visibility:** Public *(obrigatório para GitHub Pages gratuito)*
   - Deixe as demais opções padrão
4. Clique em **"Create repository"**

---

### Passo 2 — Enviar os arquivos

**Opção A — Interface web (mais fácil, sem instalar nada):**

1. Na página do repositório criado, clique em **"uploading an existing file"**
2. Arraste **toda a pasta** ou selecione todos os arquivos
3. ⚠️ Mantenha a estrutura de pastas: `css/`, `js/`, `js/components/`, `assets/`
4. Na caixa "Commit changes", deixe a mensagem padrão e clique **"Commit changes"**

**Opção B — Git (linha de comando):**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/financas.git
git push -u origin main
```

---

### Passo 3 — Ativar GitHub Pages

1. No repositório, clique em **Settings** (aba no topo)
2. No menu lateral esquerdo, clique em **Pages**
3. Em **"Branch"**, selecione `main` e pasta `/ (root)`
4. Clique em **Save**
5. Aguarde ~1 minuto e o link aparecerá:
   ```
   https://SEU_USUARIO.github.io/financas/
   ```

---

### Passo 4 — Instalar como app no Android

1. Abra o link no **Chrome para Android**
2. Um banner roxo aparecerá no topo: **"Instalar como app"** → toque em **Instalar**
3. Ou manualmente: menu ⋮ → **"Adicionar à tela inicial"**
4. O ícone 💰 aparecerá na tela inicial e o app abrirá sem barra de endereços

---

## 🔐 Autenticação por PIN

Na primeira abertura, o app solicitará criar um PIN de 4 dígitos.
Para gerenciar: aba **Mais** → botão **🔐 PIN** (alterar ou remover).

Se esquecer o PIN: na tela de desbloqueio, toque em **"Esqueci meu PIN"** — o PIN será removido (os dados financeiros são preservados).

---

## 📥 Importação de dados

Acesse **Início → Formatos suportados** para ver como importar:
- **Formato nativo:** JSON exportado pelo próprio app
- **Mobills — Receitas:** JSON com campo `"Data da Receita"`
- **Mobills — Despesas:** JSON com campo `"Data da Despesa"`
- **Mobills — Transferências:** JSON com campo `"Data da Transferência"` (origem e destino emparelhados pelo mesmo `Id`)

Você pode importar **múltiplos arquivos de uma vez** — contas, categorias e tags são criadas automaticamente.

---

## 🔄 Atualizar o app

Para enviar atualizações depois:

**Interface web:** edite o arquivo diretamente no GitHub (ícone de lápis) ou arraste novos arquivos.

**Git:**
```bash
git add .
git commit -m "Atualização"
git push
```

O GitHub Pages atualiza automaticamente em ~1 minuto. O Service Worker detecta a nova versão na próxima vez que o app for aberto com conexão.

---

## 🛠 Tecnologias

- **React 18** (via CDN — sem build step)
- **Babel Standalone** (transpila JSX no browser)
- **localStorage** para persistência de dados
- **Service Worker** para funcionamento offline
- **Web App Manifest** para instalação como PWA
