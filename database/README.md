# Database Schema and Configuration

This directory contains database schemas, migrations, and configuration files for the Sign Language Recognition platform.

## Database Schema

The platform uses MySQL as the primary database with the following main tables:

- **users**: User accounts and profiles
- **user_progress**: Learning progress tracking
- **translation_history**: Translation records
- **sign_vocabulary**: Sign language vocabulary database
- **learning_modules**: Interactive learning content
- **practice_tests**: Practice test questions and results

## Features

- User authentication and authorization
- Progress tracking and analytics
- Translation history management
- Sign vocabulary management
- Learning module content
- Practice test results

## Setup

1. Install MySQL server
2. Create database: `CREATE DATABASE sign_language_db;`
3. Run migrations: `flask db upgrade`
4. Initialize data: `python init_data.py`
