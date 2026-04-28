# Person 3 - Browser UI Testing Guide
## Complete Step-by-Step Instructions for Testing via Web Interface

---

## **PART 1: INITIAL SETUP**

### Step 1: Start the Server
```powershell
node app.js
```

Expected output:
```
Server running on port http://localhost:3000
```

### Step 2: Open Browser
- Chrome, Firefox, Edge, or Safari
- Go to: `http://localhost:3000`

---

## **PART 2: CREATE TEST DATA**

### Step 2.1: Create Admin User (First Time Setup)

**In your terminal/PowerShell**, run this command to create an admin user directly in MongoDB:

```powershell
# Using Node.js REPL to create admin user
node
```

Then in Node console:
```javascript
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect('YOUR_MONGODB_CONNECTION_STRING');

async function createAdmin() {
  const hashed = await bcrypt.hash('Admin123!', 10);
  const admin = await User.create({
    username: 'admin',
    password: hashed,
    role: 'Admin',
    isActive: true
  });
  console.log('Admin created:', admin);
  process.exit();
}

createAdmin();
```

**OR use MongoDB Compass to insert:**
1. Open MongoDB Compass
2. Connect to your database
3. Go to: `computer-inventory-system` → `users` collection
4. Insert document:
```json
{
  "username": "admin",
  "password": "$2a$10$...", // bcrypt hash of "Admin123!"
  "role": "Admin",
  "isActive": true,
  "createdAt": {"$date": "2025-04-29T10:00:00Z"}
}
```

---

## **PART 3: LOGIN & ACCESS USER MANAGEMENT PAGE**

### Step 3.1: Navigate to Login Page
1. Open browser
2. Go to: `http://localhost:3000/login`
3. You should see a login form

### Step 3.2: Login as Admin
1. **Username:** `admin`
2. **Password:** `Admin123!`
3. Click **Login**
4. Should redirect to: `http://localhost:3000/items`

### Step 3.3: Navigate to Users Management Page
1. In the URL bar, go to: `http://localhost:3000/users`
2. You should see the **User Management** page

---

## **PART 4: TEST USER MANAGEMENT UI**

### Test 4.1: Verify Page Layout

✅ **Checklist - What you should see:**
- [ ] Page title: "User Management"
- [ ] Form section: "Create New User"
- [ ] Form fields:
  - Username (text input)
  - Email (email input)
  - Password (password input)
  - Role (dropdown)
  - Full Name (text input)
  - Department (dropdown)
  - Create User button
- [ ] Table section: "Users List"
- [ ] Table columns:
  - Username
  - Email
  - Full Name
  - Role
  - Department
  - Status
  - Assets Assigned
  - Created
  - Actions

---

### Test 4.2: Create First Test User

**Form Input:**
1. **Username:** `tech1`
2. **Email:** `tech1@example.com`
3. **Password:** `TechPass123!`
4. **Role:** Click dropdown → Select **"Technician"**
   - ✅ **Verify:** Only "Admin" and "Technician" are shown (NOT Manager/User)
5. **Full Name:** `John Technician`
6. **Department:** Select `IT`
7. Click **Create User**

**After Submission:**
- [ ] Page refreshes
- [ ] New user appears in the table
- [ ] All fields match what you entered
- [ ] No JavaScript errors in console (F12)

---

### Test 4.3: Create Second Test User (Admin)

**Form Input:**
1. **Username:** `tech2`
2. **Email:** `tech2@example.com`
3. **Password:** `TechPass456!`
4. **Role:** Select **"Admin"**
5. **Full Name:** `Jane Admin`
6. **Department:** `Management`
7. Click **Create User**

---

### Test 4.4: Test Role Update Dropdown

**In the Users Table:**
1. Find user **"tech1"** (Technician)
2. In the **Role** column, you'll see a **dropdown** showing "Technician"
3. Click the dropdown
4. **Verify:**
   - [ ] Only shows "Admin" and "Technician"
   - [ ] NO "Manager" or "User" options
5. Select **"Admin"**
6. **Verify:**
   - [ ] Dropdown auto-submits (no button click needed)
   - [ ] Page doesn't reload
   - [ ] Role changes to "Admin" in the table

---

### Test 4.5: Test Status Update Dropdown

