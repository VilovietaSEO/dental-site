-- Create contacts table for general inquiries
CREATE TABLE contacts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  form_type TEXT DEFAULT 'general',
  urgency TEXT DEFAULT 'normal',
  ticket_id TEXT UNIQUE NOT NULL,
  metadata JSONB,
  status TEXT DEFAULT 'new',
  ip_address TEXT,
  user_agent TEXT
);

-- Create appointments table
CREATE TABLE appointments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmation_number TEXT UNIQUE NOT NULL,
  
  -- Patient Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  
  -- Appointment Details
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  alternate_date DATE,
  alternate_time TIME,
  service_type TEXT NOT NULL,
  is_new_patient BOOLEAN DEFAULT true,
  
  -- Insurance Information
  has_insurance BOOLEAN DEFAULT false,
  insurance_provider TEXT,
  insurance_member_id TEXT,
  
  -- Additional Info
  special_needs TEXT,
  referral_source TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending',
  metadata JSONB
);

-- Create quiz_submissions table
CREATE TABLE quiz_submissions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT NOT NULL,
  
  -- Quiz Results
  quiz_score INTEGER NOT NULL,
  health_profile TEXT NOT NULL,
  risk_level TEXT,
  recommendations JSONB,
  
  -- Marketing
  marketing_consent BOOLEAN DEFAULT false,
  lead_score INTEGER,
  
  -- Metadata
  quiz_answers JSONB,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);
CREATE INDEX idx_contacts_status ON contacts(status);

CREATE INDEX idx_appointments_email ON appointments(email);
CREATE INDEX idx_appointments_preferred_date ON appointments(preferred_date);
CREATE INDEX idx_appointments_status ON appointments(status);

CREATE INDEX idx_quiz_email ON quiz_submissions(email);
CREATE INDEX idx_quiz_created_at ON quiz_submissions(created_at);
CREATE INDEX idx_quiz_lead_score ON quiz_submissions(lead_score);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)
-- Allow service role full access
CREATE POLICY "Service role can manage contacts" ON contacts
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage appointments" ON appointments
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage quiz submissions" ON quiz_submissions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow anon users to insert (for form submissions)
CREATE POLICY "Anyone can submit contact form" ON contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can book appointment" ON appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can submit quiz" ON quiz_submissions
  FOR INSERT WITH CHECK (true);