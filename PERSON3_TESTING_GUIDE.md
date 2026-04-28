# Person 3 - Testing Guide
## User Management Endpoints & API Key Management

---

## **PART 1: SETUP & PREREQUISITES**

### 1. Install Postman or use curl/PowerShell
- **Postman**: Download from https://www.postman.com/downloads/
- OR use **curl/PowerShell** (included with Windows)

### 2. Start the Server
```powershell
node app.js
```
Expected output:
```
Server running on port http://localhost:3000
```

### 3. Create a MongoDB Database
- Use MongoDB Compass or Atlas
- Ensure connection string is in `.env`

---

## **PART 2: TEST API ENDPOINTS**

### **Test 2.1: Create First Admin User**

**Why**: You need an Admin to test other endpoints (RBAC protection)

**Using Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/users`
- Headers: `Content-Type: application/json`
- Body (JSON):
```json
{
  "username": "admin1",
  "password": "AdminPass123!",
  "role": "Admin",
  "isActive": true
}
```

**Using PowerShell:**
```powershell
$body = @{
    username = "admin1"
    password = "AdminPass123!"
    role = "Admin"
    isActive = $true
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/users" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response** (201):
```json
{
  "message": "User is created",
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "admin1",
    "role": "Admin",
    "isActive": true,
    "createdAt": "2025-04-29T10:00:00.000Z"
  }
}
```

✅ **What to verify:**
- [ ] Status code is 201
- [ ] Password is NOT returned in response
- [ ] User ID is created
- [ ] Role is "Admin" (NOT Manager/User)

---

### **Test 2.2: Login as Admin (Get JWT Token)**

**Why**: You need JWT token to test protected endpoints

**Using Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/login`
- Body:
```json
{
  "username": "admin1",
  "password": "AdminPass123!"
}
```

**Using PowerShell:**
```powershell
$body = @{
    username = "admin1"
    password = "AdminPass123!"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$token = ($response.Content | ConvertFrom-Json).token
Write-Host "Your JWT Token: $token"
```

**Expected Response** (200):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

✅ **What to verify:**
- [ ] Status code is 200
- [ ] Token is returned
- [ ] Token starts with "eyJ" (JWT format)

**SAVE THIS TOKEN** - You'll use it for the next tests. In Postman, store it as a variable:
- Go to **Tests** tab → add `pm.globals.set("jwt_token", pm.response.json().token);`

---

### **Test 2.3: Create Second User (Technician)**

**Why**: Test creating non-Admin users and verify RBAC

**Using Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/users`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{jwt_token}}`  ← Use the token from Test 2.2
- Body:
```json
{
  "username": "tech1",
  "password": "TechPass123!",
  "role": "Technician",
  "isActive": true
}
```

**Expected Response** (201):
```json
{
  "message": "User is created",
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "tech1",
    "role": "Technician",
    "isActive": true
  }
}
```

✅ **What to verify:**
- [ ] Technician user created successfully
- [ ] Role is "Technician" (valid enum)

---

### **Test 2.4: Test RBAC - Create User WITHOUT JWT**

**Why**: Verify RBAC protection works

**Using Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/users`
- Headers: `Content-Type: application/json` (NO Authorization header)
- Body: Same as Test 2.3

**Expected Response** (401 or 403):
```json
{
  "message": "Unauthorized"
}
```

❌ **If you get 201** - RBAC is broken!
✅ **If you get 401/403** - RBAC working correctly

---

### **Test 2.5: Update User Role**

**Why**: Test role update endpoint and inline form submission

**Using Postman:**
- Method: `PATCH`
- URL: `http://localhost:3000/api/users/65a1b2c3d4e5f6g7h8i9j0k1/role` ← Replace with tech1's ID
- Headers: `Authorization: Bearer {{jwt_token}}`
- Body:
```json
{
  "role": "Admin"
}
```

**Expected Response** (200):
```json
{
  "message": "Role updated",
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "tech1",
    "role": "Admin",
    "isActive": true
  }
}
```

✅ **What to verify:**
- [ ] Role changed from "Technician" to "Admin"
- [ ] Returns updated user object

---

### **Test 2.6: Test Invalid Role**

**Why**: Verify input validation

**Using Postman:**
- Method: `PATCH`
- URL: Same as Test 2.5
- Body:
```json
{
  "role": "InvalidRole"
}
```

