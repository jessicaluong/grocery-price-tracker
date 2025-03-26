SELECT 
  g.id, g.name, g.brand, g.store, g.count, g.amount, g.unit, 
  COUNT(i.id) as "itemCount", 
  MIN(i.price) as "minPrice", 
  MAX(i.price) as "maxPrice", 
  MAX(i.date) as "newestDate"
FROM "Group" g
LEFT JOIN "Item" i on g.id = i."groupId"
WHERE g."userId" = $1
GROUP BY g.id, g.name, g.brand, g.store, g.count, g.amount, g.unit
