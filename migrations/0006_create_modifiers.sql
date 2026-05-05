-- Which products require modifier selections and how many
CREATE TABLE product_modifier_groups (
  product_id     TEXT    PRIMARY KEY REFERENCES products(id),
  required_count INTEGER NOT NULL
);

-- Which simples are valid options for each bundle product
CREATE TABLE product_modifier_options (
  product_id        TEXT NOT NULL,
  option_product_id TEXT NOT NULL REFERENCES products(id),
  PRIMARY KEY (product_id, option_product_id)
);

INSERT INTO product_modifier_groups (product_id, required_count) VALUES
  ('3-simples', 3),
  ('6-simples', 6);

INSERT INTO product_modifier_options (product_id, option_product_id) VALUES
  ('3-simples', 'tigers-eye-ginger'),
  ('3-simples', 'crystal-cauldron-chamomile'),
  ('3-simples', 'dragonflies-society-rose-hips'),
  ('3-simples', 'griffins-gold-lemon-verbena'),
  ('3-simples', 'ogress-lantern-lemon-balm'),
  ('3-simples', 'pixie-dust-peppermint'),
  ('6-simples', 'tigers-eye-ginger'),
  ('6-simples', 'crystal-cauldron-chamomile'),
  ('6-simples', 'dragonflies-society-rose-hips'),
  ('6-simples', 'griffins-gold-lemon-verbena'),
  ('6-simples', 'ogress-lantern-lemon-balm'),
  ('6-simples', 'pixie-dust-peppermint');