**Expected Response** (400):
```json
{
  "error": "Invalid role"
}
```

✅ **What to verify:**
- [ ] Returns 400 error for invalid role
- [ ] Only accepts "Admin" or "Technician"

---

### **Test 2.7: Update User Status (Enable/Disable)**

**Using Postman:**
- Method: `PATCH`
- URL: `http://localhost:3000/api/users/65a1b2c3d4e5f6g7h8i9j0k1/status`
- Headers: `Authorization: Bearer {{jwt_token}}`
- Body:
```json
{
  "isActive": false
}
```

**Expected Response** (200):
```json
{
  "message": "User tech1 is disabled"
}
```

✅ **What to verify:**
- [ ] Status changed to disabled
- [ ] Message confirms action

---

### **Test 2.8: Test Disabled User Can't Login**

**Why**: Verify business rule: "Disabled users cannot authenticate"

**Using Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/login`
- Body:
```json
{
  "username": "tech1",
  "password": "TechPass123!"
}
```

**Expected Response** (401):
```json
{
  "message": "Invalid credentials" or "User is disabled"
}
```

❌ **If login succeeds** - Business rule broken!
✅ **If login fails** - Correctly implemented

---

### **Test 2.9: Generate API Key**

**Why**: Test API key creation and verify it shows only once

**Using Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/keys`
- Headers: `Authorization: Bearer {{jwt_token}}` (must be Admin)
- Body:
```json
{
  "label": "Integration Key 1"
}
```

**Expected Response** (201):
```json
{
  "message": "API Key Created, PLEASE COPY THIS, IT SHOWS ONLY ONCE HERE!",
  "rawKey": "sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z"
}
```

✅ **What to verify:**
- [ ] Raw key is returned (sk_ prefix)
- [ ] Message warns "SHOWS ONLY ONCE"
- [ ] **SAVE THIS KEY** - You'll need it for API key auth test
- [ ] Key is shown in JSON response (not hidden yet)

---

### **Test 2.10: List API Keys**

**Using Postman:**
- Method: `GET`
- URL: `http://localhost:3000/api/keys`
- Headers: `Authorization: Bearer {{jwt_token}}`

**Expected Response** (200):
```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "label": "Integration Key 1",
    "keyPrefix": "sk_a1b2c3d4",
    "createdBy": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "username": "admin1"
    },
    "isActive": true,
    "createdAt": "2025-04-29T10:15:00.000Z"
  }
]
```

✅ **What to verify:**
- [ ] API key list returned
- [ ] `hashedKey` is NOT returned (security)
- [ ] Only shows `keyPrefix` (masked display)
- [ ] Creator info shows
- [ ] `isActive` flag present

---

### **Test 2.11: Revoke/Delete API Key**

**Using Postman:**
- Method: `DELETE`
- URL: `http://localhost:3000/api/keys/65a1b2c3d4e5f6g7h8i9j0k1`  ← Replace with key ID
- Headers: `Authorization: Bearer {{jwt_token}}`

**Expected Response** (200):
```json
{
  "message": "Key revoked"
}
```

**Then list keys again (Test 2.10):**
- Should show `"isActive": false` instead of removing it (soft delete per SRS)

✅ **What to verify:**
- [ ] Key marked as inactive (soft delete)
- [ ] Key still exists in DB but not usable

---

### **Test 2.12: Disabled User's Keys Are Invalidated**

**Why**: Business rule: "Disabled users' API keys must be invalidated"

**Setup:**
1. Create a Technician user
2. Generate an API key as that user
3. Disable the user (Test 2.7)
4. Check if the key is now inactive

**Using Postman:**
- Create key with Technician, then disable that Technician
- GET `/api/keys` should show `"isActive": false`

---

## **PART 3: TEST HBS UI PAGES**

### **Test 3.1: Access Users Management Page**

**Using Browser:**
1. Open `http://localhost:3000/users`
2. You should see login page (authentication required)
3. Login as admin1
4. Should redirect to users management page

✅ **What to verify:**
- [ ] Can access `/users` page
- [ ] Authentication required (gets redirected to login)
- [ ] Users table displays all users
- [ ] "Create New User" form visible

---

### **Test 3.2: Create User via UI Form**

