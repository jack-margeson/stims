# Use the official MariaDB image from the Docker Hub
FROM mariadb:latest
# Copy .sql file to the /docker-entrypoint-initdb.d directory
COPY ./init.sql /docker-entrypoint-initdb.d/
EXPOSE 3306