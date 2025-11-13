# Database Schema Documentation

## Company Contacts Table

This table stores information about company representatives who are not vendors but need access to the system.

```sql
-- Create company_contacts table for storing company contact information
CREATE TABLE company_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company_name VARCHAR(255) NOT NULL,
  designation VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending_approval',
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for better query performance
CREATE INDEX idx_company_contacts_user_id ON company_contacts(user_id);
CREATE INDEX idx_company_contacts_email ON company_contacts(email);
CREATE INDEX idx_company_contacts_company_name ON company_contacts(company_name);
CREATE INDEX idx_company_contacts_status ON company_contacts(status);

-- Enable Row Level Security
ALTER TABLE company_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for row level security
CREATE POLICY "Users can view their own company contact info" ON company_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company contact info" ON company_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company contact info" ON company_contacts
  FOR UPDATE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON TABLE company_contacts TO authenticated;
```

## Vendor Table

The vendor table stores information about registered vendors in the system.

```sql
-- Note: The vendor table schema is already implemented in the existing system
-- This is just for reference
CREATE TABLE vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  vendor_type VARCHAR(100),
  industry_category VARCHAR(100),
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  alternate_phone VARCHAR(20),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  country VARCHAR(100) DEFAULT 'India',
  pan_number VARCHAR(10),
  gst_number VARCHAR(15),
  tan_number VARCHAR(10),
  bank_name VARCHAR(255),
  bank_account_number VARCHAR(50),
  ifsc_code VARCHAR(11),
  branch_name VARCHAR(255),
  pan_document_url TEXT,
  gst_document_url TEXT,
  incorporation_document_url TEXT,
  address_proof_document_url TEXT,
  status VARCHAR(50) DEFAULT 'pending_approval',
  is_active BOOLEAN DEFAULT true,
  website VARCHAR(255),
  description TEXT
);
```
