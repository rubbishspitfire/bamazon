var mysql = require('mysql');
var inquirer = require('inquirer');
var connection = require('./Connect/connect.js');


listOptions();

function listOptions() {
	// Display options of "View Products For Sale", "View Low Inventory", "Add To Inventory", and "Add New Product"
	inquirer.prompt([
		{
			name: "choice",
			type: "list",
			choices: ["View Products For Sale", "View Low Inventory", "Add To Inventory", "Add New Product", "Quit"],
			message: "What would you like to do?"
		}
	])
	.then(function(answer) {
		// REFACTOR: replace if/else structure with a {} of strings: functions{}
		//const dispatcher = {"View Products For Sale": viewProducts}
		//dispatch(answer.choice)()
		if(answer.choice === "View Products For Sale") {
			viewProducts();
		}
		else if(answer.choice === "View Low Inventory") {
			viewProducts(true);
		}
		else if(answer.choice === "Add To Inventory") {
			addInventory();
		}
		else if(answer.choice === "Add New Product") {
			addNewProduct();
		}
		else {
			console.log("Have a nice day!");
			connection.end();
		}
	});
}

// View Products For Sale -- AND -- View Low Inventory
function viewProducts(low) {
	var q = "SELECT * FROM products";
	// If a true value was passed, view just the low inventory instead of all of it
	if(low) {
		q = "SELECT * FROM products WHERE stock_quantity < 5";
	}
	connection.query(q, function(err, res) {
		if (err) throw err;
		// Log all results of the SELECT statement
		console.log("+----+------------------------------------------+------------------+----------+-----+");
		console.log("|  # | NAME                                     | DEPARTMENT       | PRICE    | QTY |");
		console.log("+----+------------------------------------------+------------------+----------+-----+");
		// Display all available items, including itemID, name, price, quantity
		for (let i = 0; i < res.length; i++) {
			let product_id = res[i].product_id.toString();
			let product_name = res[i].product_name;
			let department_id = res[i].department_id;
			let price = "$" + res[i].price;
			let stock_quantity = res[i].stock_quantity.toString();
			// Update the temp strings by including white space. This will size the tables correctly.
			while(product_id.length < 2) {
				product_id = " " + product_id;
			}
			while(product_name.length < 40) {
				product_name = product_name + " ";
			}
			while(department_id.toString().length < 16) {
				department_id = department_id + " ";
			}
			while(price.length < 8) {
				price = " " + price;
			}
			while(stock_quantity.length < 3) {
				stock_quantity = " " + stock_quantity;
			}
			console.log("| " + product_id + " | " + product_name + " | " + department_id + " | " + price + " | " + stock_quantity + " |");
		}
		console.log("+----+------------------------------------------+------------------+----------+-----+\n");
		listOptions();
	});
}

// Add To Inventory
function addInventory() {

	connection.query("SELECT product_id, product_name, stock_quantity FROM products", function(err, results) {
		if (err) throw err;
		// once you have the items, prompt the user for which they'd like to buy
		inquirer.prompt([
			{
				name: "choice",
				type: "list",
				choices: function() {
					var choiceArray = [];
					for (var i = 0; i < results.length; i++) {
						choiceArray.push(results[i].product_name);
					}
					return choiceArray;
				},
				message: "What item would you like to add more of?"
			},
			{
				name: "quantity",
				type: "input",
				message: "How many more should be ordered?"
			}
		])
		.then(function(answer) {
			console.log(`Answer is ${answer}`)
			var chosenItem;
			for (var i = 0; i < results.length; i++) {
				if (results[i].product_name === answer.choice) {
					chosenItem = results[i];
				}
			}

			// There is enough; reduce the stock in the database and provide the customer's total
			var newQuantity = parseInt(chosenItem.stock_quantity) + parseInt(answer.quantity);
			connection.query(
				"UPDATE products SET ? WHERE ?",
				[
					{
						stock_quantity: newQuantity
					},
					{
						product_id: chosenItem.product_id
					}
				],
				function(error) {
					if (error) throw err;
					console.log("You have added " + answer.quantity + " units. You now have " + newQuantity + ".");
					listOptions();
				}
			);
		});
	});
}

// Add New Product
function addNewProduct() {
	// Input name (validate length)
	// Input description (validate length)
	// Input price (validate double)
	// Input qty (validate integer)
	// Update MySQL
	connection.query("SELECT department_id, department_name FROM departments", function(err, results) {
		if (err) throw err;
		// 1. Create a variable to store {names:id}
		console.log(results)
		var departmentList = {}
		for (let h = 0; h < results.length; h++) {
			let department_id = results[h].department_id
			let department_name = results[h].department_name
			departmentList[department_name] = department_id

		}
		inquirer.prompt([
			{
				name: "product_name",
				type: "input",
				message: "What is the name of the new product?"
			},
			{
				name: "department_name",
				type: "list",
				choices: function() {
					var choiceArray = [];
					for (let i = 0; i < results.length; i++) {
						choiceArray.push(results[i].department_name);
					}
					return choiceArray;
				},
				message: "Which department does this belong to?"
			},
			{
				name: "price",
				type: "input",
				message: "What is the MSRP of this item? (Please only input a number.)",
				validate: function(value) {
					if (isNaN(value) === false) {
						return true;
					}
					return false;
				}
			},
			{
				name: "stock_quantity",
				type: "input",
				message: "How many should be ordered?",
				validate: function(value) {
					console.log(`Value is ${value}`)
					if (isNaN(value) === false) {
						return true;
					}
					return false;
				}
			}
		])
		.then(function(answer) {
			console.log(answer)
			// 2. Fetch the proper id from the above variable (we knoe the name)
			connection.query(
				"INSERT INTO products (product_name, department_id, price, stock_quantity) VALUES ('" + answer.product_name + "', " + departmentList[answer.department_name] + ", '" + answer.price + "', '" + answer.stock_quantity + "')",
				function(error) {
					if (error) {
						console.log('ADDING TO INVENTORY FAILED: ' + error);
						throw error;
					}
					console.log("You have added " + answer.stock_quantity + " units of " + answer.product_name + ".");
					listOptions();
				}
			);
		});
	});
}