**Using Browser:**
1. On `/users` page
2. Fill "Create New User" form:
   - Username: `testuser1`
   - Email: `test@example.com`
   - Password: `TestPass123!`
   - Role: Select **"Technician"** (verify only Admin/Technician shown)
   - Full Name: `Test User`
3. Click "Create User"

✅ **What to verify:**
- [ ] Form accepts input
- [ ] Only "Admin" and "Technician" roles available (NOT Manager/User)
- [ ] User created successfully
- [ ] Appears in table immediately

---

### **Test 3.3: Update User Role via Dropdown**

**Using Browser:**
1. On `/users` page
2. In users table, find a user
3. In "Role" column, click dropdown
4. Change from "Technician" to "Admin"
5. Dropdown auto-submits

✅ **What to verify:**
- [ ] Dropdown shows only "Admin" and "Technician"
- [ ] Selection auto-submits via form
- [ ] Role updates in table
- [ ] No page reload needed (inline update)

---

### **Test 3.4: Update User Status via Dropdown**

**Using Browser:**
1. On `/users` page
2. In "Status" column, click dropdown
3. Change between "Enabled" and "Disabled"

✅ **What to verify:**
- [ ] Only "Enabled" and "Disabled" options (NOT Active/Inactive/Suspended)
- [ ] Status updates immediately
- [ ] User can be disabled without deletion

---

### **Test 3.5: View Assets (User Audit)**

**Using Browser:**
1. On `/users` page
2. Look for "Assets Assigned" column (should show number like "2")
3. Click "View Assets" button
4. Should navigate to `/users/:id/assets`

✅ **What to verify:**
- [ ] Assets column shows count
- [ ] "View Assets" link navigates to asset page
- [ ] Shows items assigned to that user
- [ ] Implements User Audit requirement from SRS

---

### **Test 3.6: Access API Keys Management Page**

**Using Browser:**
1. Open `http://localhost:3000/keys`
2. Must be logged in as Admin
3. Should see API Keys management page

✅ **What to verify:**
- [ ] Can access `/keys` page
- [ ] Requires Admin authentication
- [ ] API keys table visible
- [ ] "Generate New API Key" form visible

---

### **Test 3.7: Generate API Key via UI Form**

**Using Browser:**
1. On `/keys` page
2. Fill form:
   - Key Name: `Test Integration`
   - Permissions: Select multiple (read:items, write:items)
   - Expiration: `30d`
   - Allowed IPs: (leave blank or enter IPs)
3. Click "Generate API Key"

✅ **What to verify:**
- [ ] Form has multi-select for permissions
- [ ] Expiration options include: 7d, 30d, 90d, 1y, never
- [ ] Key generated successfully
- [ ] **CRITICAL**: Raw key shown in modal/alert (shown once)

---

### **Test 3.8: Verify API Key is Hidden in Table**

**Using Browser:**
1. After generating key (Test 3.7)
2. Look at API keys table
3. In "Key Status" column, should show: **"Hidden (Shown only at creation)"**
4. NO copy button visible
5. NO raw key displayed

❌ **If raw key is shown in table** - Security issue!
✅ **If showing "Hidden"** - Correct implementation

---

### **Test 3.9: Revoke API Key via UI**

**Using Browser:**
1. On `/keys` page
2. Find a key in the table
3. Click "Revoke" button
4. Confirm in dialog

✅ **What to verify:**
- [ ] Revoke button triggers confirmation dialog
- [ ] Key status changes to "Expired" or "Inactive"
- [ ] Key removed from active list (soft delete)

---

### **Test 3.10: Check Expiration Status Display**

**Using Browser:**
1. Generate keys with different expiration dates
2. Check status display:
   - Active key: Green "Active" badge
   - Expired key: Red "Expired" badge
   - Expiring soon (< 7 days): Orange warning

✅ **What to verify:**
- [ ] Status colors indicate expiration
- [ ] Warning for soon-to-expire keys
- [ ] Expired keys clearly marked

---

## **PART 4: SECURITY & EDGE CASE TESTING**

### **Test 4.1: RBAC - Only Admin Can Create Users**

**Scenario**: Try to create user as Technician

**Steps:**
1. Login as technician user
2. Try POST `/api/users` with JWT token
3. Should get 403 Forbidden

**Expected**: Only Admin can create users ✅

---

### **Test 4.2: RBAC - Only Admin Can Generate API Keys**

