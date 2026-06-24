# PokéTeam Builder

Projeto desenvolvido para a disciplina de **Web 1**.

O **PokéTeam Builder** é uma aplicação web para criação, análise e recomendação de times Pokémon. O sistema permite que o usuário monte um time, visualize o equilíbrio defensivo entre tipos, receba recomendações de tipos que melhoram a cobertura do time e veja sugestões de Pokémon compatíveis com essas necessidades.

A versão atual também possui um backend simples em **Node.js + Express**, com cadastro, login e persistência de times salvos em banco **SQLite**.

---

## Visão de Produto

### Nome do Produto

**PokéTeam Builder**

### Problema

Existem mais de 1000 Pokémon, cada um com tipos, resistências, fraquezas e combinações diferentes. Para jogadores casuais ou iniciantes, montar um time equilibrado pode ser difícil, pois exige conhecimento sobre efetividade de tipos, fraquezas acumuladas e sinergia defensiva.

Além disso, ao montar diferentes times, o usuário pode querer salvar suas composições para consultar, testar ou alterar posteriormente.

### Objetivo

Fornecer uma ferramenta simples e intuitiva para ajudar usuários a montar times Pokémon mais equilibrados, oferecendo:

- seleção de Pokémon por nome;
- análise defensiva do time;
- recomendação de tipos;
- recomendação de Pokémon;
- cadastro e login de usuários;
- salvamento, carregamento e exclusão de times.

### Público-Alvo

- Jogadores casuais de Pokémon;
- Jogadores competitivos iniciantes;
- Fãs da franquia que desejam montar times melhores;
- Usuários que querem experimentar combinações de Pokémon sem precisar calcular manualmente as fraquezas do time.

### Proposta de Valor

O PokéTeam Builder ajuda o usuário a montar times de forma mais rápida, visual e organizada. Em vez de exigir que o jogador conheça todas as interações entre tipos, o sistema calcula as fraquezas e resistências do time e sugere tipos e Pokémon que podem melhorar sua cobertura defensiva.

---

## Funcionalidades Implementadas

### Conta de Usuário

- Cadastro de usuário;
- Login com usuário e senha;
- Senhas armazenadas com hash usando `bcrypt`;
- Ocultação dos campos de login/cadastro quando o usuário está logado;
- Opção de sair da conta.

### Montagem de Time

- Busca de Pokémon pelo nome;
- Sugestões dinâmicas durante a digitação;
- Adição de Pokémon ao time;
- Limite máximo de 6 Pokémon;
- Remoção de Pokémon ao clicar no card;
- Prevenção contra Pokémon duplicados no mesmo time;
- Persistência local do time atual com `localStorage`.

### Análise de Tipos

- Cálculo de cobertura defensiva do time;
- Exibição de equilíbrio por tipo;
- Classificação entre:
  - imune;
  - muito resistente;
  - resistente;
  - neutro;
  - fraco;
  - muito fraco.

### Recomendações de Tipos

O sistema recomenda tipos que podem ajudar a corrigir as vulnerabilidades atuais do time.

A recomendação considera:

- fraquezas acumuladas;
- resistências;
- imunidades;
- penalização de tipos que aumentariam vulnerabilidades.

### Recomendações de Pokémon

Ao clicar em um tipo recomendado, o sistema busca Pokémon daquele tipo e sugere opções para completar o time.

As recomendações consideram:

- combinação de tipos;
- melhora defensiva para o time;
- BST (Base Stat Total);
- exclusão de formas especiais, como Mega, Gigantamax e Totem;
- exclusão de Pokémon lendários, míticos e bebês;
- exclusão de Pokémon que já estão no time.

### Times Salvos

Com o usuário logado, é possível:

- salvar o time atual com um nome;
- listar times salvos;
- carregar um time salvo;
- excluir um time salvo.

Os times são armazenados no banco SQLite como JSON.

---

## Tecnologias Utilizadas

### Frontend

- HTML;
- CSS;
- JavaScript;
- `localStorage`;
- PokéAPI.

### Backend

- Node.js;
- Express;
- SQLite;
- bcrypt;
- cors.

### Ferramentas e Referências

