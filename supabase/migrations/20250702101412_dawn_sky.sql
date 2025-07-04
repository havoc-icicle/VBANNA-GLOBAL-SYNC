/*
  # Add onboarding questionnaire system

  1. User Table Updates
    - Add onboarding_status to track user onboarding state
    
  2. Comprehensive Business Plan Questionnaire
    - Insert the detailed 90-question business plan questionnaire
    - Structured with proper question types and conditional logic
    
  3. Security
    - Maintain existing RLS policies
*/

-- Add onboarding status to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'pending';

-- Create comprehensive business plan questionnaire
INSERT INTO questionnaires (
  service_id,
  title,
  description,
  questions,
  conditional_logic,
  is_active,
  version
)
SELECT
  s.id,
  'Business Plan Consultancy Questionnaire',
  'Complete this questionnaire to help us create a tailored business plan with detailed financial projections, market analysis, regulatory compliance checklists, and SWOT analysis.',
  '[
    {
      "id": "business_name",
      "type": "text",
      "question": "What is the name of your business?",
      "required": true,
      "section": "Business Basics"
    },
    {
      "id": "business_location", 
      "type": "text",
      "question": "Where is your business located?",
      "required": true,
      "section": "Business Basics"
    },
    {
      "id": "legal_structure",
      "type": "select",
      "question": "What is the legal structure of your business?",
      "options": ["Sole Proprietorship", "LLC", "Corporation", "Partnership", "Other"],
      "required": true,
      "section": "Business Basics"
    },
    {
      "id": "products_services",
      "type": "textarea",
      "question": "What products or services does your business offer?",
      "required": true,
      "section": "Business Basics"
    },
    {
      "id": "business_description",
      "type": "textarea",
      "question": "Please provide a brief description of your business (1-2 sentences).",
      "required": true,
      "section": "Business Basics"
    },
    {
      "id": "market_opportunity",
      "type": "textarea",
      "question": "What is the market opportunity or problem your business addresses?",
      "required": true,
      "section": "Business Basics"
    },
    {
      "id": "mission_statement",
      "type": "textarea",
      "question": "What is your mission statement?",
      "required": false,
      "section": "Business Basics"
    },
    {
      "id": "vision_statement",
      "type": "textarea",
      "question": "What is your vision statement?",
      "required": false,
      "section": "Business Basics"
    },
    {
      "id": "customer_roi",
      "type": "textarea",
      "question": "What is the return on investment (ROI) for your customers?",
      "required": false,
      "section": "Business Basics"
    },
    {
      "id": "investor_interest",
      "type": "textarea",
      "question": "Why should investors be interested in your business?",
      "required": true,
      "section": "Business Basics"
    },
    {
      "id": "value_proposition",
      "type": "textarea",
      "question": "What is your unique value proposition?",
      "required": true,
      "section": "Business Basics"
    },
    {
      "id": "target_customers",
      "type": "textarea",
      "question": "Who are your target customers? (Please specify if there are multiple segments)",
      "required": true,
      "section": "Market Analysis"
    },
    {
      "id": "customer_needs",
      "type": "textarea",
      "question": "What are the needs and preferences of your target customers?",
      "required": true,
      "section": "Market Analysis"
    },
    {
      "id": "market_size",
      "type": "textarea",
      "question": "What is the size of your target market? (Please provide estimates for each segment if applicable)",
      "required": true,
      "section": "Market Analysis"
    },
    {
      "id": "main_competitors",
      "type": "textarea",
      "question": "Who are your main competitors? (Please list)",
      "required": true,
      "section": "Market Analysis"
    },
    {
      "id": "indirect_competitors",
      "type": "textarea",
      "question": "Who are your indirect competitors? (Please list)",
      "required": false,
      "section": "Market Analysis"
    },
    {
      "id": "competitive_advantages",
      "type": "textarea",
      "question": "What features or offerings differentiate your business from competitors?",
      "required": true,
      "section": "Market Analysis"
    },
    {
      "id": "multiple_markets",
      "type": "boolean",
      "question": "Do you have different target activities or markets?",
      "required": true,
      "section": "Market Analysis"
    },
    {
      "id": "multiple_markets_details",
      "type": "textarea",
      "question": "Please list your different target activities or markets and provide separate information for each.",
      "required": false,
      "section": "Market Analysis",
      "conditional": "multiple_markets"
    },
    {
      "id": "pricing_strategy",
      "type": "textarea",
      "question": "What is your pricing strategy?",
      "required": true,
      "section": "Products and Services"
    },
    {
      "id": "revenue_model",
      "type": "select",
      "question": "What is your revenue model?",
      "options": ["One-time sales", "Subscription", "Commission", "Advertising", "Freemium", "Other"],
      "required": true,
      "section": "Products and Services"
    },
    {
      "id": "multiple_products",
      "type": "boolean",
      "question": "Do you have multiple products or services?",
      "required": true,
      "section": "Products and Services"
    },
    {
      "id": "products_list",
      "type": "textarea",
      "question": "Please list your products/services and indicate if you need separate financial projections for each.",
      "required": false,
      "section": "Products and Services",
      "conditional": "multiple_products"
    },
    {
      "id": "marketing_channels",
      "type": "multiselect",
      "question": "What marketing channels are you currently using?",
      "options": ["Social Media", "Email Marketing", "Content Marketing", "SEO", "Paid Advertising", "Traditional Media", "Direct Sales", "Partnerships", "Other"],
      "required": true,
      "section": "Marketing and Sales"
    },
    {
      "id": "marketing_effectiveness",
      "type": "textarea",
      "question": "How do you measure the effectiveness of your marketing?",
      "required": false,
      "section": "Marketing and Sales"
    },
    {
      "id": "sales_goals",
      "type": "number",
      "question": "What are your sales goals for the upcoming year? (in your local currency)",
      "required": true,
      "section": "Marketing and Sales"
    },
    {
      "id": "sales_strategy",
      "type": "textarea",
      "question": "What is your sales strategy?",
      "required": true,
      "section": "Marketing and Sales"
    },
    {
      "id": "key_metrics",
      "type": "multiselect",
      "question": "What key performance indicators (KPIs) will you use to evaluate success?",
      "options": ["Revenue Growth", "Customer Acquisition Cost", "Customer Lifetime Value", "Conversion Rate", "Market Share", "Profit Margin", "Other"],
      "required": true,
      "section": "Marketing and Sales"
    },
    {
      "id": "operational_processes",
      "type": "textarea",
      "question": "What are your key operational processes?",
      "required": true,
      "section": "Operations"
    },
    {
      "id": "technology_tools",
      "type": "textarea",
      "question": "What technology or tools do you use in your operations, including any AI or digital platforms?",
      "required": false,
      "section": "Operations"
    },
    {
      "id": "operational_challenges",
      "type": "textarea",
      "question": "What are the major operational challenges you face?",
      "required": false,
      "section": "Operations"
    },
    {
      "id": "scaling_plan",
      "type": "textarea",
      "question": "What is your plan for scaling your operations?",
      "required": true,
      "section": "Operations"
    },
    {
      "id": "current_financial_status",
      "type": "textarea",
      "question": "What is your current financial status (revenue, profit, cash flow)?",
      "required": true,
      "section": "Financial Planning"
    },
    {
      "id": "projected_financials",
      "type": "number",
      "question": "What are your projected revenues for the next year? (in your local currency)",
      "required": true,
      "section": "Financial Planning"
    },
    {
      "id": "financial_assumptions",
      "type": "textarea",
      "question": "What are the underlying assumptions for your financial projections (e.g., sales growth rate, cost of goods sold percentage)?",
      "required": true,
      "section": "Financial Planning"
    },
    {
      "id": "break_even_calculated",
      "type": "boolean",
      "question": "Have you calculated your break-even point?",
      "required": true,
      "section": "Financial Planning"
    },
    {
      "id": "break_even_details",
      "type": "textarea",
      "question": "Please provide your break-even analysis details.",
      "required": false,
      "section": "Financial Planning",
      "conditional": "break_even_calculated"
    },
    {
      "id": "sensitivity_analysis",
      "type": "boolean",
      "question": "Do you want to include sensitivity analysis in your financial model?",
      "required": true,
      "section": "Financial Planning"
    },
    {
      "id": "sensitivity_variables",
      "type": "multiselect",
      "question": "What variables do you want to test in sensitivity analysis?",
      "options": ["Sales Volume", "Pricing", "Operating Costs", "Market Size", "Competition", "Other"],
      "required": false,
      "section": "Financial Planning",
      "conditional": "sensitivity_analysis"
    },
    {
      "id": "funding_sources",
      "type": "multiselect",
      "question": "What are your primary funding sources?",
      "options": ["Personal Savings", "Friends & Family", "Angel Investors", "Venture Capital", "Bank Loans", "Government Grants", "Crowdfunding", "Other"],
      "required": true,
      "section": "Financial Planning"
    },
    {
      "id": "financial_risk_management",
      "type": "textarea",
      "question": "What is your plan for managing financial risks?",
      "required": false,
      "section": "Financial Planning"
    },
    {
      "id": "projection_timeframe",
      "type": "select",
      "question": "For financial projections, what time frame are you considering?",
      "options": ["1 year", "3 years", "5 years", "Other"],
      "required": true,
      "section": "Financial Planning"
    },
    {
      "id": "projection_detail",
      "type": "select",
      "question": "How detailed do you want the financial projections to be?",
      "options": ["Monthly", "Quarterly", "Annually"],
      "required": true,
      "section": "Financial Planning"
    },
    {
      "id": "current_employees",
      "type": "number",
      "question": "How many employees do you currently have?",
      "required": true,
      "section": "Human Resources"
    },
    {
      "id": "management_team_size",
      "type": "number",
      "question": "How large is your management team?",
      "required": true,
      "section": "Human Resources"
    },
    {
      "id": "hiring_plan",
      "type": "textarea",
      "question": "What is your hiring plan for the next year?",
      "required": false,
      "section": "Human Resources"
    },
    {
      "id": "key_roles_needed",
      "type": "textarea",
      "question": "What key roles do you need to fill to achieve your goals?",
      "required": false,
      "section": "Human Resources"
    },
    {
      "id": "employee_development",
      "type": "textarea",
      "question": "What is your plan for employee development and retention?",
      "required": false,
      "section": "Human Resources"
    },
    {
      "id": "operating_legal_structure",
      "type": "text",
      "question": "What is your operating legal structure?",
      "required": true,
      "section": "Legal and Compliance"
    },
    {
      "id": "industry_regulations",
      "type": "textarea",
      "question": "What industry-specific regulations and compliance requirements apply to your business?",
      "required": true,
      "section": "Legal and Compliance"
    },
    {
      "id": "legal_risk_management",
      "type": "textarea",
      "question": "What is your plan for managing legal risks?",
      "required": false,
      "section": "Legal and Compliance"
    },
    {
      "id": "insurance_policies",
      "type": "textarea",
      "question": "What insurance policies do you have in place?",
      "required": false,
      "section": "Legal and Compliance"
    },
    {
      "id": "operating_countries",
      "type": "multiselect",
      "question": "In which countries do you plan to operate?",
      "options": ["Singapore", "Malaysia", "Thailand", "Indonesia", "Philippines", "Vietnam", "USA", "UK", "Australia", "Other"],
      "required": true,
      "section": "Legal and Compliance"
    },
    {
      "id": "compliance_requirements",
      "type": "textarea",
      "question": "For each country, please list the specific regulations and compliance requirements you are aware of, or need help with.",
      "required": false,
      "section": "Legal and Compliance"
    },
    {
      "id": "compliance_assistance",
      "type": "select",
      "question": "Do you need a compliance checklist, or do you need the consultancy to handle the compliance process?",
      "options": ["Compliance checklist only", "Full compliance handling", "Both", "Not sure"],
      "required": true,
      "section": "Legal and Compliance"
    },
    {
      "id": "business_strengths",
      "type": "textarea",
      "question": "What are the strengths of your business?",
      "required": true,
      "section": "SWOT Analysis"
    },
    {
      "id": "business_weaknesses",
      "type": "textarea",
      "question": "What are the weaknesses of your business?",
      "required": true,
      "section": "SWOT Analysis"
    },
    {
      "id": "market_opportunities",
      "type": "textarea",
      "question": "What market opportunities do you see?",
      "required": true,
      "section": "SWOT Analysis"
    },
    {
      "id": "potential_threats",
      "type": "textarea",
      "question": "What potential threats do you face?",
      "required": true,
      "section": "SWOT Analysis"
    },
    {
      "id": "strategic_priorities",
      "type": "textarea",
      "question": "What are your top 3 strategic priorities for the next year?",
      "required": true,
      "section": "Strategic Planning"
    },
    {
      "id": "priority_milestones",
      "type": "textarea",
      "question": "What milestones will you set for these priorities?",
      "required": true,
      "section": "Strategic Planning"
    },
    {
      "id": "resources_needed",
      "type": "textarea",
      "question": "What resources do you need to achieve your goals?",
      "required": true,
      "section": "Strategic Planning"
    },
    {
      "id": "success_measurement",
      "type": "textarea",
      "question": "How will you measure the success of your strategy?",
      "required": true,
      "section": "Strategic Planning"
    },
    {
      "id": "emerging_technologies",
      "type": "multiselect",
      "question": "Are there any emerging technologies or trends you plan to incorporate into your business strategy?",
      "options": ["Artificial Intelligence", "Machine Learning", "Blockchain", "IoT", "Sustainability", "Green Technology", "Remote Work Tools", "Other"],
      "required": false,
      "section": "Strategic Planning"
    },
    {
      "id": "sustainability_approach",
      "type": "textarea",
      "question": "What is your approach to sustainability and environmental responsibility in your business operations?",
      "required": false,
      "section": "Strategic Planning"
    },
    {
      "id": "business_plan_sections",
      "type": "multiselect",
      "question": "What specific sections of the business plan do you need help with?",
      "options": ["Executive Summary", "Company Description", "Market Analysis", "Marketing Strategy", "Operational Plan", "Financial Projections", "Management Team", "Funding Request"],
      "required": true,
      "section": "Business Plan Specifics"
    },
    {
      "id": "existing_documents",
      "type": "boolean",
      "question": "Do you have any existing documents or data that can be used in the business plan?",
      "required": true,
      "section": "Business Plan Specifics"
    },
    {
      "id": "existing_documents_list",
      "type": "textarea",
      "question": "Please list the existing documents or data you have (e.g., market research, financial statements).",
      "required": false,
      "section": "Business Plan Specifics",
      "conditional": "existing_documents"
    },
    {
      "id": "completion_timeline",
      "type": "select",
      "question": "What is your timeline for completing the business plan?",
      "options": ["Within 1 week", "Within 2 weeks", "Within 1 month", "More than 1 month", "Flexible"],
      "required": true,
      "section": "Business Plan Specifics"
    },
    {
      "id": "service_budget",
      "type": "select",
      "question": "What is your budget for purchasing this service?",
      "options": ["Under $1,000", "$1,000 - $2,500", "$2,500 - $5,000", "$5,000 - $10,000", "Above $10,000"],
      "required": true,
      "section": "Business Plan Specifics"
    },
    {
      "id": "plan_type",
      "type": "select",
      "question": "Are you looking for a full business plan, or are you interested in specific components?",
      "options": ["Full business plan", "Financial projections only", "Market analysis only", "Executive summary only", "Custom components"],
      "required": true,
      "section": "Business Plan Specifics"
    },
    {
      "id": "pitch_assistance",
      "type": "boolean",
      "question": "Do you need assistance with pitching to investors or lenders?",
      "required": true,
      "section": "Business Plan Specifics"
    },
    {
      "id": "previous_consultant",
      "type": "boolean",
      "question": "Have you previously worked with a business consultant?",
      "required": true,
      "section": "Client Background and Goals"
    },
    {
      "id": "consultant_experience",
      "type": "textarea",
      "question": "Please describe your previous experience with business consultants.",
      "required": false,
      "section": "Client Background and Goals",
      "conditional": "previous_consultant"
    },
    {
      "id": "industry_experience",
      "type": "textarea",
      "question": "What is your experience in the industry?",
      "required": true,
      "section": "Client Background and Goals"
    },
    {
      "id": "long_term_goals",
      "type": "textarea",
      "question": "What are your long-term goals for the business?",
      "required": true,
      "section": "Client Background and Goals"
    },
    {
      "id": "business_plan_purpose",
      "type": "multiselect",
      "question": "Why do you need a business plan at this stage?",
      "options": ["Seeking funding", "Strategic planning", "Partnership opportunities", "Internal planning", "Loan application", "Other"],
      "required": true,
      "section": "Client Background and Goals"
    },
    {
      "id": "preferred_format",
      "type": "multiselect",
      "question": "What format do you prefer for the business plan?",
      "options": ["PDF document", "Word document", "PowerPoint presentation", "Interactive dashboard", "Other"],
      "required": true,
      "section": "Delivery and Format"
    },
    {
      "id": "target_audience",
      "type": "multiselect",
      "question": "Do you need the business plan to be tailored for a specific audience?",
      "options": ["Investors", "Banks", "Internal use", "Partners", "Government agencies", "Other"],
      "required": true,
      "section": "Delivery and Format"
    },
    {
      "id": "design_requirements",
      "type": "textarea",
      "question": "Are there any specific design or branding requirements for the document?",
      "required": false,
      "section": "Delivery and Format"
    },
    {
      "id": "information_commitment",
      "type": "boolean",
      "question": "Are you prepared to provide all necessary information and data required for the business plan?",
      "required": true,
      "section": "Preparation and Commitment"
    },
    {
      "id": "completion_deadline",
      "type": "boolean",
      "question": "Do you have a specific deadline by which you need the business plan completed?",
      "required": true,
      "section": "Preparation and Commitment"
    },
    {
      "id": "deadline_date",
      "type": "date",
      "question": "Please specify your deadline date.",
      "required": false,
      "section": "Preparation and Commitment",
      "conditional": "completion_deadline"
    }
  ]'::jsonb,
  '{
    "multiple_markets": {
      "trigger_question": "multiple_markets",
      "show_when": "true",
      "dependent_questions": ["multiple_markets_details"]
    },
    "multiple_products": {
      "trigger_question": "multiple_products", 
      "show_when": "true",
      "dependent_questions": ["products_list"]
    },
    "break_even_calculated": {
      "trigger_question": "break_even_calculated",
      "show_when": "true", 
      "dependent_questions": ["break_even_details"]
    },
    "sensitivity_analysis": {
      "trigger_question": "sensitivity_analysis",
      "show_when": "true",
      "dependent_questions": ["sensitivity_variables"]
    },
    "existing_documents": {
      "trigger_question": "existing_documents",
      "show_when": "true",
      "dependent_questions": ["existing_documents_list"]
    },
    "previous_consultant": {
      "trigger_question": "previous_consultant", 
      "show_when": "true",
      "dependent_questions": ["consultant_experience"]
    },
    "completion_deadline": {
      "trigger_question": "completion_deadline",
      "show_when": "true",
      "dependent_questions": ["deadline_date"]
    }
  }'::jsonb,
  true,
  1
FROM services s
WHERE s.name = 'Project Report / Business Plan'
LIMIT 1;

-- Update existing admin user onboarding status
UPDATE users SET onboarding_status = 'completed' WHERE role = 'Admin';