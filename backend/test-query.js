const Database = require('better-sqlite3');
const db = new Database('./dev.sqlite');

const query = `
  SELECT 
    p.id as product_id, 
    p.name as product_name, 
    p.category_id as category,
    SUM(si.quantity) as total_quantity,
    SUM(si.sale_price * si.quantity) as total_revenue,
    COUNT(DISTINCT si.invoice_id) as order_count,
    AVG(si.sale_price) as avg_price
  FROM sale_items si
  LEFT JOIN sale_invoices inv ON si.invoice_id = inv.id
  LEFT JOIN products p ON si.product_id = p.id
  WHERE inv.business_id = 'business-1'
    AND inv.created_at >= '2025-12-03'
    AND inv.created_at <= '2025-12-04'
  GROUP BY p.id
  ORDER BY total_revenue DESC
  LIMIT 10
`;

const results = db.prepare(query).all();
console.log(JSON.stringify(results, null, 2));
db.close();
