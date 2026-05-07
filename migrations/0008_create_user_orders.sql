CREATE TABLE user_orders (
  user_id   INTEGER NOT NULL REFERENCES users(id),
  order_id  TEXT    NOT NULL,
  PRIMARY KEY (user_id, order_id)
);
