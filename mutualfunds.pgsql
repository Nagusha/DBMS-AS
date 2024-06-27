/*DROP TABLE IF EXISTS mutual_funds;
DROP TABLE IF EXISTS fund_houses;
DROP TABLE IF EXISTS daily_prices;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS transactions;*/


CREATE TABLE fund_houses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE mutual_funds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    fund_house_id INT REFERENCES fund_houses(id),
    exit_load DECIMAL(5, 2) 
);

CREATE TABLE daily_prices (
    id SERIAL PRIMARY KEY,
    fund_id INT REFERENCES mutual_funds(id),
    price_date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone_number VARCHAR(20)
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id),
    fund_id INT REFERENCES mutual_funds(id),
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(10) NOT NULL, 
    units DECIMAL(12, 4) NOT NULL
);

INSERT INTO fund_houses (name)
VALUES ('HDFC Mutual Fund'),
       ('ICICI Prudential'),
       ('SBI Mutual Fund'),
       ('Aditya Birla Sun Life'),
       ('Axis Mutual Fund');

INSERT INTO mutual_funds (name, fund_house_id, exit_load)
VALUES ('HDFC Top 100 Fund', 1, 1.5),  
       ('ICICI Prudential Bluechip Fund', 2, 1.0);  

INSERT INTO daily_prices (fund_id, price_date, price)
VALUES (1, '2024-06-25', 123.45),
       (2, '2024-06-25', 210.50);

INSERT INTO customers (name, email, phone_number)
VALUES ('Nagusha', 'nagu@example.com', '123-456-7890'),
       ('Srivani', 'srivani@example.com', '987-654-3210');

INSERT INTO transactions (customer_id, fund_id, transaction_date, transaction_type, units)
VALUES (1, 1, '2024-06-25', 'buy', 100),
       (2, 2, '2024-06-26', 'sell', 50);

SELECT * FROM fund_houses;
SELECT * FROM mutual_funds;
SELECT * FROM daily_prices;
SELECT * FROM customers;
SELECT * FROM transactions;