**In the Users Table:**
1. Find any user
2. In the **Status** column, you'll see a **dropdown** showing "Enabled"
3. Click the dropdown
4. **Verify:**
   - [ ] Only shows "Enabled" and "Disabled"
   - [ ] NO "Active", "Inactive", or "Suspended" options
5. Select **"Disabled"**
6. **Verify:**
   - [ ] Dropdown auto-submits
   - [ ] Status changes to "Disabled"
   - [ ] Text shows "Disabled" in red/warning color

---

### Test 4.6: Test "View Assets" Button

**Prerequisites:**
- You have at least one user in the list

**Steps:**
1. Find a user in the table
2. In the **Actions** column, click **"View Assets"**
3. **Verify:**
   - [ ] Navigates to new page
   - [ ] URL changes to: `http://localhost:3000/users/[user-id]/assets`
   - [ ] Shows user name and list of assigned items (if any)
   - [ ] Shows columns: Serial Number, Model, Brand, Status, etc.

---

### Test 4.7: Re-enable a Disabled User

**Steps:**
1. Find the user you disabled (status = "Disabled")
2. Click the **Status** dropdown
3. Select **"Enabled"**
4. **Verify:**
   - [ ] Status changes back to "Enabled"
   - [ ] User is now active again

---

## **PART 5: TEST API KEY MANAGEMENT UI**

### Step 5.1: Navigate to API Keys Page

1. In the URL bar, go to: `http://localhost:3000/keys`
2. You should see the **API Key Management** page

---

### Test 5.2: Verify Page Layout

✅ **Checklist - What you should see:**
- [ ] Page title: "API Key Management"
- [ ] Form section: "Generate New API Key"
- [ ] Form fields:
  - Key Name/Description (text input)
  - Permissions (multi-select dropdown)
  - Expiration (dropdown)
  - Allowed IPs (text input, optional)
  - Generate API Key button
- [ ] Table section: "Active API Keys"
- [ ] Table columns:
  - Key Name
  - Key Status
  - Permissions
  - Allowed IPs
  - Created
  - Expires
  - Last Used
  - Status
  - Actions

---

### Test 5.3: Generate First API Key

**Form Input:**
1. **Key Name:** `Integration Key 1`
2. **Permissions:** 
   - Click the multi-select box
   - Select multiple options:
     - ✅ `Read Items`
     - ✅ `Write Items`
     - ✅ `Read Transactions`
3. **Expiration:** Select `30 Days`
4. **Allowed IPs:** (leave blank for "all IPs")
5. Click **Generate API Key**

