# Local Setup

## Description

This piece of code stream from a Websocket for ethereum tx that corresponds to mints.

Data is filtered by wallet addresses and result is send to discord webhook.

## Environment variables

```ini
NODE_ENV=development
ALCHEMY_API_KEY=<your alchemy api key>
DB_NAME=<xxx>
DB_PASSWORD=<xxx>
WEBHOOK_URL=<the webhook to send data to>
```

## Database script

```SQL
CREATE TABLE wallets
(
    address character varying(42) COLLATE NOT NULL,
    name text COLLATE
    address_checksum character varying(42)
    CONSTRAINT wallets_pkey PRIMARY KEY (address)
)

```