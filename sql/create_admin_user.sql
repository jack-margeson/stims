-- CREATE ADMIN USER

INSERT INTO users (username, first_name, last_name, email, password_hash) VALUES 
    {$1, $2, $3, $4, crypt($5, gen_salt('bf'))};
