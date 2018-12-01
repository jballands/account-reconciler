#!/usr/bin/env node

//
//	A simple bank account reconciler app that takes two CSVs with
//	the same columns and outputs the differences.
//
//	Usage: reconcile <firstCSV> <secondCSV> [--help]
//
//	© 2018 Jonathan Ballands
//

const process = require("process");
const { readFile } = require("fs");
const minimist = require("minimist");
const { blue, magenta } = require("chalk");
const { csvParse } = require("d3-dsv");

// ------------------------------------------------------------------------

export function showHelp() {
	console.info(
		`usage: reconcile ${blue(`<firstCSV> <secondCSV>`)} ${magenta([`--help`])}`
	);
	console.info(`\n${magenta(`--help`)}\tShow this help text.\n`);
}

export function reconcile(fileA, fileB) {
	// First, we open both files
	const { err: csvAErr, data: csvA } = await readFile(fileA, 'utf8');
	const { err: csvBErr, data: csvB } = await readFile(fileB, 'utf8');

	if (csvAErr) {
		return console.error(`error: ${fileA} couldn't be read\n${csvAErr}`);
	}
	if (csvBErr) {
		return console.error(`error: ${fileB} couldn't be read\n${csvBErr}`);
	}

	// Use D3 to read these files
	const dataA = await csvParse(csvA);
	const dataB = await csvParse(csvB);
}

// ------------------------------------------------------------------------

// Check arguments
const arguments = minimist(process.argv.slice(2));

if (arguments._.length !== 2 || arguments.help) {
	showHelp();
	process.exit(0);
}

reconcile(arguments._[0], arguments._[1]);
process.exit(0);
