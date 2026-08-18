# Kratikos Portal

Portal administrativo da plataforma Kratikos para acompanhamento do negócio e gestão de administradores, usuários, moderação, posts e enquetes.

## Requisitos

- Node.js `>=22.13.0`
- Backend Kratikos acessível pelo portal

## Configuração

Crie o arquivo `.env` a partir do exemplo e informe a URL do backend:

```bash
cp .env.example .env
```

```env
KRATIKOS_API_URL=https://endereco-do-backend
```

## Desenvolvimento

```bash
npm install
npm run dev
```

O portal fica disponível em `http://localhost:3001` quando iniciado nessa porta.

## Validação

```bash
npm run lint
npm test
```

## Produção

```bash
npm run build
npm run start
```
