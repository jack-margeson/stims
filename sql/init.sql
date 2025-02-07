CREATE DATABASE stims_db;

GRANT ALL ON DATABASE stims_db TO stims_admin;

\connect stims_db;

-- SET TIMEZONE (America/New_York)

ALTER DATABASE stims_db SET timezone TO 'UTC';

-- USER SETUP

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    '["name", "description", "image"]'::json),
    -- Book type
    ('book', 
    (SELECT id FROM tag_types WHERE tag_type_name = 'isbn'),
    '["title", "author", "publisher", "publication_date", "genre", "language", "image"]'::json);

CREATE TABLE database_view_columns (
    id SERIAL PRIMARY KEY,
    type_id INT NOT NULL REFERENCES database_types(id),
    type_name VARCHAR(50) NOT NULL UNIQUE REFERENCES database_types(type_name),
    display_name VARCHAR(100) NOT NULL,
    display_name_plural VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50)
);

INSERT INTO database_view_columns(type_id, type_name, display_name, display_name_plural, description, icon) VALUES 
    (
        (SELECT id FROM database_types WHERE type_name='item'), 
        'item', 'Item', 'Items', 'Default item type', 'shelves'
    ),
    (
        (SELECT id FROM database_types WHERE type_name='book'), 
        'book', 'Book', 'Books', 'Default book type', 'auto_stories' 
    );

CREATE TABLE item_statuses (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO item_statuses (status_name) VALUES 
    ('available'),
    ('checked_out'),
    ('lost'),
    ('damaged'),
    ('in_repair');

CREATE TABLE catalog (
    id SERIAL PRIMARY KEY,
    type_id INT NOT NULL REFERENCES database_types(id),
    tag_data VARCHAR(255) NOT NULL,
    args JSON NOT NULL,
    status INT NOT NULL REFERENCES item_statuses(id), 
    image VARCHAR(2083),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checked_out (
    id SERIAL PRIMARY KEY,
    item_id INT NOT NULL REFERENCES catalog(id),
    user_id INT NOT NULL REFERENCES users(user_id),
    checked_out_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TEST DATA
INSERT INTO catalog(type_id, tag_data, args, status, image) VALUES 
    (
        (SELECT id FROM database_types WHERE type_name = 'item'), 
        'bell_pepper_01',
        '{"name": "Bell Pepper", "description": "Green bell pepper."}'::json,
        (SELECT id FROM item_statuses WHERE status_name = 'available'),
        ''
    ),
    (
        (SELECT id FROM database_types WHERE type_name = 'book'), 
        '9780060935467',
        '{"title": "To Kill a Mockingbird", "author": "Harper Lee", "publisher": "Harper Perennial Modern Classics", "publication_date": "2006-10-11", "genre": "Fiction", "language": "English"}'::json,
        (SELECT id FROM item_statuses WHERE status_name = 'available'),
        'http://ia600100.us.archive.org/view_archive.php?archive=/5/items/l_covers_0012/l_covers_0012_60.zip&file=0012606523-L.jpg'
    ),
    (
        (SELECT id FROM database_types WHERE type_name = 'book'), 
        '9781400079179',
        '{"title": "The Da Vinci Code", "author": "Dan Brown", "publisher": "Anchor", "publication_date": "2009-03-31", "genre": "Mystery", "language": "English"}'::json,
        (SELECT id FROM item_statuses WHERE status_name = 'available'),
        'http://ia800404.us.archive.org/view_archive.php?archive=/33/items/l_covers_0010/l_covers_0010_52.zip&file=0010520476-L.jpg'
    ),
    (
        (SELECT id FROM database_types WHERE type_name = 'book'), 
        '9780452262935',
        '{"title": "1984", "author": "George Orwell", "publisher": "Plume", "publication_date": "2003-05-06", "genre": "Dystopian", "language": "English"}'::json,
        (SELECT id FROM item_statuses WHERE status_name = 'available'),
        'http://ia600205.us.archive.org/view_archive.php?archive=/34/items/olcovers29/olcovers29-L.zip&file=296204-L.jpg'
    ),
    (
        (SELECT id FROM database_types WHERE type_name = 'book'), 
        '9780316769174',
        '{"title": "The Catcher in the Rye", "author": "J.D. Salinger", "publisher": "Little, Brown and Company", "publication_date": "2001-01-30", "genre": "Fiction", "language": "English"}'::json,
        (SELECT id FROM item_statuses WHERE status_name = 'available'),
        'https://ia802309.us.archive.org/view_archive.php?archive=/20/items/l_covers_0008/l_covers_0008_42.zip&file=0008427413-L.jpg'
    ),
    (
        (SELECT id FROM database_types WHERE type_name = 'book'), 
        '9780743273565',
        '{"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "publisher": "Scribner", "publication_date": "2004-09-30", "genre": "Fiction", "language": "English"}'::json,
        (SELECT id FROM item_statuses WHERE status_name = 'available'),
        'https://ia801909.us.archive.org/view_archive.php?archive=/31/items/l_covers_0013/l_covers_0013_02.zip&file=0013028546-L.jpg'
    );