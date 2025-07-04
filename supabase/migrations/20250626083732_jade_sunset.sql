/*
  # Create sample reports

  1. New Data
    - Service progress reports for all orders
    - Financial report with revenue analytics
    - Trade lead report with market analysis
    - Compliance report for all jurisdictions
    - Marketing analytics report with performance metrics

  2. Security
    - Reports follow existing RLS policies
    - Only admins can view financial and compliance reports
    - Users can view their own service progress and trade lead reports
*/

-- Create service progress reports for each order
INSERT INTO reports (
  report_type,
  title,
  description,
  generated_by,
  order_id,
  filters,
  data,
  format,
  status,
  generated_at,
  expires_at
)
SELECT 
  'service_progress',
  'Service Progress Report - ' || s.name,
  'Detailed progress report for ' || s.name || ' service delivery',
  u.id,
  o.id,
  jsonb_build_object(
    'date_range', '2025-01-01 to 2025-01-31',
    'service_type', s.category,
    'status', o.status
  ),
  jsonb_build_object(
    'milestones', jsonb_build_array(
      jsonb_build_object(
        'name', 'Requirements Gathering',
        'status', 'completed',
        'completion_date', (o.created_at + interval '1 day')::text
      ),
      jsonb_build_object(
        'name', 'Initial Draft',
        'status', CASE WHEN o.status IN ('completed', 'in_progress') THEN 'completed' ELSE 'pending' END,
        'completion_date', CASE WHEN o.status IN ('completed', 'in_progress') THEN (o.created_at + interval '5 days')::text ELSE null END
      ),
      jsonb_build_object(
        'name', 'Client Review',
        'status', CASE WHEN o.status = 'completed' THEN 'completed' ELSE 'pending' END,
        'completion_date', CASE WHEN o.status = 'completed' THEN (o.created_at + interval '8 days')::text ELSE null END
      ),
      jsonb_build_object(
        'name', 'Final Delivery',
        'status', CASE WHEN o.status = 'completed' THEN 'completed' ELSE 'pending' END,
        'completion_date', CASE WHEN o.status = 'completed' THEN (o.created_at + interval '10 days')::text ELSE null END
      )
    ),
    'metrics', jsonb_build_object(
      'completion_percentage', CASE 
        WHEN o.status = 'completed' THEN 100
        WHEN o.status = 'in_progress' THEN 65 
        ELSE 25
      END,
      'days_elapsed', EXTRACT(days FROM (now() - o.created_at)),
      'estimated_completion', COALESCE(o.expected_completion_date::text, (now() + interval '5 days')::text)
    )
  ),
  'pdf',
  'completed',
  now() - interval '2 hours',
  now() + interval '30 days'
FROM orders o
JOIN services s ON o.service_id = s.id
JOIN users u ON o.user_id = u.id;

-- Create financial report
INSERT INTO reports (
  report_type,
  title,
  description,
  generated_by,
  filters,
  data,
  format,
  status,
  generated_at,
  expires_at
)
SELECT 
  'financial',
  'Financial Report - January 2025',
  'Monthly financial summary for January 2025',
  u.id,
  jsonb_build_object(
    'period', '2025-01',
    'currency', 'SGD',
    'include_taxes', true
  ),
  jsonb_build_object(
    'summary', jsonb_build_object(
      'total_revenue', 7967.90,
      'total_orders', 3,
      'avg_order_value', 2655.97,
      'total_tax_collected', 657.90,
      'total_discounts', 150.00,
      'total_surcharges', 160.00
    ),
    'by_service_category', jsonb_build_object(
      'Documentation', jsonb_build_object(
        'revenue', 3815.00,
        'orders', 1,
        'avg_value', 3815.00
      ),
      'Digital', jsonb_build_object(
        'revenue', 4152.90,
        'orders', 2,
        'avg_value', 2076.45
      )
    ),
    'by_country', jsonb_build_object(
      'Singapore', jsonb_build_object(
        'revenue', 7967.90,
        'orders', 3,
        'tax_collected', 657.90
      )
    ),
    'payment_status', jsonb_build_object(
      'paid', 1046.40,
      'pending', 6921.50,
      'overdue', 0
    )
  ),
  'excel',
  'completed',
  now() - interval '1 hour',
  now() + interval '90 days'
FROM users u
WHERE u.role = 'Admin'
LIMIT 1;

-- Create trade lead report  
INSERT INTO reports (
  report_type,
  title,
  description,
  generated_by,
  order_id,
  filters,
  data,
  format,
  status,
  generated_at,
  expires_at
)
SELECT 
  'trade_lead',
  'Trade Lead Report - HSN 85176200',
  'Comprehensive trade lead analysis for mobile devices and smartphones',
  u.id,
  o.id,
  jsonb_build_object(
    'hsn_code', '85176200',
    'countries', jsonb_build_array('Malaysia', 'Thailand', 'Indonesia', 'Singapore'),
    'lead_type', 'buyers',
    'verification_status', 'verified'
  ),
  jsonb_build_object(
    'executive_summary', jsonb_build_object(
      'total_leads', 12,
      'verified_leads', 12,
      'countries_covered', 4,
      'market_potential', '$2.1B'
    ),
    'market_analysis', jsonb_build_object(
      'market_size', '$2.1B',
      'growth_rate', '12% CAGR',
      'key_trends', jsonb_build_array(
        '5G adoption driving smartphone upgrades',
        'Increasing demand for budget smartphones',
        'Growing e-commerce penetration'
      ),
      'opportunities', jsonb_build_array(
        'Enterprise mobility solutions',
        'IoT-enabled devices',
        'Sustainable packaging'
      )
    ),
    'compliance_summary', jsonb_build_object(
      'gst_compliance', '100%',
      'import_licenses', 'Verified',
      'aml_status', 'All leads cleared',
      'regulatory_notes', 'All leads comply with local import regulations'
    ),
    'lead_quality', jsonb_build_object(
      'high_priority', 4,
      'medium_priority', 6,
      'low_priority', 2,
      'avg_annual_volume', '35,000 units'
    )
  ),
  'pdf',
  'completed', 
  now() - interval '30 minutes',
  now() + interval '60 days'
