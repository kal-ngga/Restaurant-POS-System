#!/bin/bash

# Script untuk TEST REGISTER & LOGIN
# Jalankan dengan: bash test-auth.sh

echo "🧪 TEST AUTHENTICATION FLOW"
echo "=============================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://127.0.0.1:8000"
CSRF_TOKEN=""

# Function to get CSRF token dari halaman login
get_csrf_token() {
    CSRF_TOKEN=$(curl -s "$BASE_URL/" | grep -o 'csrf-token.*value="[^"]*' | cut -d'"' -f2)
    echo "✓ CSRF Token: ${CSRF_TOKEN:0:20}..."
}

# Test 1: Register
test_register() {
    echo ""
    echo -e "${YELLOW}[TEST 1] REGISTER NEW USER${NC}"
    echo "==============================="
    
    EMAIL="testuser$(date +%s)@example.com"
    USERNAME="testuser$(date +%s)"
    PASSWORD="TestPassword123"
    
    echo "Email: $EMAIL"
    echo "Username: $USERNAME"
    echo "Password: $PASSWORD"
    echo ""
    
    RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
        -H "Content-Type: application/json" \
        -H "X-CSRF-TOKEN: $CSRF_TOKEN" \
        -d "{
            \"email\": \"$EMAIL\",
            \"username\": \"$USERNAME\",
            \"password\": \"$PASSWORD\",
            \"password_confirmation\": \"$PASSWORD\"
        }")
    
    echo "Response: $RESPONSE"
    
    if echo "$RESPONSE" | grep -q "ok"; then
        echo -e "${GREEN}✓ Register berhasil!${NC}"
        echo "Email: $EMAIL" > /tmp/test-user.txt
        echo "Password: $PASSWORD" >> /tmp/test-user.txt
        return 0
    else
        echo -e "${RED}✗ Register gagal!${NC}"
        return 1
    fi
}

# Test 2: Login dengan user yang baru terdaftar
test_login() {
    echo ""
    echo -e "${YELLOW}[TEST 2] LOGIN WITH NEW USER${NC}"
    echo "==============================="
    
    EMAIL=$(head -n1 /tmp/test-user.txt | cut -d' ' -f2)
    PASSWORD=$(tail -n1 /tmp/test-user.txt | cut -d' ' -f2)
    
    echo "Email: $EMAIL"
    echo "Password: $PASSWORD"
    echo ""
    
    RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
        -H "Content-Type: application/json" \
        -H "X-CSRF-TOKEN: $CSRF_TOKEN" \
        -d "{
            \"email\": \"$EMAIL\",
            \"password\": \"$PASSWORD\"
        }")
    
    echo "Response: $RESPONSE"
    
    if echo "$RESPONSE" | grep -q "ok"; then
        echo -e "${GREEN}✓ Login berhasil!${NC}"
        return 0
    else
        echo -e "${RED}✗ Login gagal!${NC}"
        return 1
    fi
}

# Test 3: Check database
test_database() {
    echo ""
    echo -e "${YELLOW}[TEST 3] CHECK DATABASE${NC}"
    echo "==============================="
    
    EMAIL=$(head -n1 /tmp/test-user.txt | cut -d' ' -f2)
    
    echo "Checking if user exists in database..."
    echo ""
    
    mysql -u root restaurant_pos_db -e "SELECT id, name, email, role, created_at FROM users WHERE email='$EMAIL';"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ User found in database!${NC}"
        return 0
    else
        echo -e "${RED}✗ User not found in database!${NC}"
        return 1
    fi
}

# Test 4: List all users
test_all_users() {
    echo ""
    echo -e "${YELLOW}[TEST 4] SHOW ALL USERS${NC}"
    echo "==============================="
    
    mysql -u root restaurant_pos_db -e "SELECT id, name, email, role, created_at FROM users;"
}

# Main flow
echo -e "${YELLOW}Starting tests...${NC}"
get_csrf_token

test_register && test_login && test_database && test_all_users

echo ""
echo -e "${GREEN}All tests completed!${NC}"
echo ""
echo "User credentials saved to /tmp/test-user.txt"
cat /tmp/test-user.txt
