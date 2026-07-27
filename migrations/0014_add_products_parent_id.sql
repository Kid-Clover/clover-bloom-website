ALTER TABLE products ADD COLUMN parent_id TEXT REFERENCES products(id);
