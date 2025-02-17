#!/bin/bash

# If the script is being piped, save it to a temporary file and execute it
if [ -p /dev/stdin ]; then
    tmpfile=$(mktemp)
    cat - >"$tmpfile"
    bash "$tmpfile"
    rm "$tmpfile"
    exit 0
fi

set -e
trap 'print_error "An error occurred. Exiting.";' ERR

function print_header() {
    local header="$1"
    local header_length=${#header}
    local border_length=$((header_length + 10))
    local border=$(printf '=%.0s' $(seq 1 $border_length))

    echo -e "\e[1;32m"
    echo "$border"
    printf "%*s\n" $(((border_length + header_length) / 2)) "$header"
    echo "$border"
    echo -e "\e[0m"
}

function print_message() {
    echo -e "\e[1;32m$1\e[0m"
}

function print_error() {
    echo -e "\e[1;31m$1\e[0m"
}

function main() {
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_error "Please do not run this script as root. Exiting."
        exit 1
    fi

    # Check if docker is installed
    if ! command -v docker &>/dev/null; then
        print_error "Docker is not installed. Please install Docker and try again."
        exit 1
    fi

    # Check if git is installed
    if ! command -v git &>/dev/null; then
        print_error "Git is not installed. Please install Git and try again."
        exit 1
    fi

    # Welcome message
    print_header "Welcome to the STIMS installation!"

    # Ask for install location
    read -p "Enter the install location (default ~/.local/share/): " install_location
    install_location=${install_location:-$HOME/.local/share/}
    mkdir -p "${install_location}stims"
    install_location="${install_location}stims"
    cd "$install_location" || {
        print_error "Failed to enter install location. Exiting."
        exit 1
    }

    # Check if the install location already has the program
    if [ -d "$install_location/.git" ]; then
        read -p "STIMS is already installed in this location. Would you like to update it? [Y/n]: " update_stims
        update_stims=${update_stims:-y}

        if [[ "$update_stims" =~ ^[Yy]$ ]]; then
            print_message "Updating STIMS..."
            echo
            print_message "Stopping STIMS services..."
            docker compose down
            print_message "Pulling the latest STIMS release..."
            echo
            git -C "$install_location" pull
            print_message "Rebuilding Docker Compose stack..."
            echo
            docker compose up -d --build
            print_header "STIMS has been updated!"
            echo -e "STIMS web interface: \e[1;34mhttp://localhost:4200\e[0m"
            echo -e "Adminer database viewer: \e[1;34mhttp://localhost:8080\e[0m"
            echo
            echo -e "\e[1;32m=================================e[0m"
            exit 0
        else
            print_message "Exiting the installer."
            exit 0
        fi
    fi

    # Clone the repository
    git clone https://github.com/jack-margeson/stims.git "$install_location"
    echo

    # Ask for admin password
    while true; do
        read -sp "Enter the password for the default database user (required): " admin_password
        echo
        read -sp "Confirm password: " admin_password_confirm
        echo

        # Check if passwords match
        if [ "$admin_password" == "$admin_password_confirm" ]; then
            break
        else
            print_error "Passwords do not match. Please try again."
        fi
    done

    # Save the password in a .env file
    echo "POSTGRES_PASSWORD=$admin_password" >.env
    echo

    # Ask if the user wants to create a new STIMS user account with administrative privileges
    read -p "Would you like to create a new STIMS user account with administrative privileges? [Y/n]: " create_user
    create_user=${create_user:-y}

    if [[ "$create_user" =~ ^[Yy]$ ]]; then
        # Ask for the username and password of the new account
        echo "Please enter the following for the new administrator account: "
        read -p "   ↳ Username: " admin_username
        read -p "   ↳ First name: " admin_first_name
        read -p "   ↳ Last name: " admin_last_name
        read -p "   ↳ Email: " admin_user_email
        while true; do
            read -sp "   ↳ Password: " admin_user_password
            echo
            read -sp "   ↳ Confirm password: " admin_user_password_confirm
            echo

            # Check if passwords match
            if [ "$admin_user_password" == "$admin_user_password_confirm" ]; then
                break
            else
                print_error "Passwords do not match. Please try again."
            fi
        done
        echo

        sed -e "s/\$1/'$admin_username'/g" \
            -e "s/\$2/'$admin_first_name'/g" \
            -e "s/\$3/'$admin_last_name'/g" \
            -e "s/\$4/'$admin_user_email'/g" \
            -e "s/\$5/'$admin_user_password'/g" \
            "$install_location"/sql/create_admin_user.sql >>"$install_location"/sql/init.sql
    fi

    # Ask if the user wants to add example data to the system
    echo "By default, STIMS offers a small example dataset for testing."
    read -p "Would you like to add the example data to the catalog? [Y/n]: " add_example_data
    add_example_data=${add_example_data:-y}

    if [[ "$add_example_data" =~ ^[Yy]$ ]]; then
        cat "$install_location"/sql/test_data.sql >>"$install_location"/sql/init.sql
    fi
    echo

    # Build the docker-compose stack
    print_message "Building Docker Compose stack..."
    docker compose up -d --build

    print_header "STIMS Installation Complete!"
    echo -e "STIMS web interface: \e[1;34mhttp://localhost:4200\e[0m"
    echo -e "Adminer database viewer: \e[1;34mhttp://localhost:8080\e[0m"
    echo
    echo -e "\e[1;32m======================================\e[0m"
}

main