**After Submission:**
- [ ] A modal/alert pops up with the raw API key
- [ ] Message says: **"PLEASE COPY THIS, IT SHOWS ONLY ONCE HERE!"**
- [ ] Raw key format: `sk_[long-hex-string]`
- [ ] **COPY and SAVE this key** (you'll need it later)
- [ ] Click OK to close modal

---

### Test 5.4: Verify Key is Hidden in Table

**After generating the key:**
1. You're still on the `/keys` page
2. Look at the **API Keys** table below
3. Find your newly created key
4. **Verify:**
   - [ ] **Key Name** shows: "Integration Key 1"
   - [ ] **Key Status** column shows: **"Hidden (Shown only at creation)"**
   - [ ] NO raw key visible anywhere in the table
   - [ ] NO copy button visible
   - [ ] **This is the correct security behavior!**

---

### Test 5.5: Check Permissions Display

**In the API Keys Table:**
1. Find your key row
2. In the **Permissions** column, you should see **badges** for each permission
3. **Verify:**
   - [ ] Shows: `Read Items`, `Write Items`, `Read Transactions`
   - [ ] Each shows as a colored badge/pill
   - [ ] All 3 permissions you selected are displayed

---

### Test 5.6: Check Expiration Status

**In the API Keys Table:**
1. Find your key row
2. Check the **Expires** column
3. **Verify:**
   - [ ] Shows a date (approximately 30 days from now)
   - [ ] Shows status: **"Active"** (green badge)
   - [ ] NO warning or "Expiring Soon" message (since it's new)

---

### Test 5.7: Revoke an API Key

**Steps:**
1. Find any key in the table
2. In the **Actions** column, click the **"Revoke"** button
3. A confirmation dialog appears asking: "Are you sure you want to revoke this API key?"
4. Click **"OK"** to confirm
5. **Verify:**
   - [ ] Key is removed from the active list (soft delete)
   - [ ] Page refreshes
   - [ ] Key no longer appears in the table

---

### Test 5.8: Generate Key with Allowed IPs

**Form Input:**
1. **Key Name:** `Restricted IP Key`
2. **Permissions:** Select `Read Items`
3. **Expiration:** Select `90 Days`
4. **Allowed IPs:** `192.168.1.100, 10.0.0.1`
5. Click **Generate API Key**

**After submission:**
1. Copy the raw key when the modal appears
2. Check the table
3. **Verify:**
   - [ ] Key appears in table
   - [ ] **Allowed IPs** column shows:
     ```
     192.168.1.100
     10.0.0.1
     ```
   - [ ] IPs are listed (one per line)

---

### Test 5.9: Generate Key with No IP Restriction

**Form Input:**
1. **Key Name:** `Unrestricted Key`
2. **Permissions:** Select `Read Items`, `Write Items`
3. **Expiration:** `Never Expires`
4. **Allowed IPs:** (leave empty)
5. Click **Generate API Key**

**After submission:**
1. Verify in table
2. **Verify:**
   - [ ] **Allowed IPs** column shows: "All IPs"
   - [ ] **Expires** column shows: "Never" (no expiration warning)
   - [ ] **Status** shows: "Active"

---

## **PART 6: SECURITY TESTS IN BROWSER**

### Test 6.1: Can You Access `/users` Without Login?

**Steps:**
1. Open new browser tab or use incognito mode
2. Go directly to: `http://localhost:3000/users`
3. **Verify:**
   - [ ] Redirects to login page
   - [ ] Cannot access user management without authentication
   - [ ] ✅ Security working correctly

---

### Test 6.2: Can You Access `/keys` Without Login?

**Steps:**
1. Go directly to: `http://localhost:3000/keys` (without login)
2. **Verify:**
   - [ ] Redirects to login page
   - [ ] Cannot access API keys without authentication
   - [ ] ✅ Security working correctly

---

### Test 6.3: Test Disabled User Cannot Login

**Prerequisites:**
- You have a disabled user in the database (from earlier tests)

**Steps:**
1. Logout current admin (go to `/logout`)
2. Go to login page: `http://localhost:3000/login`
3. Try to login with a disabled user:
   - **Username:** `tech1` (if you disabled it)
   - **Password:** `TechPass123!`
4. Click **Login**
5. **Verify:**
   - [ ] Login fails
   - [ ] Shows error message: "Invalid credentials"
   - [ ] ✅ Disabled users cannot login

---

### Test 6.4: Test Login Required for Role Changes

**Steps:**
1. Logout completely
2. Delete browser cookies (to remove JWT)
3. Try to access: `http://localhost:3000/users`
4. **Verify:**
   - [ ] Redirects to login
   - [ ] Cannot change roles without being logged in

---

## **PART 7: FULL END-TO-END WORKFLOW TEST**

### Complete User Lifecycle Test

**Follow these steps in order:**

1. ✅ **Login as Admin**
   - Go to `/login`
   - Username: `admin`
   - Password: `Admin123!`

2. ✅ **Navigate to Users Page**
   - Go to `/users`
   - Verify you see the users table

3. ✅ **Create Test User**
   - Fill "Create New User" form
   - Username: `lifecycle_test`
   - Email: `lifecycle@test.com`
   - Password: `Test123!`
   - Role: `Technician`
   - Full Name: `Lifecycle Test`
   - Department: `IT`
   - Click **Create User**
   - Verify user appears in table

4. ✅ **Update User Role**
   - Find the user in table
   - Click role dropdown
   - Change from `Technician` to `Admin`
   - Verify change happens immediately

5. ✅ **View User's Assets**
   - In Actions column, click **View Assets**
   - Verify page loads (may be empty)
   - Go back to `/users`

6. ✅ **Disable User**
   - Click status dropdown
   - Select `Disabled`
   - Verify status changes

7. ✅ **Try Disabled User Login**
   - Logout (go to `/logout`)
   - Go to `/login`
   - Try logging in with `lifecycle_test` / `Test123!`
   - Verify login fails

8. ✅ **Re-enable User**
   - Login as admin again
   - Go to `/users`
   - Find the disabled user
   - Click status dropdown
   - Select `Enabled`
   - Verify status changes

9. ✅ **Verify Re-enabled User Can Login**
   - Logout
   - Go to `/login`
   - Login with `lifecycle_test` / `Test123!`
   - Verify login succeeds

10. ✅ **Go to API Keys Page**
    - Go to `/keys`
    - Verify page loads

11. ✅ **Generate API Key**
    - Fill form with:
      - Key Name: `lifecycle_key`
      - Permissions: select 2-3 options
      - Expiration: `30d`
    - Click **Generate API Key**
    - Verify modal shows raw key
    - **Copy the key**

12. ✅ **Verify Key is Hidden in Table**
    - Check table
    - Verify **Key Status** = "Hidden (Shown only at creation)"
    - Verify no copy button

13. ✅ **Revoke API Key**
    - Click **Revoke** button
    - Confirm in dialog
    - Verify key removed from table

14. ✅ **Logout**
    - Go to `/logout`
    - Verify redirected to login

---

## **PART 8: BROWSER CONSOLE DEBUGGING**

### If You See JavaScript Errors

1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Look for red errors
4. **Common issues:**
   - Missing handlebars helpers (look for "ReferenceError: eq is not defined")
   - Missing CSS/styling
   - AJAX errors

### Check Network Tab for API Calls

1. Press **F12**
2. Go to **Network** tab
3. Perform actions (create user, update role, etc.)
4. **Verify:**
   - [ ] API calls show 200/201 status
   - [ ] Response contains expected data
   - [ ] No 401/403/500 errors

---

## **PART 9: VERIFICATION CHECKLIST**

### Users Page Verification
- [ ] Page accessible only with Admin login
- [ ] Role dropdown shows ONLY: Admin, Technician
- [ ] Status dropdown shows ONLY: Enabled, Disabled
- [ ] Create user form works
- [ ] Role update auto-submits
- [ ] Status update auto-submits
- [ ] Assets Assigned column shows count
- [ ] View Assets button navigates to asset page
- [ ] Create user form has all fields

### API Keys Page Verification
- [ ] Page accessible only with Admin login
- [ ] Generate key form has:
  - [ ] Key Name input
  - [ ] Multi-select permissions
  - [ ] Expiration dropdown
  - [ ] Allowed IPs input
- [ ] Generated key shows raw key only once in modal
- [ ] Key is hidden in table after creation
- [ ] Permissions display as badges
- [ ] Expiration shows date correctly
- [ ] Status shows Active/Expired correctly
- [ ] Revoke button works with confirmation
- [ ] Revoked keys removed from table

### Security Verification
- [ ] Cannot access `/users` without login
- [ ] Cannot access `/keys` without login
- [ ] Disabled users cannot login
- [ ] API keys are hashed (not visible in table)
- [ ] Dropdown changes auto-submit

---

## **TROUBLESHOOTING**

### Page Won't Load
- [ ] Is server running? Check terminal
- [ ] Is MongoDB connected? Check server logs
- [ ] Are you logged in? Try `/login`
- [ ] Clear browser cache (Ctrl+Shift+Delete)

### Form Won't Submit
- [ ] Check browser console (F12) for errors
- [ ] Make sure all required fields filled
- [ ] Check server logs for error messages
- [ ] Verify JWT token is valid (check cookies in F12)

### Dropdown Doesn't Change
- [ ] Check browser console for JavaScript errors
- [ ] Make sure auth middleware is working
- [ ] Verify API endpoint is returning 200 status

### Disabled User Still Can Login
- [ ] Check if auth middleware checks `isActive` flag
- [ ] Verify user is actually saved as disabled in DB
- [ ] Check server logs for auth errors

### API Key Not Showing Raw Key
- [ ] Check if POST `/api/keys` is returning rawKey in response
- [ ] Verify `label` field is provided in form
- [ ] Check server logs for errors

---

## **NEXT STEPS**

✅ If all tests pass:
1. Document any issues found
2. Check Person 1 implementation (JWT, RBAC, auth)
3. Test with Person 4's check-in/out features
4. Test with Person 2's inventory endpoints

❌ If tests fail:
1. Check error messages in server terminal
2. Check browser console (F12)
3. Check MongoDB for data
4. Review test guide line-by-line
