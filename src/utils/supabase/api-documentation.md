# API Documentation

## Authentication Routes

### GET /api/user-role

Check the current user's role in the system.

**Response:**

```json
{
  "role": "vendor" | "company" | "none"
}
```

### GET /api/user-status

Check if the user has selected a role and get redirect URL.

**Response:**

```json
{
  "hasRole": true | false,
  "role": "vendor" | "company" | "none",
  "redirectUrl": "/vendor-dashboard" | "/company-dashboard" | "/role-selection"
}
```

## Vendor Routes

### GET /api/vendors

Fetch all active vendors.

**Response:**

```json
{
  "data": [
    /* array of vendor objects */
  ]
}
```

### POST /api/vendors

Create a new vendor profile.

**Request Body:**

```json
{
  "company_name": "string",
  "legal_name": "string",
  "vendor_type": "string",
  "industry_category": "string",
  "contact_person": "string",
  "email": "string",
  "phone": "string",
  "alternate_phone": "string",
  "address_line1": "string",
  "address_line2": "string",
  "city": "string",
  "state": "string",
  "pincode": "string",
  "pan_number": "string",
  "gst_number": "string",
  "tan_number": "string",
  "bank_name": "string",
  "bank_account_number": "string",
  "ifsc_code": "string",
  "branch_name": "string",
  "website": "string",
  "description": "string"
}
```

### GET /api/vendors/[id]

Fetch a specific vendor by ID.

**Response:**

```json
{
  "data": {
    /* vendor object */
  }
}
```

### PUT /api/vendors/[id]

Update a specific vendor by ID.

**Request Body:**

```json
{
  /* Partial vendor object with fields to update */
}
```

### POST /api/vendors/[id]/approve

Approve a vendor (admin only).

**Response:**

```json
{
  "data": {
    /* updated vendor object */
  }
}
```

### POST /api/vendors/[id]/reject

Reject a vendor (admin only).

**Response:**

```json
{
  "data": {
    /* updated vendor object */
  }
}
```

### GET /api/vendors/search?q=query

Search vendors by company name or GST number.

**Response:**

```json
{
  "data": [
    /* array of matching vendor objects */
  ]
}
```

## Company Contact Routes

### GET /api/company-contacts

Fetch all active company contacts.

**Response:**

```json
{
  "data": [
    /* array of company contact objects */
  ]
}
```

### POST /api/company-contacts

Create a new company contact profile.

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "company_name": "string",
  "designation": "string"
}
```

### GET /api/company-contacts/[id]

Fetch a specific company contact by ID.

**Response:**

```json
{
  "data": {
    /* company contact object */
  }
}
```

### PUT /api/company-contacts/[id]

Update a specific company contact by ID.

**Request Body:**

```json
{
  /* Partial company contact object with fields to update */
}
```

### POST /api/company-contacts/[id]/approve

Approve a company contact (admin only).

**Response:**

```json
{
  "data": {
    /* updated company contact object */
  }
}
```

### POST /api/company-contacts/[id]/reject

Reject a company contact (admin only).

**Response:**

```json
{
  "data": {
    /* updated company contact object */
  }
}
```

### GET /api/company-contacts/search?q=query

Search company contacts by name or company name.

**Response:**

```json
{
  "data": [
    /* array of matching company contact objects */
  ]
}
```

## GST Validation Routes

### POST /api/gst-validation

Validate a GST number and fetch business details.

**Request Body:**

```json
{
  "gstNumber": "string"
}
```

**Response:**

```json
{
  "data": {
    "gstin": "string",
    "businessName": "string",
    "tradeName": "string",
    "constitutionOfBusiness": "string",
    "address": {
      "building": "string",
      "street": "string",
      "city": "string",
      "state": "string",
      "pincode": "string"
    },
    "status": "string",
    "taxpayerType": "string",
    "dateOfRegistration": "string",
    "dateOfCancellation": "string|null",
    "stateJurisdiction": "string",
    "centerJurisdiction": "string",
    "businessActivities": [
      {
        "principalBusinessActivity": "string",
        "dateOfCommencement": "string"
      }
    ]
  }
}
```

### POST /api/business-details

Fetch business details using GST number (alternative endpoint).

**Request Body:**

```json
{
  "gstNumber": "string"
}
```

**Response:**

```json
{
  "data": {
    /* Same structure as gst-validation response */
  }
}
```