FROM orders o
JOIN services s ON o.service_id = s.id
JOIN users u ON o.user_id = u.id
WHERE s.name = 'Sourcing Buy/Sell Lead Services'
LIMIT 1;

-- Create compliance report
INSERT INTO reports (
  report_type,
  title,
  description,
  generated_by,
  filters,
  data,
  format,
  status,
  generated_at,
  expires_at
)
SELECT 
  'compliance',
  'Compliance Report - Q1 2025',
  'Quarterly compliance status across all jurisdictions',
  u.id,
  jsonb_build_object(
    'period', 'Q1 2025',
    'jurisdictions', jsonb_build_array('Singapore', 'Dubai', 'Malta', 'Cayman Islands'),
    'compliance_types', jsonb_build_array('KYC', 'AML', 'Tax', 'Regulatory')
  ),
  jsonb_build_object(
    'overview', jsonb_build_object(
      'total_entities', 3,
      'compliance_score', 98,
      'pending_items', 1,
      'critical_issues', 0
    ),
    'by_jurisdiction', jsonb_build_object(
      'Singapore', jsonb_build_object(
        'entities', 3,
        'acra_compliance', '100%',
        'mom_compliance', '100%',
        'mas_compliance', '100%',
        'gst_filings', 'Up to date',
        'pdpa_compliance', 'Compliant'
      ),
      'Dubai', jsonb_build_object(
        'entities', 0,
        'note', 'No active entities'
      ),
      'Malta', jsonb_build_object(
        'entities', 0,
        'note', 'No active entities'
      ),
      'Cayman Islands', jsonb_build_object(
        'entities', 0,
        'note', 'No active entities'
      )
    ),
    'kyc_aml_status', jsonb_build_object(
      'documents_verified', 15,
      'pending_verification', 1,
      'compliance_rate', '93.75%',
      'last_audit', '2025-01-15'
    ),
    'action_items', jsonb_build_array(
      jsonb_build_object(
        'priority', 'medium',
        'description', 'Complete KYC verification for pending document',
        'due_date', '2025-02-15',
        'responsible', 'Compliance Team'
      )
    )
  ),
  'pdf',
  'completed',
  now() - interval '4 hours',
  now() + interval '365 days'
FROM users u
WHERE u.role = 'Admin'
LIMIT 1;

-- Create marketing analytics report
INSERT INTO reports (
  report_type,
  title,
  description, 
  generated_by,
  filters,
  data,
  format,
  status,
  generated_at,
  expires_at
)
SELECT 
  'marketing_analytics',
  'Marketing Analytics Report - January 2025',
  'Digital marketing performance analysis for January 2025',
  u.id,
  jsonb_build_object(
    'period', '2025-01',
    'channels', jsonb_build_array('Email', 'Social Media', 'Website'),
    'campaigns', jsonb_build_array('Logo Design Promotion', 'Business Plan Package')
  ),
  jsonb_build_object(
    'website_analytics', jsonb_build_object(
      'unique_visitors', 2847,
      'page_views', 8392,
      'bounce_rate', '42%',
      'avg_session_duration', '3m 24s',
      'conversion_rate', '2.8%'
    ),
    'email_marketing', jsonb_build_object(
      'campaigns_sent', 3,
      'total_emails', 1500,
      'open_rate', '24.5%',
      'click_rate', '3.2%',
      'conversion_rate', '0.8%'
    ),
    'social_media', jsonb_build_object(
      'facebook', jsonb_build_object(
        'posts', 6,
        'reach', 12500,
        'engagement_rate', '4.2%',
        'clicks', 89
      ),
      'instagram', jsonb_build_object(
        'posts', 6,
        'reach', 8900,
        'engagement_rate', '5.1%',
        'clicks', 67
      )
    ),
    'lead_generation', jsonb_build_object(
      'total_leads', 23,
      'qualified_leads', 8,
      'conversion_to_order', 3,
      'cost_per_lead', 45.50,
      'lead_sources', jsonb_build_object(
        'Website', 12,
        'Social Media', 7,
        'Email', 4
      )
    ),
    'roi_analysis', jsonb_build_object(
      'marketing_spend', 2500.00,
      'revenue_generated', 7967.90,
      'roi', '218%',
      'cost_per_acquisition', 833.33
    )
  ),
  'excel',
  'completed',
  now() - interval '6 hours',
  now() + interval '30 days'
FROM users u  
WHERE u.role = 'Admin'
LIMIT 1;