- [PokéAPI](https://pokeapi.co/)
- [Figma](https://www.figma.com/design/hziICZC8QbzllHwdjouzRl/Team-Builder-de-Pok%C3%A9mon?node-id=0-1&t=HLpsoDmdKiolIJV0-1)

---

## Estrutura do Projeto

```text
poketeambuilder/
├── README.md
├── backend/
│   ├── database.js
│   ├── package.json
│   └── server.js
└── frontend/
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── index.js
```

---

## Como Executar o Projeto

### 1. Instalar as dependências do backend

Acesse a pasta `backend`:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

### 2. Iniciar o servidor

Ainda dentro da pasta `backend`, execute:

```bash
node server.js
```

O servidor será iniciado em:

```text
http://localhost:3000
```

Ao iniciar, o backend cria automaticamente as tabelas necessárias no banco SQLite, caso elas ainda não existam.

Além disso, o próprio backend também serve os arquivos do frontend. Portanto, não é necessário abrir o arquivo `index.html` manualmente.

### 3. Acessar o sistema

Depois de iniciar o servidor, abra no navegador:

```text
http://localhost:3000
```

Esse endereço carrega a interface completa do PokéTeam Builder, incluindo HTML, CSS, JavaScript e as funcionalidades conectadas ao backend.

---

## Rotas da API

Além de servir o frontend em `http://localhost:3000`, o backend também disponibiliza as rotas da API usadas pelo sistema.

### Página inicial do sistema

```http
GET /
```

Carrega o frontend da aplicação.

### Cadastro de Usuário

```http
POST /register
```

Body esperado:

```json
{
  "username": "usuario",
  "password": "senha"
}
```

### Login

```http
POST /login
```

Body esperado:

```json
{
  "username": "usuario",
  "password": "senha"
}
```

### Salvar Time

```http
POST /teams
```

Body esperado:

```json
{
  "userId": 1,
  "teamName": "Meu Time",
  "teamData": []
}
```

### Listar Times de um Usuário

```http
GET /teams/:userId
```

### Carregar um Time

```http
GET /team/:teamId
```

### Excluir um Time

```http
DELETE /team/:teamId
```

---

## Banco de Dados

O projeto utiliza SQLite.

Ao iniciar o servidor, o backend verifica se as tabelas necessárias já existem. Caso não existam, elas são criadas automaticamente.

### Tabela `users`

Armazena os usuários cadastrados.

Campos principais:

* `id`;
* `username`;
* `password`.

A senha é salva como hash, não em texto puro.

### Tabela `teams`

Armazena os times salvos pelos usuários.

Campos principais:

* `id`;
* `user_id`;
* `team_name`;
* `team_data`;
* `created_at`.

O campo `team_data` armazena o time em formato JSON.

---

## Funcionamento Geral

O usuário acessa o site, cria uma conta ou faz login. Depois, pode adicionar Pokémon ao time usando o campo de busca com sugestões automáticas.

A cada alteração no time, o sistema recalcula a cobertura defensiva e mostra quais tipos são mais problemáticos. Com base nisso, o sistema recomenda tipos que podem melhorar o equilíbrio do time.

Ao clicar em um tipo recomendado, o sistema busca Pokémon daquele tipo usando a PokéAPI, filtra opções indesejadas e exibe sugestões que podem ser adicionadas diretamente ao time.

Quando estiver logado, o usuário pode salvar o time atual, carregar times anteriores e excluir times salvos.

---

## Regras de Recomendação

O algoritmo de recomendação não utiliza inteligência artificial. Ele é baseado em regras e cálculos de efetividade de tipos.

O sistema considera:

- imunidades;
- resistências;
- fraquezas;
- fraquezas duplas;
- combinações de tipos;
- BST dos Pokémon candidatos;
- restrições para evitar formas especiais ou Pokémon lendários/míticos.

---

## Requisitos Não Funcionais

- Interface simples e organizada;
- Resposta rápida nas recomendações;
- Uso de cache local para reduzir chamadas repetidas à PokéAPI;
- Separação entre frontend e backend;
- Persistência de dados com SQLite;
- Código organizado para facilitar manutenção e futuras melhorias.

---

## Limitações Atuais

- As habilidades dos Pokémon não são levadas em conta, mesmo em alguns casos podendo afetar as vulnerabilidades defensivas do time;
    * Diante de como é a implementação da PokéAPI, é necessária uma catalogação manual de todas habilidades que influenciam defensivamente;
        * Ex: A habilidade `Levitate` torna o Pokémon imune ao tipo `Ground`;
- O sistema não leva em conta a cobertura ofensiva do time;
    * Para isso é necessário implementar a seleção de golpes por Pokémon;
- Não existe nenhuma filtragem de Pokémon por Jogo ou Geração;
    * A PokéAPI já possui suporte para filtragem por geração (1-9);
    * Com o que já existe na API, também é possível implementar filtragem por jogo (Até `Pokémon Ultra Sun/Ultra Moon`, final da geração `7`); 
        * Ex: Aceitar no time e recomendar apenas Pokémon presentes no jogo `Pokémon Emerald` ou das gerações `1, 2, 3, 4`;
- Os times salvos são associados ao `userId` enviado pelo frontend, não há uso de `uuid` ou alternativa similar.

---

## Possíveis Melhorias Futuras

- Permitir renomear times salvos;
- Criar tela de detalhes para cada Pokémon;
- Considerar habilidades e golpes;
- Considerar gerações específicas;
- Adicionar filtros por geração, tipo ou estatísticas;
- Melhorar responsividade mobile;
- Criar deploy online.

---

## Conclusão

O PokéTeam Builder evoluiu de uma ferramenta simples de recomendação de tipos para uma aplicação web mais completa, com frontend interativo, backend próprio, banco de dados e sistema de contas.

A aplicação permite que o usuário monte, analise, salve e recupere times Pokémon, oferecendo uma experiência prática e acessível para quem deseja montar composições mais equilibradas.
