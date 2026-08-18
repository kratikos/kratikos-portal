# Kratikos Portal

Portal administrativo da plataforma Kratikos para acompanhamento do negócio e gestão de administradores, usuários, moderação, posts e enquetes.

Produção: [portal.kratikos.com.br](https://portal.kratikos.com.br)

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

## Publicação na Vercel

```bash
npm run build
```

Na Vercel, configure `KRATIKOS_API_URL` para o backend do ambiente desejado. O build usa Nitro e gera a saída compatível com a Vercel automaticamente.
