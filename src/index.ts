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
};

program
  .command("gen-env-example")
  .description("Create .env.example by copying keys from .env")
  .option("-i, --input <file>", "Path to the input .env file", ".env")
  .option(
    "-o, --output <file>",
    "Path to the output example file",
    ".env.example"
  )
  .action(async (opts: Opts) => {
    try {
      const inputPath = path.resolve(opts.input);
      const outputPath = path.resolve(opts.output);

      if (!fs.existsSync(inputPath)) {
        console.error(`[ERROR]: Input file \`${opts.input}\` not found.`);
        process.exit(1);
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
      console.log(`\`${opts.output}\` file generated.`);
    } catch (err) {
      console.error(`[ERROR]: ${err.message}.`);
      console.error(`[ERROR]: Can't generate \`${opts.output}\`.`);
    }
  });

program
  .command("configure-env")
  .description(
    "Generate a .env file by reading from a .env.example file, prompting for any missing values"
  )
  .option(
    "-i, --input <file>",
    "Path to the source .env.example file",
    ".env.example"
  )
  .option(
    "-o, --output <file>",
    "Path where the generated .env file will be saved",
    ".env"
  )
  .action(async (opts: Opts) => {
    const inputPath = path.resolve(opts.input);
    const outputPath = path.resolve(opts.output);

    if (!fs.existsSync(inputPath)) {
      console.error(`[ERROR]: Input file \`${opts.input}\` not found.`);
      process.exit(1);
    }

    console.log(
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
        console.info(`\`${opts.output}\` file created successfully.`);
      } else {
        console.log("Configuration cancelled. No file was written.");
        pro;
        cess.exit(1);
      }
    } catch {
      console.log("Configuration cancelled. No file was written.");
      process.exit(0);
    }
  });

program.parse();
