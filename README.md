# util-dotenv

`util-dotenv` is a simple and interactive CLI utility to help you manage your `.env` files.  
It enables you to generate `.env.example` files by extracting keys from existing `.env` files, and also to create `.env` files interactively by filling in missing values based on `.env.example`.

---

## Features

- Generate `.env.example` files by copying keys from your `.env` and stripping out the values to avoid leaking secrets.  
- Create or update your `.env` file interactively by prompting for each variable defined in `.env.example`.  
- Skip variables during configuration by pressing `Ctrl+C`.  
- Clear informative messages and error handling for better developer experience.

---

## Installation

You can install `util-dotenv` globally via npm:

```bash
npm install -g util-dotenv
```

Or use it directly via `npx` without global install:

```bash
npx util-dotenv <command> [options]
```

---

## Commands

### `gen-env-example`

Generate a `.env.example` file by copying all keys from your `.env` file, replacing all values with empty strings.

```bash
util-dotenv gen-env-example -i .env -o .env.example
```

#### Options

- `-i, --input <file>`: Path to the source `.env` file (default: `.env`)  
- `-o, --output <file>`: Path where the generated `.env.example` file will be saved (default: `.env.example`)

---

### `configure-env`

Create or update your `.env` file interactively by reading keys from a `.env.example` file and prompting you to enter their values.

```bash
util-dotenv configure-env -i .env.example -o .env
```

#### Options

- `-i, --input <file>`: Path to the `.env.example` file to read keys from (default: `.env.example`)  
- `-o, --output <file>`: Path where the resulting `.env` file will be saved (default: `.env`)

You will be prompted to enter a value for each environment variable defined in `.env.example`. If you want to skip a variable, press `Ctrl+C` to abort the process.

---

## Usage Example

1. Generate an example file from your existing `.env`:

```bash
util-dotenv gen-env-example
```

2. Commit `.env.example` to your repository to share environment variable keys without secrets.

3. When setting up a new environment, run:

```bash
util-dotenv configure-env
```

and fill in the requested values interactively.

---

## Development

### Build

Install dependencies, then run:

```bash
npm run build
```

### Run locally

Run your CLI directly from the built files:

```bash
node dist/index.js <command> [options]
```

---