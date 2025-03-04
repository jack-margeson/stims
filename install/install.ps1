# install.ps1
# WARNING: THIS WINDOWS-SPECIFIC INSTALL SCRIPT IS FOR DEMO PURPOSES ONLY! 
# IT HAS NOT BEEN TESTED IN A PRODUCTION ENVIRONMENT! 
# USE AT YOUR OWN RISK! 

# Function to print header
function Print-Header {
    param (
        [string]$header
    )
    $headerLength = $header.Length
    $borderLength = $headerLength + 10
    $border = "=" * $borderLength

    Write-Host "`e[1;32m"
    Write-Host $border
    Write-Host $header.PadLeft(($borderLength + $headerLength) / 2)
    Write-Host $border
    Write-Host "`e[0m"
}

# Function to print message
function Print-Message {
    param (
        [string]$message
    )
    Write-Host "`e[1;32m$message`e[0m"
}

# Function to print error
function Print-Error {
    param (
        [string]$message
    )
    Write-Host "`e[1;31m$message`e[0m"
}

# Main function
function Main {
    # Check if running as Administrator
    if (-not ([bool](New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))) {
        Print-Error "Please run this script as Administrator. Exiting."
        exit 1
    }

    # Check if Docker is installed
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Print-Error "Docker is not installed. Please install Docker and try again."
        exit 1
    }

    # Check if Git is installed
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Print-Error "Git is not installed. Please install Git and try again."
        exit 1
    }

    # Welcome message
    Print-Header "Welcome to the STIMS installation!"

    # Ask for install location
    $installLocation = Read-Host "Enter the install location (default C:\Users\$env:USERNAME\AppData\Local\STIMS)"
    if (-not $installLocation) {
        $installLocation = "C:\Users\$env:USERNAME\AppData\Local\STIMS"
    }
    New-Item -ItemType Directory -Force -Path $installLocation
    Set-Location -Path $installLocation

    # Check if the install location already has the program
    if (Test-Path "$installLocation\.git") {
        $updateStims = Read-Host "STIMS is already installed in this location. Would you like to update it? [Y/n]"
        if ($updateStims -eq "" -or $updateStims -match "^[Yy]$") {
            Print-Message "Updating STIMS..."
            Print-Message "Stopping STIMS services..."
            docker-compose down
            Print-Message "Pulling the latest STIMS release..."
            git -C $installLocation pull
            Print-Message "Rebuilding Docker Compose stack..."
            docker-compose up -d --build
            Print-Header "STIMS has been updated!"
            Write-Host "STIMS web interface: `e[1;34mhttp://localhost:4200`e[0m"
            Write-Host "Adminer database viewer: `e[1;34mhttp://localhost:8080`e[0m"
            exit 0
        } else {
            Print-Message "Exiting the installer."
            exit 0
        }
    }

    # Clone the repository
    git clone https://github.com/jack-margeson/stims.git $installLocation

    # Ask for admin password
    while ($true) {
        $adminPassword = Read-Host -AsSecureString "Enter the password for the default database user (required)"
        $adminPasswordConfirm = Read-Host -AsSecureString "Confirm password"

        if ($adminPassword -eq $adminPasswordConfirm) {
            break
        } else {
            Print-Error "Passwords do not match. Please try again."
        }
    }

    # Save the password in a .env file
    $envContent = "POSTGRES_PASSWORD=$(ConvertFrom-SecureString $adminPassword -AsPlainText)"
    Set-Content -Path "$installLocation\.env" -Value $envContent
    Set-Content -Path "$installLocation\middleware\.env" -Value "DB_PASSWORD=$(ConvertFrom-SecureString $adminPassword -AsPlainText)"

    # Ask if the user wants to create a new STIMS user account with administrative privileges
    $createUser = Read-Host "Would you like to create a new STIMS user account with administrative privileges? [Y/n]"
    if ($createUser -eq "" -or $createUser -match "^[Yy]$") {
        $adminUsername = Read-Host "   ↳ Username"
        $adminFirstName = Read-Host "   ↳ First name"
        $adminLastName = Read-Host "   ↳ Last name"
        $adminUserEmail = Read-Host "   ↳ Email"
        while ($true) {
            $adminUserPassword = Read-Host -AsSecureString "   ↳ Password"
            $adminUserPasswordConfirm = Read-Host -AsSecureString "   ↳ Confirm password"

            if ($adminUserPassword -eq $adminUserPasswordConfirm) {
                break
            } else {
                Print-Error "Passwords do not match. Please try again."
            }
        }

        $createAdminUserSql = Get-Content "$installLocation\sql\create_admin_user.sql"
        $createAdminUserSql = $createAdminUserSql -replace '\$1', $adminUsername
        $createAdminUserSql = $createAdminUserSql -replace '\$2', $adminFirstName
        $createAdminUserSql = $createAdminUserSql -replace '\$3', $adminLastName
        $createAdminUserSql = $createAdminUserSql -replace '\$4', $adminUserEmail
        $createAdminUserSql = $createAdminUserSql -replace '\$5', $(ConvertFrom-SecureString $adminUserPassword -AsPlainText)
        Add-Content -Path "$installLocation\sql\init.sql" -Value $createAdminUserSql
    }

    # Ask if the user wants to add example data to the system
    $addExampleData = Read-Host "Would you like to add the example data to the catalog? [Y/n]"
    if ($addExampleData -eq "" -or $addExampleData -match "^[Yy]$") {
        $testDataSql = Get-Content "$installLocation\sql\test_data.sql"
        Add-Content -Path "$installLocation\sql\init.sql" -Value $testDataSql
    }

    # Build the docker-compose stack
    Print-Message "Building Docker Compose stack..."
    docker-compose up -d --build

    Print-Header "STIMS Installation Complete!"
    Write-Host "STIMS web interface: `e[1;34mhttp://localhost:4200`e[0m"
    Write-Host "Adminer database viewer: `e[1;34mhttp://localhost:8080`e[0m"
}

Main