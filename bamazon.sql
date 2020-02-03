DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(100) NULL,
    department_name VARCHAR(100) NULL,
    price DECIMAL (10,2) NULL,
    stock_quantity INT(20) NULL,
    PRIMARY KEY (id)
);

INSERT INTO products (item_id, product_name, department_name, price, stock_quantity)
VALUES ("jerseys", "soccer", 45.00, 20);

INSERT INTO products (item_id, product_name, department_name, price, stock_quantity)
VALUES ("firestick", "Electronics", 39.99, 15);

INSERT INTO products (item_id, product_name, department_name, price, stock_quantity)
VALUES ("tools", "Home & Garden", 40.00, 17);

SELECT * FROM products;