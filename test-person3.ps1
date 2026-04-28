# Person 3 - Automated Testing Script
# Run this script to automatically test all Person 3 endpoints

$baseUrl = "http://localhost:3000"
$adminToken = ""
$technicianUserId = ""
$apiKeyId = ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Person 3 - Automated Testing Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Create Admin User
Write-Host "[TEST 1] Creating Admin User..." -ForegroundColor Yellow
$adminBody = @{
    username = "admin_test_$(Get-Random)"
    password = "AdminPass123!"
    role = "Admin"
    isActive = $true
} | ConvertTo-Json

try {
    $adminResponse = Invoke-WebRequest -Uri "$baseUrl/api/users" `
        -Method POST `
        -ContentType "application/json" `
        -Body $adminBody
    
    $adminData = $adminResponse.Content | ConvertFrom-Json
    $adminUserId = $adminData.user._id
    Write-Host "✅ Admin created: $($adminData.user.username)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create admin: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test 2: Login as Admin
Write-Host "`n[TEST 2] Logging in as Admin..." -ForegroundColor Yellow
$loginBody = @{
    username = $adminData.user.username
    password = "AdminPass123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $adminToken = $loginData.token
    Write-Host "✅ Login successful. Token: $($adminToken.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Test 3: Create Technician User
Write-Host "`n[TEST 3] Creating Technician User..." -ForegroundColor Yellow
$techBody = @{
    username = "tech_test_$(Get-Random)"
    password = "TechPass123!"
    role = "Technician"
    isActive = $true
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

try {
    $techResponse = Invoke-WebRequest -Uri "$baseUrl/api/users" `
        -Method POST `
        -Headers $headers `
        -Body $techBody
    
    $techData = $techResponse.Content | ConvertFrom-Json
    $technicianUserId = $techData.user._id
    Write-Host "✅ Technician created: $($techData.user.username)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create technician: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Update User Role
Write-Host "`n[TEST 4] Updating User Role..." -ForegroundColor Yellow
$roleBody = @{
    role = "Admin"
} | ConvertTo-Json

try {
    $roleResponse = Invoke-WebRequest -Uri "$baseUrl/api/users/$technicianUserId/role" `
        -Method PATCH `
        -Headers $headers `
        -Body $roleBody
    
    $roleData = $roleResponse.Content | ConvertFrom-Json
    Write-Host "✅ Role updated to: $($roleData.user.role)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update role: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Test Invalid Role
Write-Host "`n[TEST 5] Testing Invalid Role (should fail)..." -ForegroundColor Yellow
$invalidRoleBody = @{
    role = "InvalidRole"
} | ConvertTo-Json

try {
    $invalidResponse = Invoke-WebRequest -Uri "$baseUrl/api/users/$technicianUserId/role" `
        -Method PATCH `
        -Headers $headers `
        -Body $invalidRoleBody
    
    Write-Host "❌ Invalid role was accepted (should have failed)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Invalid role correctly rejected with 400" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Got status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Test 6: Generate API Key
Write-Host "`n[TEST 6] Generating API Key..." -ForegroundColor Yellow
$keyBody = @{
    label = "Test Key $(Get-Random)"
} | ConvertTo-Json

try {
    $keyResponse = Invoke-WebRequest -Uri "$baseUrl/api/keys" `
        -Method POST `
        -Headers $headers `
        -Body $keyBody
    
    $keyData = $keyResponse.Content | ConvertFrom-Json
    $apiKeyId = $keyData._id
    $rawKey = $keyData.rawKey
    
    Write-Host "✅ API Key generated: $($rawKey.Substring(0, 15))..." -ForegroundColor Green
    Write-Host "   SAVE THIS KEY (shown only once): $rawKey" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to generate key: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: List API Keys
Write-Host "`n[TEST 7] Listing API Keys..." -ForegroundColor Yellow
try {
    $listResponse = Invoke-WebRequest -Uri "$baseUrl/api/keys" `
        -Method GET `
        -Headers $headers
    
    $keysList = $listResponse.Content | ConvertFrom-Json
    Write-Host "✅ Found $($keysList.Count) active key(s)" -ForegroundColor Green
    
    # Verify hashedKey is NOT returned
    if ($keysList[0].hashedKey) {
        Write-Host "⚠️ WARNING: hashedKey is exposed! Should be hidden." -ForegroundColor Yellow
    } else {
        Write-Host "✅ API key is properly hidden (hashedKey not returned)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to list keys: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Update User Status (Disable)
Write-Host "`n[TEST 8] Disabling User..." -ForegroundColor Yellow
$disableBody = @{
    isActive = $false
} | ConvertTo-Json

try {
    $disableResponse = Invoke-WebRequest -Uri "$baseUrl/api/users/$technicianUserId/status" `
        -Method PATCH `
        -Headers $headers `
        -Body $disableBody
    
    $disableData = $disableResponse.Content | ConvertFrom-Json
    Write-Host "✅ User disabled: $($disableData.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to disable user: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Test Disabled User Can't Login
Write-Host "`n[TEST 9] Testing Disabled User Login (should fail)..." -ForegroundColor Yellow
$disabledLoginBody = @{
    username = $techData.user.username
    password = "TechPass123!"
} | ConvertTo-Json

try {
    $disabledLoginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $disabledLoginBody
    
    Write-Host "❌ Disabled user was able to login (security issue!)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Disabled user correctly rejected with 401" -ForegroundColor Green
    } else {
        Write-Host "✅ Disabled user login failed" -ForegroundColor Green
    }
}

# Test 10: Test RBAC - Create User WITHOUT Authorization
Write-Host "`n[TEST 10] Testing RBAC (no token, should fail)..." -ForegroundColor Yellow
try {
    $rbacResponse = Invoke-WebRequest -Uri "$baseUrl/api/users" `
        -Method POST `
        -ContentType "application/json" `
        -Body $adminBody
    
    Write-Host "❌ Endpoint allowed without JWT (RBAC broken!)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ Endpoint correctly protected with 401/403" -ForegroundColor Green
    }
}

# Test 11: Revoke API Key
if ($apiKeyId) {
    Write-Host "`n[TEST 11] Revoking API Key..." -ForegroundColor Yellow
    try {
        $revokeResponse = Invoke-WebRequest -Uri "$baseUrl/api/keys/$apiKeyId" `
            -Method DELETE `
            -Headers $headers
        
        $revokeData = $revokeResponse.Content | ConvertFrom-Json
        Write-Host "✅ Key revoked: $($revokeData.message)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to revoke key: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 12: Re-enable User
Write-Host "`n[TEST 12] Re-enabling User..." -ForegroundColor Yellow
$enableBody = @{
    isActive = $true
} | ConvertTo-Json

try {
    $enableResponse = Invoke-WebRequest -Uri "$baseUrl/api/users/$technicianUserId/status" `
        -Method PATCH `
        -Headers $headers `
        -Body $enableBody
    
    $enableData = $enableResponse.Content | ConvertFrom-Json
    Write-Host "✅ User re-enabled: $($enableData.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to re-enable user: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 13: Verify Re-enabled User Can Login
Write-Host "`n[TEST 13] Testing Re-enabled User Login..." -ForegroundColor Yellow
try {
    $reenabledLoginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $disabledLoginBody
    
    $reenabledLoginData = $reenabledLoginResponse.Content | ConvertFrom-Json
    Write-Host "✅ Re-enabled user can login again" -ForegroundColor Green
} catch {
    Write-Host "❌ Re-enabled user still can't login: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "- Admin User: $($adminData.user.username)" -ForegroundColor White
Write-Host "- Technician User: $($techData.user.username)" -ForegroundColor White
Write-Host "- Admin Token: $($adminToken.Substring(0, 20))..." -ForegroundColor White
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Test UI pages at: http://localhost:3000/users" -ForegroundColor White
Write-Host "2. Test API keys UI at: http://localhost:3000/keys" -ForegroundColor White
Write-Host "3. Follow manual tests in PERSON3_TESTING_GUIDE.md" -ForegroundColor White
