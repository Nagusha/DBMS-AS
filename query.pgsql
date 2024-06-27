WITH customer_profit_loss AS (
    SELECT
        customer_id,
        SUM(CASE 
                WHEN transaction_type = 'buy' THEN -1 * units * price
                 WHEN transaction_type = 'sell' THEN units * price
                 ELSE 0 
                 END) AS profit_or_loss
    FROM transactions t
    JOIN daily_prices p ON t.fund_id = p.fund_id
    WHERE customer_id = 1 -- Replace with actual customer ID
        AND transaction_date BETWEEN '2024-01-01' AND '2024-12-31' -- Replace with actual start and end dates
    GROUP BY customer_id
),

fund_total_investment AS (
    SELECT
        t.fund_id,
        SUM(units * price) AS total_investment_amount
    FROM transactions t
    JOIN daily_prices p ON t.fund_id = p.fund_id
    WHERE t.transaction_type = 'buy'
        AND p.price_date BETWEEN '2024-01-01' AND '2024-12-31' -- Replace with actual start and end dates
    GROUP BY t.fund_id
),

max_profit_users AS (
    SELECT
        customer_id,
        SUM(CASE WHEN transaction_type = 'buy' THEN -1 * units * price
                 WHEN transaction_type = 'sell' THEN units * price
                 ELSE 0 END) AS total_profit
    FROM transactions t
    JOIN daily_prices p ON t.fund_id = p.fund_id
    GROUP BY customer_id
    ORDER BY total_profit DESC
    LIMIT 1
),

fund_performance AS (
    SELECT
        fund_id,
        MAX(price) AS max_price,
        MIN(price) AS min_price
    FROM daily_prices
    WHERE price_date BETWEEN '2024-01-01' AND '2024-12-31' 
    GROUP BY fund_id
)

SELECT
    'Profit or Loss Statement for Customer' AS result_type,
    cp.customer_id,
    cp.profit_or_loss AS amount,
    NULL AS fund_id,
    NULL AS fund_name,
    NULL AS fund_house_id,
    NULL AS increase_percentage
FROM customer_profit_loss cp

UNION ALL

SELECT
    'Total Amount Invested for Fund Across All Customers' AS result_type,
    NULL AS customer_id,
    NULL AS amount,
    ti.fund_id,
    NULL AS fund_name,
    NULL AS fund_house_id,
    ti.total_investment_amount AS increase_percentage
FROM fund_total_investment ti

UNION ALL

SELECT
    'User(s) Who Made Maximum Profit' AS result_type,
    mp.customer_id,
    mp.total_profit AS amount,
    NULL AS fund_id,
    NULL AS fund_name,
    NULL AS fund_house_id,
    NULL AS increase_percentage
FROM max_profit_users mp

UNION ALL

SELECT
    'Funds Whose Total Value Increased by 10%' AS result_type,
    NULL AS customer_id,
    NULL AS amount,
    fp.fund_id,
    f.name AS fund_name,
    f.fund_house_id,
    ((fp.max_price - fp.min_price) / fp.min_price) * 100 AS increase_percentage
FROM fund_performance fp
JOIN mutual_funds f ON fp.fund_id = f.id
WHERE ((fp.max_price - fp.min_price) / fp.min_price) * 100 >= 10;
