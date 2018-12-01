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
const minimist = require("minimist");
const { blue, magenta } = require("chalk");
const { csvParse } = require("d3-dsv");

function showHelp() {
	console.info(
		`usage: reconcile ${blue(`<firstCSV> <secondCSV>`)} ${magenta([`--help`])}`
	);
	console.info(`\n${magenta(`--help`)}\tShow this help text.\n`);
}

function reconcile(fileA, fileB) {}

// ------------------------------------------------------------------------

// Check arguments
const arguments = minimist(process.argv.slice(2));

if (arguments._.length !== 2 || arguments.help) {
	showHelp();
	process.exit(0);
}

console.log("rawr");
