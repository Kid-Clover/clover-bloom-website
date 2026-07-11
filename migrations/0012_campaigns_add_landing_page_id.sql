ALTER TABLE campaigns ADD COLUMN landing_page_id INTEGER REFERENCES landing_pages(id);
