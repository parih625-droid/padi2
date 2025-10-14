#!/bin/bash

# Deployment script for ecommerce backend

# Check if running as root
if [ "$EUID" -eq 0 ]
  then echo "Please don't run as root"
  exit
fi

# Update system
echo "Updating system packages..."
sudo apt update

# Install required packages
echo "Installing required packages..."
sudo apt install -y curl wget gnupg2 software-properties-common

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
echo "Installing MySQL..."
sudo apt install -y mysql-server

# Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# Install project dependencies
echo "Installing project dependencies..."
npm install

# Create uploads directory
mkdir -p uploads

# Start the application with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup

echo "Deployment completed!"
echo "Please remember to:"
echo "1. Configure your database credentials in .env file"
echo "2. Set up your MySQL database"
echo "3. Configure Nginx as a reverse proxy"
echo "4. Set up SSL certificate with Let's Encrypt (optional but recommended)"