# Plan to Fix CORS Error on Registration

## Problem Analysis
The error messages show:
1. **CORS Policy Error**: Requests from `http://localhost:5173` to `http://localhost:8000/auth/register` are being blocked
2. **500 Internal Server Error**: The registration endpoint is failing

## Root Causes
1. **CORS Configuration Issue**: The CORS middleware may not be properly configured to handle preflight OPTIONS requests
2. **Origin Mismatch**: The configured allowed origins might not be matching the actual request origin
3. **Missing CORS Headers**: The server is not returning proper CORS headers

## Solution Plan

### Step 1: Fix CORS Configuration in api.py
Modify the CORS middleware configuration to:
1. Use `["*"]` for allow_origins to accept all origins during development (simpler and more reliable)
2. Ensure the middleware is properly set up

### Step 2: Verify CORS Middleware is Applied
Ensure the CORS middleware is correctly configured and positioned in the application setup.

## Files to Edit
- `/home/vincent/kaisang_ai/app/api.py` - Update CORS configuration

## Implementation Details
Change the CORS configuration from:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

To:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,  # Cannot use credentials with wildcard origin
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Or keep credentials if using specific origins (but ensure they match exactly):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5175", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Expected Outcome
After this fix, the registration request should:
1. Pass the CORS preflight check (OPTIONS request)
2. Successfully process the POST request to `/auth/register`
3. Return a proper response with access_token

