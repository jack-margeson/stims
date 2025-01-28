CREATE DATABASE stims_db;

GRANT ALL ON DATABASE stims_db TO stims_admin;

\connect stims_db;

-- USER SETUP

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    role_display_name VARCHAR(50) NOT NULL
);

CREATE TABLE user_roles (
    user_id INT REFERENCES users(user_id),
    role_id INT REFERENCES roles(role_id)
);

INSERT INTO roles (role_name, role_display_name) VALUES 
    ('admin', 'Administrator'), 
    ('cataloger', 'Cataloger'),
    ('user', 'User'),
    ('guest', 'Guest');


-- CATALOG SETUP 

CREATE TABLE tag_types (
    id SERIAL PRIMARY KEY,
    tag_type_name VARCHAR(50) NOT NULL UNIQUE,
    format VARCHAR(255) NOT NULL
);

INSERT INTO tag_types (tag_type_name, format) VALUES
    ('generic', '.*'),
    ('isbn', '^(?:ISBN(?:-13)?:?\ )?(?=[0-9]{13}$|(?=(?:[0-9]+[-\ ]){4})[-\ 0-9]{17}$)97[89][-\ ]?[0-9]{1,5}[-\ ]?[0-9]+[-\ ]?[0-9]+[-\ ]?[0-9]$'),
    ('uuid', ' ^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$');

CREATE TABLE database_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    tag_type_id INT NOT NULL REFERENCES tag_types(id),
    args JSON NOT NULL
);

INSERT INTO database_types (type_name, tag_type_id, args) VALUES 
    -- Item type
    ('item', 
    (SELECT id FROM tag_types WHERE tag_type_name = 'generic'),
    '["name", "description"]'::json),
    -- Book type
    ('book', 
    (SELECT id FROM tag_types WHERE tag_type_name = 'isbn'),
    '["author", "publisher", "publication_date", "genre", "language"]'::json);

CREATE TABLE database_view_columns (
    id SERIAL PRIMARY KEY REFERENCES database_types(id),
    type_name VARCHAR(50) NOT NULL UNIQUE REFERENCES database_types(type_name),
    display_name VARCHAR(100) NOT NULL,
    display_name_plural VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50)
);

INSERT INTO database_view_columns(type_name, display_name, display_name_plural, description, icon) VALUES 
    ('item', 'Item', 'Items', 'Default item type', 'shelves'),
    ('book', 'Book', 'Books', 'Default book type', 'auto_stories' );

CREATE TABLE catalog (
    id SERIAL PRIMARY KEY, 
    type_id INT NOT NULL REFERENCES database_types(id),
    tag_data JSON NOT NULL,
    args JSON NOT NULL,
    status JSON NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);