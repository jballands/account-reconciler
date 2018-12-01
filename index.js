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
const fs = require("fs");
const { promisify } = require("util");
const minimist = require("minimist");
const { blue, magenta, yellow } = require("chalk");
const { csvParse } = require("d3-dsv");
const { fromJS, Map } = require("immutable");

// We need to "promisify" the fs functions since we need them to be
// Promises to "await" on them
const readFile = promisify(fs.readFile);

// ------------------------------------------------------------------------

function showHelp() {
	console.info(
		`usage: reconcile ${blue(`<firstCSV> <secondCSV>`)} ${magenta([`--help`])}`
	);
	console.info(`\n${magenta(`--help`)}\tShow this help text.\n`);
}

async function reconcile(fileA, fileB) {
	// First, we open both files
	let csvA, csvB;
	try {
		csvA = await readFile(fileA, "utf8");
		csvB = await readFile(fileB, "utf8");
	} catch (e) {}

	// Use D3 to read these files
	let dataA, dataB;
	try {
		dataA = await csvParse(csvA);
		dataB = await csvParse(csvB);
	} catch (e) {}

	dataA = massage(fromJS(dataA));
	dataB = massage(fromJS(dataB));

	const aMissingFromB = diff(dataA, dataB);
	const bMissingFromA = diff(dataB, dataA);

	const numInA = aMissingFromB.size;
	const numInB = bMissingFromA.size;

	console.info(
		`${yellow(aMissingFromB.size)} ${
			numInA === 1 ? "transation" : "transactions"
		} in ${magenta(fileA)} missing from ${blue(fileB)}`
	);
	showDiff(aMissingFromB, magenta);

	console.info(
		`${yellow(bMissingFromA.size)} ${
			numInB === 1 ? "transation" : "transactions"
		} in ${blue(fileB)} missing from ${magenta(fileA)}`
	);
	showDiff(bMissingFromA, blue);
}

function massage(parsedCSV) {
	return parsedCSV.reduce((reduction, row) => {
		const inflow = row.get("Inflow", 0);
		const outflow = row.get("Outflow", 0);
		let amount = row.get("Amount");

		if (!amount) {
			amount = parseFloat(inflow) + -1 * parseFloat(outflow);
		} else {
			amount = parseFloat(amount);
		}

		return reduction.set(
			hash(row.get("Payee"), amount),
			Map({
				Date: row.get("Date"),
				Payee: row.get("Payee"),
				Amount: amount
			})
		);
	}, Map());
}

function diff(original, diffWith) {
	return original.filter((row, key) => {
		return !diffWith.has(key);
	});
}

function showDiff(diff, color) {
	diff.map(row =>
		console.info(
			`Date: ${color(row.get("Date"))}, Payee: ${color(
				row.get("Payee")
			)}, Amount: ${color(row.get("Amount"))}`
		)
	);
}

function hash(payee, amount) {
	return `${payee}---${amount}`;
}

// ------------------------------------------------------------------------

// Check arguments
const arguments = minimist(process.argv.slice(2));

if (arguments._.length !== 2 || arguments.help) {
	showHelp();
	process.exit(0);
}

reconcile(arguments._[0], arguments._[1]).then(() => process.exit(0));
