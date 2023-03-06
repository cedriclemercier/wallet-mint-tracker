# Local Setup

## Description

This piece of code stream from a Websocket for ethereum tx that corresponds to mints.

Data is filtered by wallet addresses and result is send to discord webhook.

## Environment variables

```ini
NODE_ENV=development
ALCHEMY_API_KEY=<your alchemy api key>
WEBHOOK_URL=<the webhook to send data to>
DATABASE_URL=<connection string>

; local dev
DB_NAME=<xxx>
DB_PASSWORD=<xxx>
```

## Database script

```SQL
CREATE TABLE wallets
(
    address varchar(42) NOT NULL PRIMARY KEY,
    name text,
    address_checksum varchar(42)
)
```