**Scenario**: Try to generate key as Technician

**Steps:**
1. Login as technician
2. Try POST `/api/keys` with JWT token
3. Should get 403 Forbidden

**Expected**: Only Admin can generate keys ✅

---

### **Test 4.3: RBAC - Only Admin Can Revoke Keys**

**Scenario**: Try to revoke key as Technician

**Steps:**
1. Login as technician
2. Try DELETE `/api/keys/:id` with JWT token
3. Should get 403 Forbidden

**Expected**: Only Admin can revoke keys ✅

---

### **Test 4.4: Test Non-Existent User**

**Using Postman:**
- PATCH `/api/users/invalidid123/role`
- Headers: `Authorization: Bearer {{jwt_token}}`

**Expected Response** (404):
```json
{
  "error": "User not found"
}
```

✅ Verify error handling for invalid IDs

---

### **Test 4.5: Test Non-Existent API Key**

**Using Postman:**
- DELETE `/api/keys/invalidid123`
- Headers: `Authorization: Bearer {{jwt_token}}`

**Expected Response** (404):
```json
{
  "error": "Key not found"
}
```

✅ Verify error handling

---

### **Test 4.6: Test Duplicate Username**

**Using Postman:**
- Create user with username "admin1" (already exists)
- POST `/api/users`

**Expected Response** (400):
```json
{
  "error": "Duplicate key error" or similar
}
```

✅ Verify unique username constraint

---

## **PART 5: INTEGRATION & FULL WORKFLOW TEST**

### **Complete User Lifecycle Test:**

1. ✅ Create Admin user (Test 2.1)
2. ✅ Login as Admin (Test 2.2)
3. ✅ Create Technician user (Test 2.3)
4. ✅ Update Technician role (Test 2.5)
5. ✅ Create API key (Test 2.9)
6. ✅ List API keys (Test 2.10)
7. ✅ Disable Technician (Test 2.7)
8. ✅ Verify Technician can't login (Test 2.8)
9. ✅ Verify Technician's keys are disabled
10. ✅ Re-enable Technician (Test 2.7 with isActive: true)
11. ✅ Technician can login again

---

## **PART 6: CHECKLIST FOR PERSON 3 COMPLETION**

### **API Endpoints:**
- [ ] POST `/api/users` - Create user (Admin only)
- [ ] PATCH `/api/users/:id/role` - Update role (Admin only)
- [ ] PATCH `/api/users/:id/status` - Update status (Admin only)
- [ ] POST `/api/keys` - Generate key (Admin only)
- [ ] GET `/api/keys` - List keys (Admin only)
- [ ] DELETE `/api/keys/:id` - Revoke key (Admin only)

### **HBS UI Pages:**
- [ ] `/users` - User management page with CRUD form
- [ ] `/users/:id/assets` - User audit trail (assets assigned)
- [ ] `/keys` - API key management page
- [ ] Role dropdown shows: Admin, Technician only
- [ ] Status dropdown shows: Enabled, Disabled only
- [ ] API key shown only once (hidden in table after creation)

### **Security Requirements:**
- [ ] RBAC enforced (Admin only endpoints)
- [ ] JWT authentication required
- [ ] Disabled users can't authenticate
- [ ] Disabled users' API keys become inactive
- [ ] API keys are hashed in database
- [ ] Passwords never returned in API responses
- [ ] Input validation (valid roles, emails, etc.)

### **Business Rules:**
- [ ] Status Validation: Can't create invalid roles
- [ ] Auth Restriction: Disabled users can't login
- [ ] Data Integrity: Users soft-deleted, not hard-deleted

---

## **TROUBLESHOOTING**

**Error: "Unauthorized" when testing endpoints**
- Did you include the JWT token in Authorization header?
- Is token format correct? Should be `Bearer {{token}}`
- Did token expire? Generate a new one

**Error: "User not found"**
- Make sure you're using correct user ID from creation response

**Error: "Only Admin role allowed"**
- Make sure you're using JWT token from Admin user login

**API Key not showing in database**
- Check MongoDB Compass if ApiKey collection exists
- Verify hashedKey is stored (should be SHA256 hash)

**UI Page not rendering**
- Are you logged in? Need JWT cookie from /login
- Check browser console for JavaScript errors
- Check server logs for route errors
- Verify handlebars helpers are registered in app.js
