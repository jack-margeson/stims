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
        (SELECT id FROM database_types WHERE type_name = 'item'), 
        'bell_pepper_02',
        '{"name": "Red Bell Pepper", "description": "Red bell pepper."}'::json,
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