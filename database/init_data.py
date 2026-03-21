#!/usr/bin/env python3
"""
Database Initialization Script

This script initializes the database with sample data and configurations
for the Sign Language Recognition Platform.
"""

import os
import sys
import json
import pymysql
from datetime import datetime, timedelta
import hashlib
import secrets

# Database configuration
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', 'root'),
    'database': os.environ.get('DB_NAME', 'sign_language_db'),
    'charset': 'utf8mb4'
}

def connect_to_database():
    """Connect to MySQL database."""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        return connection
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def initialize_sample_users():
    """Initialize sample users for testing."""
    connection = connect_to_database()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Sample users data
        sample_users = [
            {
                'username': 'admin',
                'email': 'admin@signlang.com',
                'password': 'admin123',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_disabled': False,
                'preferred_language': 'ASL',
                'is_active': True,
                'email_verified': True
            },
            {
                'username': 'john_doe',
                'email': 'john@example.com',
                'password': 'password123',
                'first_name': 'John',
                'last_name': 'Doe',
                'is_disabled': True,
                'preferred_language': 'ASL',
                'is_active': True,
                'email_verified': True
            },
            {
                'username': 'jane_smith',
                'email': 'jane@example.com',
                'password': 'password123',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'is_disabled': False,
                'preferred_language': 'ISL',
                'is_active': True,
                'email_verified': True
            }
        ]
        
        for user_data in sample_users:
            # Check if user already exists
            cursor.execute("SELECT id FROM users WHERE username = %s", (user_data['username'],))
            if cursor.fetchone():
                print(f"User {user_data['username']} already exists, skipping...")
                continue
            
            # Hash password
            password_hash = hashlib.sha256(user_data['password'].encode()).hexdigest()
            
            # Insert user
            insert_query = """
            INSERT INTO users (username, email, password_hash, first_name, last_name, 
                             is_disabled, preferred_language, is_active, email_verified, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            cursor.execute(insert_query, (
                user_data['username'],
                user_data['email'],
                password_hash,
                user_data['first_name'],
                user_data['last_name'],
                user_data['is_disabled'],
                user_data['preferred_language'],
                user_data['is_active'],
                user_data['email_verified'],
                datetime.utcnow()
            ))
            
            print(f"Created user: {user_data['username']}")
        
        connection.commit()
        return True
        
    except Exception as e:
        print(f"Error initializing users: {e}")
        return False
    finally:
        connection.close()

def initialize_learning_modules():
    """Initialize learning modules."""
    connection = connect_to_database()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Sample learning modules
        modules = [
            {
                'title': 'ASL Alphabet Basics',
                'description': 'Learn the basic alphabet in American Sign Language',
                'sign_language': 'ASL',
                'difficulty_level': 1,
                'category': 'alphabet',
                'estimated_duration': 30,
                'learning_objectives': [
                    'Recognize all 26 letters of the ASL alphabet',
                    'Perform basic finger spelling',
                    'Understand hand shapes and movements'
                ],
                'content': {
                    'lessons': [
                        {'title': 'Letters A-M', 'duration': 15},
                        {'title': 'Letters N-Z', 'duration': 15}
                    ]
                }
            },
            {
                'title': 'Common Greetings',
                'description': 'Learn essential greeting signs in ASL',
                'sign_language': 'ASL',
                'difficulty_level': 1,
                'category': 'greetings',
                'estimated_duration': 20,
                'learning_objectives': [
                    'Master basic greeting signs',
                    'Understand cultural context',
                    'Practice conversation starters'
                ],
                'content': {
                    'lessons': [
                        {'title': 'Hello and Goodbye', 'duration': 10},
                        {'title': 'Please and Thank You', 'duration': 10}
                    ]
                }
            },
            {
                'title': 'Family Signs',
                'description': 'Learn to sign family member names',
                'sign_language': 'ASL',
                'difficulty_level': 2,
                'category': 'family',
                'estimated_duration': 25,
                'learning_objectives': [
                    'Sign immediate family members',
                    'Understand family relationships',
                    'Practice family conversations'
                ],
                'content': {
                    'lessons': [
                        {'title': 'Parents and Siblings', 'duration': 15},
                        {'title': 'Extended Family', 'duration': 10}
                    ]
                }
            }
        ]
        
        for module in modules:
            # Check if module already exists
            cursor.execute("SELECT id FROM learning_modules WHERE title = %s", (module['title'],))
            if cursor.fetchone():
                print(f"Module '{module['title']}' already exists, skipping...")
                continue
            
            # Insert module
            insert_query = """
            INSERT INTO learning_modules (title, description, sign_language, difficulty_level, 
                                        category, estimated_duration, learning_objectives, content, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            cursor.execute(insert_query, (
                module['title'],
                module['description'],
                module['sign_language'],
                module['difficulty_level'],
                module['category'],
                module['estimated_duration'],
                json.dumps(module['learning_objectives']),
                json.dumps(module['content']),
                True
            ))
            
            print(f"Created module: {module['title']}")
        
        connection.commit()
        return True
        
    except Exception as e:
        print(f"Error initializing modules: {e}")
        return False
    finally:
        connection.close()

def initialize_practice_tests():
    """Initialize practice tests."""
    connection = connect_to_database()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Get module IDs
        cursor.execute("SELECT id, title FROM learning_modules WHERE sign_language = 'ASL'")
        modules = cursor.fetchall()
        
        if not modules:
            print("No ASL modules found, skipping practice tests...")
            return True
        
        module_id = modules[0][0]  # Use first ASL module
        
        # Sample practice tests
        tests = [
            {
                'module_id': module_id,
                'title': 'ASL Alphabet Recognition Test',
                'description': 'Test your knowledge of ASL alphabet signs',
                'test_type': 'sign_recognition',
                'difficulty_level': 1,
                'time_limit': 300,  # 5 minutes
                'passing_score': 70.0,
                'questions': [
                    {
                        'question': 'What letter is this sign?',
                        'sign': 'A',
                        'options': ['A', 'B', 'C', 'D'],
                        'correct_answer': 'A',
                        'points': 10
                    },
                    {
                        'question': 'What letter is this sign?',
                        'sign': 'B',
                        'options': ['A', 'B', 'C', 'D'],
                        'correct_answer': 'B',
                        'points': 10
                    }
                ]
            },
            {
                'module_id': module_id,
                'title': 'Greeting Signs Test',
                'description': 'Test your knowledge of common greeting signs',
                'test_type': 'multiple_choice',
                'difficulty_level': 1,
                'time_limit': 180,  # 3 minutes
                'passing_score': 75.0,
                'questions': [
                    {
                        'question': 'How do you sign "Hello" in ASL?',
                        'options': ['Wave hand', 'Shake hands', 'Nod head', 'Point'],
                        'correct_answer': 'Wave hand',
                        'points': 15
                    },
                    {
                        'question': 'How do you sign "Thank you" in ASL?',
                        'options': ['Clap hands', 'Touch chin', 'Bow head', 'Smile'],
                        'correct_answer': 'Touch chin',
                        'points': 15
                    }
                ]
            }
        ]
        
        for test in tests:
            # Check if test already exists
            cursor.execute("SELECT id FROM practice_tests WHERE title = %s", (test['title'],))
            if cursor.fetchone():
                print(f"Test '{test['title']}' already exists, skipping...")
                continue
            
            # Insert test
            insert_query = """
            INSERT INTO practice_tests (module_id, title, description, test_type, 
                                      difficulty_level, time_limit, passing_score, questions, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            cursor.execute(insert_query, (
                test['module_id'],
                test['title'],
                test['description'],
                test['test_type'],
                test['difficulty_level'],
                test['time_limit'],
                test['passing_score'],
                json.dumps(test['questions']),
                True
            ))
            
            print(f"Created test: {test['title']}")
        
        connection.commit()
        return True
        
    except Exception as e:
        print(f"Error initializing tests: {e}")
        return False
    finally:
        connection.close()

def initialize_sample_progress():
    """Initialize sample user progress data."""
    connection = connect_to_database()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Get user IDs
        cursor.execute("SELECT id FROM users WHERE username IN ('john_doe', 'jane_smith')")
        users = cursor.fetchall()
        
        if not users:
            print("No sample users found, skipping progress initialization...")
            return True
        
        # Sample progress data
        progress_data = [
            {
                'user_id': users[0][0],
                'sign_language': 'ASL',
                'sign_learned': 'A',
                'accuracy': 85.5,
                'attempts': 3,
                'mastered': True,
                'time_spent': 120
            },
            {
                'user_id': users[0][0],
                'sign_language': 'ASL',
                'sign_learned': 'B',
                'accuracy': 78.0,
                'attempts': 2,
                'mastered': False,
                'time_spent': 90
            },
            {
                'user_id': users[0][0],
                'sign_language': 'ASL',
                'sign_learned': 'HELLO',
                'accuracy': 92.0,
                'attempts': 1,
                'mastered': True,
                'time_spent': 60
            }
        ]
        
        for progress in progress_data:
            # Check if progress already exists
            cursor.execute("""
                SELECT id FROM user_progress 
                WHERE user_id = %s AND sign_learned = %s
            """, (progress['user_id'], progress['sign_learned']))
            
            if cursor.fetchone():
                print(f"Progress for user {progress['user_id']}, sign '{progress['sign_learned']}' already exists, skipping...")
                continue
            
            # Insert progress
            insert_query = """
            INSERT INTO user_progress (user_id, sign_language, sign_learned, accuracy, 
                                     attempts, mastered, time_spent, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            now = datetime.utcnow()
            cursor.execute(insert_query, (
                progress['user_id'],
                progress['sign_language'],
                progress['sign_learned'],
                progress['accuracy'],
                progress['attempts'],
                progress['mastered'],
                progress['time_spent'],
                now,
                now
            ))
            
            print(f"Created progress record for user {progress['user_id']}, sign '{progress['sign_learned']}'")
        
        connection.commit()
        return True
        
    except Exception as e:
        print(f"Error initializing progress: {e}")
        return False
    finally:
        connection.close()

def main():
    """Main initialization function."""
    print("Initializing Sign Language Recognition Platform Database...")
    print("=" * 60)
    
    # Check database connection
    connection = connect_to_database()
    if not connection:
        print("Failed to connect to database. Please check your configuration.")
        sys.exit(1)
    
    connection.close()
    print("✓ Database connection successful")
    
    # Initialize sample data
    success = True
    
    print("\n1. Initializing sample users...")
    if initialize_sample_users():
        print("✓ Sample users initialized")
    else:
        print("✗ Failed to initialize sample users")
        success = False
    
    print("\n2. Initializing learning modules...")
    if initialize_learning_modules():
        print("✓ Learning modules initialized")
    else:
        print("✗ Failed to initialize learning modules")
        success = False
    
    print("\n3. Initializing practice tests...")
    if initialize_practice_tests():
        print("✓ Practice tests initialized")
    else:
        print("✗ Failed to initialize practice tests")
        success = False
    
    print("\n4. Initializing sample progress...")
    if initialize_sample_progress():
        print("✓ Sample progress initialized")
    else:
        print("✗ Failed to initialize sample progress")
        success = False
    
    print("\n" + "=" * 60)
    if success:
        print("✓ Database initialization completed successfully!")
        print("\nSample users created:")
        print("- admin / admin123 (Administrator)")
        print("- john_doe / password123 (Disabled user)")
        print("- jane_smith / password123 (Regular user)")
    else:
        print("✗ Database initialization completed with errors.")
        sys.exit(1)

if __name__ == "__main__":
    main()
