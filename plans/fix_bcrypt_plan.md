# Fix bcrypt password hashing issue

## Issues Identified:
1. **Bcrypt password hashing error**: `ValueError: password cannot be longer than 72 bytes`
   - The current `get_password_hash` function truncates bytes then decodes back to string
   - When decoding with `errors='ignore'`, incomplete multi-byte UTF-8 characters at the boundary are silently dropped
   - This can result in a string shorter than 72 characters, and then when bcrypt re-encodes it, the resulting bytes can exceed 72 bytes

2. **CORS error**: Origin blocking from localhost:5173 to localhost:8000
   - The CORS middleware is configured but might need adjustment

## Plan:

### Step 1: Fix the password hashing functions in `app/api.py`

Current problematic code:
```python
def get_password_hash(password):
    password_bytes = password.encode('utf-8')
    truncated_bytes = password_bytes[:72]
    truncated_password = truncated_bytes.decode('utf-8', errors='ignore')
    return pwd_context.hash(truncated_password)
```

Fix: Truncate the string directly to 72 characters:
```python
def get_password_hash(password):
    # Truncate to 72 characters to comply with bcrypt limit
    truncated_password = password[:72]
    return pwd_context.hash(truncated_password)
```

Also update `verify_password` to truncate the plain password:
```python
def verify_password(plain_password, hashed_password):
    # Truncate to 72 characters to match the hashing
    truncated_password = plain_password[:72]
    return pwd_context.verify(truncated_password, hashed_password)
```

### Step 2: Update requirements.txt
Add or update `bcrypt` package to ensure compatibility with passlib.

## Files to Edit:
1. `/home/vincent/kaisang_ai/app/api.py` - Fix password hashing functions
2. `/home/vincent/kaisang_ai/requirements.txt` - Ensure bcrypt is included

## Testing:
After fixing:
1. Restart the backend server
2. Try to register a new user
3. Verify that the registration works without the 500 error

