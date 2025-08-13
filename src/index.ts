#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import symbols from "log-symbols";
import prompts from "prompts";
import pkgJson from "../package.json";

const program = new Command();

program.name("util-dotenv");
program.version(pkgJson.version);
program.description(pkgJson.description);

type Opts = {
  input: string;
  output: string;
  quiet?: boolean;
};

// Helper logger that respects quiet flag
const makeLogger = (quiet?: boolean) => ({
  log: (...args: any[]) => {
    if (!quiet) console.log(...args);
  },
  info: (...args: any[]) => {
    if (!quiet) console.info(...args);
  },
  error: (...args: any[]) => {
    if (!quiet) console.error(...args);
  },
});

program
  .command("gen-env-example")
  .description("Create .env.example by copying keys from .env")
  .option("-i, --input <file>", "Path to the input .env file", ".env")
  .option("-o, --output <file>", "Path to the output example file", ".env.example")
  .option("-q, --quiet", "Suppress all console output")
  .action(async (opts: Opts) => {
    const logger = makeLogger(opts.quiet);

    try {
      const inputPath = path.resolve(opts.input);
      const outputPath = path.resolve(opts.output);

      if (!fs.existsSync(inputPath)) {
        logger.error(`[ERROR]: Input file \`${opts.input}\` not found.`);
        process.exit(0);
      }

      const outputLines = fs
        .readFileSync(inputPath, "utf-8")
        .split(/\r?\n/)
        .map((line) => {
          const trimmed = line.trim();
          if (trimmed === "" || trimmed.startsWith("#")) return line;
          const index = line.indexOf("=");
          return index === -1 ? line : `${line.substring(0, index)}=`;
        });

      fs.writeFileSync(outputPath, outputLines.join("\n"), "utf-8");
      logger.log(`\`${opts.output}\` file generated.`);
    } catch (err: any) {
      logger.error(`[ERROR]: ${err.message}.`);
      logger.error(`[ERROR]: Can't generate \`${opts.output}\`.`);
    }
  });

program
  .command("configure-env")
  .description(
    "Generate a .env file by reading from a .env.example file, prompting for any missing values"
  )
  .option("-i, --input <file>", "Path to the source .env.example file", ".env.example")
  .option("-o, --output <file>", "Path where the generated .env file will be saved", ".env")
  .option("-q, --quiet", "Suppress all console output")
  .action(async (opts: Opts) => {
    const logger = makeLogger(opts.quiet);
    const inputPath = path.resolve(opts.input);
    const outputPath = path.resolve(opts.output);

    if (!fs.existsSync(inputPath)) {
      logger.error(`[ERROR]: Input file \`${opts.input}\` not found.`);
      process.exit(0);
    }

    logger.info(
      `\n${symbols.info} Configuring your environment. Press \`Ctrl-c\` to skip`
    );

    const lines = fs.readFileSync(inputPath, "utf-8").split(/\r?\n/);
    const outputLines: string[] = [];
    const answers: string[] = [];

    try {
      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed === "" || trimmed.startsWith("#") || !line.includes("=")) {
          outputLines.push(line);
          continue;
        }

        const key = line.split("=")[0]?.trim();

        const response = await prompts({
          initial: "",
          type: "text",
          name: "value",
          message: `Enter value for \`${key}\``
        });
        answers.push(response.value);
        outputLines.push(`${key}=${response.value ?? ""}`);
      }

      if (answers.some((str) => typeof str === "string" && str.trim() !== "")) {
        fs.writeFileSync(outputPath, outputLines.join("\n"), "utf-8");
        logger.info(`\`${opts.output}\` file created successfully.`);
      } else {
        logger.error("Configuration cancelled. No file was written.");
        process.exit(0);
      }
    } catch {
      logger.error("Configuration cancelled. No file was written.");
      process.exit(0);
    }
  });

program.parse();
