-- CREATE ADMIN USER

INSERT INTO users (username, first_name, last_name, email, password_hash) VALUES 
    {$1, $2, $3, $4, crypt($5, gen_salt('bf'))};

INSERT INTO user_roles (user_id, role_id) VALUES 
    ((SELECT user_id FROM users WHERE username = $1), 
    (SELECT role_id FROM roles WHERE role_name = 'admin'));