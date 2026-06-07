## Projeto Integrador IV: Desenvolvimento de Sistemas Orientado a Dispositivos Móveis e Baseados na Web

#### Integrantes:

- André Trecco
- Edward Mairene Ribeiro
- Joao Vitor Souza Gomes
- Mikael Souza Rodrigues
- Pierre Leon Fernandes Silva
- Vinícius Luis De Oliveira Monteiro

#### Prova de conceito

Para a realização da prova de conceito do aplicativo, foi selecionada as jornadas principais do sistema: o processo de busca e contratação de uma cuidadora por parte do responsável pela criança e o aceite ou recusa por parte da cuidadora. Essas jornadas foram escolhidas por representarem as funcionalidades centrais da plataforma e por envolver diferentes interações entre usuários, sistema e base de dados.

Foram implementadas as seguintes funcionalidades principais:

- Cadastro e autenticação de usuários no sistema;

- Cadastro e visualização de perfis de cuidadoras;

- Busca e listagem de profissionais disponíveis;

- Visualização detalhada do perfil da cuidadora;

- Solicitação e registro de agendamentos de serviços;

- Estrutura inicial de comunicação entre responsável e cuidadora.

## Daycare App

![Node](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-black?logo=express) ![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma) ![JWT](https://img.shields.io/badge/Auth-JWT-black?logo=jsonwebtokens)

O aplicativo Daycare é uma plataforma que conecta responsáveis por crianças a babás e cuidadoras qualificadas, oferecendo um processo de contratação mais rápido, seguro e transparente.

### Funções principais:

- cadastro de cuidadoras
- busca de cuidadoras
- controle de disponibilidade
- agendamentos
- chat entre responsável e cuidadora
- avaliações
- pagamentos

O projeto está estruturado em **monorepo**, contendo frontend e backend
no mesmo repositório.

---

## Tecnologias Utilizadas

### Frontend

- React
- Vite
- TypeScript
- Axios

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT (autenticação)

### Ferramentas

- Docker (banco de dados)

---

## Requisitos

Antes de executar o projeto, instale:

- Node.js (\>= 18)
- Docker
- npm ou yarn

---

## Clonar o Projeto

    git clone https://github.com/MikaelSouz/daycare-app.git

---

## Configuração do Banco de Dados

Criar um container PostgreSQL utilizando Docker, exemplo:

    docker run --name daycare-postgres -e POSTGRES_PASSWORD=docker -e POSTGRES_USER=docker -e POSTGRES_DB=daycare -p 5432:5432 -d postgres

---

## Variáveis de Ambiente

Dentro da pasta **daycare-api**, crie um arquivo `.env`:

    DATABASE_URL="postgresql://docker:docker@localhost:5432/daycare"
    JWT_HASH="secret"
    PORT=3001

---

## Executar Backend

Entrar na pasta daycare-api:

    cd daycare-api

Instalar dependências:

    npm install

Rodar script:

    npm run dev:setup

Esse script executa:

- migration do banco
- seed com dados fictícios
- inicia o servidor

Servidor backend rodando em:

    http://localhost:3001

---

## Executar Frontend

Abrir outro terminal.

Entrar na pasta daycare-app:

    cd daycare-app

Instalar dependências:

    npm install

Rodar aplicação:

    npm run dev

Frontend disponível em:

    http://localhost:3000

---

## Banco de Dados

O projeto utiliza **PostgreSQL** com **Prisma ORM**.

Para visualizar os dados:

    npx prisma studio

## Seed de Dados

O projeto possui um seed que cria:

- cuidadoras
- responsáveis
- disponibilidades
- agendamentos
- avaliações
- conversas
- mensagens

Usuários criados no seed possuem senha padrão:

    123456+

Login:

#### Cuidadoras:

- carla@email.com
- ana@email.com
- mariana@email.com
- juliana@email.com
- fernanda@email.com

#### Responsáveis:

- lucas@email.com
- patricia@email.com
- roberto@email.com

