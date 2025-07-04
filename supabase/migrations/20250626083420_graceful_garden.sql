/*
  # Create Sample Questionnaires

  Create dynamic questionnaires for different services, industries, and countries
  based on the requirements document specifications.
*/

-- Create questionnaires for Documentation Services
INSERT INTO questionnaires (service_id, industry_id, country_id, title, description, questions, conditional_logic) 
SELECT 
  s.id,
  i.id,
  c.id,
  'Business Plan Questionnaire for ' || i.name || ' in ' || c.name,
  'Comprehensive questionnaire to gather business information for creating a professional business plan',
  CASE 
    WHEN i.name = 'Agriculture' THEN '[
      {
        "id": "business_name",
        "type": "text",
        "question": "What is your business name?",
        "required": true
      },
      {
        "id": "crop_types", 
        "type": "multiselect",
        "question": "What types of crops do you plan to grow?",
        "options": ["Rice", "Vegetables", "Fruits", "Herbs", "Other"],
        "required": true
      },
      {
        "id": "farm_size",
        "type": "number", 
        "question": "What is the size of your farm (in hectares)?",
        "required": true
      },
      {
        "id": "export_markets",
        "type": "multiselect",
        "question": "Which countries do you plan to export to?",
        "options": ["Singapore", "Malaysia", "Thailand", "Japan", "Other"],
        "required": false
      },
      {
        "id": "organic_certified",
        "type": "boolean",
        "question": "Do you plan to get organic certification?",
        "required": true
      },
      {
        "id": "funding_amount",
        "type": "number",
        "question": "How much funding are you seeking (in SGD)?",
        "required": true
      }
    ]'
    WHEN i.name = 'Manufacturing' THEN '[
      {
        "id": "business_name",
        "type": "text", 
        "question": "What is your business name?",
        "required": true
      },
      {
        "id": "production_capacity",
        "type": "number",
        "question": "What is your planned monthly production capacity?",
        "required": true
      },
      {
        "id": "hsn_codes",
        "type": "text",
        "question": "What are the HSN codes for your products?",
        "required": true
      },
      {
        "id": "quality_standards",
        "type": "multiselect",
        "question": "Which quality standards do you plan to comply with?",
        "options": ["ISO 9001", "ISO 14001", "CE Marking", "FDA", "Other"],
        "required": true
      },
      {
        "id": "export_countries", 
        "type": "multiselect",
        "question": "Which countries do you plan to export to?",
        "options": ["Singapore", "Malaysia", "USA", "Europe", "Other"],
        "required": false
      },
      {
        "id": "funding_amount",
        "type": "number",
        "question": "How much funding are you seeking (in SGD)?",
        "required": true
      }
    ]'
    ELSE '[
      {
        "id": "business_name",
        "type": "text",
        "question": "What is your business name?", 
        "required": true
      },
      {
        "id": "business_model",
        "type": "textarea",
        "question": "Describe your business model",
        "required": true
      },
      {
        "id": "target_market",
        "type": "textarea", 
        "question": "Who is your target market?",
        "required": true
      },
      {
        "id": "funding_amount",
        "type": "number",
        "question": "How much funding are you seeking (in SGD)?",
        "required": true
      }
    ]'
  END::jsonb,
  CASE 
    WHEN c.name = 'Singapore' THEN '{
      "acra_registration": {
        "trigger": "business_name",
        "show_when": "not_empty",
        "questions": [
          {
            "id": "acra_number",
            "type": "text", 
            "question": "Do you have an existing ACRA registration number?",
            "required": false
          }
        ]
      }
    }'
    ELSE '{}'
  END::jsonb
FROM services s
CROSS JOIN industries i  
CROSS JOIN countries c
WHERE s.name = 'Project Report / Business Plan'
  AND s.category = 'Documentation';

-- Create questionnaire for KYC Documentation
INSERT INTO questionnaires (service_id, title, description, questions)
SELECT 
  s.id,
  'KYC Documentation Questionnaire',
  'Questionnaire to gather required documents and information for KYC compliance',
  '[
    {
      "id": "entity_type",
      "type": "select", 
      "question": "What type of entity are you registering?",
      "options": ["Private Limited Company", "LLP", "Sole Proprietorship", "Branch Office"],
      "required": true
    },
    {
      "id": "beneficial_owners",
      "type": "number",
      "question": "How many beneficial owners does the company have?",
      "required": true
    },
    {
      "id": "directors_count",
      "type": "number", 
      "question": "How many directors will the company have?",
      "required": true
    },
    {
      "id": "bank_preference",
      "type": "multiselect",
      "question": "Which banks are you considering for account opening?",
      "options": ["DBS", "OCBC", "UOB", "Standard Chartered", "HSBC", "Other"],
      "required": false
    },
    {
      "id": "business_activities",
      "type": "textarea",
      "question": "Describe your main business activities",
      "required": true
    }
  ]'::jsonb
FROM services s
WHERE s.name = 'KYC Documentation Preparation';

-- Create questionnaire for Trade Lead Services  
INSERT INTO questionnaires (service_id, title, description, questions)
SELECT
  s.id,
  'Trade Lead Sourcing Questionnaire', 
  'Questionnaire to identify trade lead requirements and HSN codes',
  '[
    {
      "id": "product_name",
      "type": "text",
      "question": "What product are you looking to trade?",
      "required": true
    },
    {
      "id": "hsn_code",
      "type": "text", 
      "question": "What is the 8-digit HSN code for your product?",
      "required": true
    },
    {
      "id": "trade_type",
      "type": "select",
      "question": "Are you looking for buyers or sellers?",
      "options": ["Buyers", "Sellers", "Both"],
      "required": true
    },
    {
      "id": "target_countries",
      "type": "multiselect",
      "question": "Which countries are you interested in trading with?",
      "options": ["Singapore", "Malaysia", "Thailand", "India", "China", "USA", "Europe", "Other"],
      "required": true
    },
    {
      "id": "volume_requirements",
      "type": "textarea",
      "question": "What are your volume requirements (monthly/annual)?",
      "required": true
    },
    {
      "id": "quality_specifications",
      "type": "textarea",
      "question": "What are your quality specifications or standards?", 
      "required": false
    }
  ]'::jsonb
FROM services s
WHERE s.name = 'Sourcing Buy/Sell Lead Services';

-- Create questionnaire for Website Design
INSERT INTO questionnaires (service_id, title, description, questions)
SELECT
  s.id,
  'Website Design Requirements',
  'Questionnaire to gather website design and functionality requirements',
  '[
    {
      "id": "website_purpose",
      "type": "multiselect",
      "question": "What is the primary purpose of your website?",
      "options": ["Company Profile", "E-commerce", "Portfolio", "Blog", "Lead Generation"],
      "required": true
    },
    {
      "id": "preferred_colors",
      "type": "text",
      "question": "Do you have preferred colors or brand guidelines?", 
      "required": false
    },
    {
      "id": "content_ready",
      "type": "boolean",
      "question": "Do you have content (text, images) ready for the website?",
      "required": true
    },
    {
      "id": "special_features",
      "type": "multiselect", 
      "question": "What special features do you need?",
      "options": ["Contact Forms", "Online Chat", "Social Media Integration", "Google Maps", "Photo Gallery"],
      "required": false
    },
    {
      "id": "domain_preference",
      "type": "text",
      "question": "Do you have a preferred domain name?",
      "required": false
    }
  ]'::jsonb
FROM services s  
WHERE s.name = 'Website Design';