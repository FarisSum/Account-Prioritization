-- Sample customer accounts for the Account Prioritization dashboard.
-- All rows are lead_type 'Customer' — the app is for Account Managers who
-- only work existing customers. "Today" for this dataset is ~2026-09-01.

insert into public.crm
  (domain, company_name, lead_type, employee_growth, account_owner, industry, employee_count, annual_revenue, contract_renewal_date, location, country)
values
  ('https://rhythmtx.com',          'Rhythm Pharmaceuticals',  'Customer',  20.0, 'Sam Cool',        'Pharmaceutical',  300,   30000000,  '2027-01-01', 'Boston, MA',      'USA'),
  ('https://novacore.io',           'NovaCore Systems',        'Customer',  42.0, 'Dana Whitfield',  'SaaS',            1200,  85000000,  '2026-10-15', 'Austin, TX',      'USA'),
  ('https://pinnaclefin.com',       'Pinnacle Financial',      'Customer',   5.0, 'Marcus Lee',      'Fintech',         4500,  260000000, '2026-09-25', 'New York, NY',    'USA'),
  ('https://brightleaf.co',         'Brightleaf Retail',       'Customer', -12.0, 'Priya Nair',      'Retail',          800,   40000000,  '2026-11-30', 'Chicago, IL',     'USA'),
  ('https://helixbio.com',          'Helix Biosciences',       'Customer',  33.0, 'Tom Alvarez',     'Biotech',         220,   18000000,  '2027-05-10', 'San Diego, CA',   'USA'),
  ('https://greenfield-ag.com',     'Greenfield Agriculture',  'Customer',   8.0, 'Sam Cool',        'Agriculture',     1500,  55000000,  '2028-01-15', 'Des Moines, IA',  'USA'),
  ('https://quantumsec.io',         'Quantum Security',        'Customer',  48.0, 'Dana Whitfield',  'Cybersecurity',   600,   47000000,  '2026-12-05', 'Reston, VA',      'USA'),
  ('https://orbitallogistics.com',  'Orbital Logistics',       'Customer', -18.0, 'Marcus Lee',      'Logistics',       3200,  140000000, '2026-10-05', 'Memphis, TN',     'USA'),
  ('https://lumen-edu.org',         'Lumen Education',         'Customer',   3.0, 'Priya Nair',      'Education',        400,   12000000,  '2027-08-20', 'Denver, CO',      'USA'),
  ('https://vertexmedia.tv',        'Vertex Media',            'Customer',  15.0, 'Tom Alvarez',     'Media',           950,   62000000,  '2027-02-14', 'Los Angeles, CA', 'USA'),
  ('https://ironcladmfg.com',       'Ironclad Manufacturing',  'Customer',  -6.0, 'Sam Cool',        'Manufacturing',   5200,  190000000, '2026-11-10', 'Detroit, MI',     'USA'),
  ('https://skybridgeair.com',      'Skybridge Aerospace',     'Customer',  25.0, 'Dana Whitfield',  'Aerospace',       2800,  210000000, '2027-03-30', 'Seattle, WA',     'USA'),
  ('https://coralreef-hosp.com',    'Coral Reef Hospitality',  'Customer', -22.0, 'Marcus Lee',      'Hospitality',     1800,  75000000,  '2027-01-20', 'Miami, FL',       'USA'),
  ('https://datapulse.ai',          'DataPulse Analytics',     'Customer',  55.0, 'Priya Nair',      'SaaS',            180,   14000000,  '2026-09-18', 'Toronto, ON',     'Canada'),
  ('https://meridianins.com',       'Meridian Insurance',      'Customer',   2.0, 'Tom Alvarez',     'Insurance',       6000,  320000000, '2027-06-01', 'Hartford, CT',    'USA'),
  ('https://terrafirma-re.com',     'TerraFirma Real Estate',  'Customer',  10.0, 'Sam Cool',        'Real Estate',     500,   28000000,  '2028-02-01', 'Phoenix, AZ',     'USA'),
  ('https://polarisenergy.com',     'Polaris Energy',          'Customer',  -9.0, 'Dana Whitfield',  'Energy',          4100,  175000000, '2026-10-28', 'Houston, TX',     'USA'),
  ('https://kettlebell-games.com',  'Kettlebell Games',        'Customer',  38.0, 'Marcus Lee',      'Gaming',          260,   22000000,  '2027-04-12', 'Vancouver, BC',   'Canada'),
  ('https://swifthealth.io',        'Swift Health',            'Customer',  18.0, 'Priya Nair',      'Healthcare',      1100,  68000000,  '2026-12-20', 'Nashville, TN',   'USA'),
  ('https://apextelecom.net',       'Apex Telecom',            'Customer',  -3.0, 'Tom Alvarez',     'Telecom',         7500,  410000000, '2027-09-15', 'Dallas, TX',      'USA')
on conflict (domain) do nothing;

-- ---------------------------------------------------------------------------
-- 50 more accounts. Identities are hand-picked; employee_growth /
-- employee_count / annual_revenue / renewal date are derived deterministically
-- from md5(domain) so the set is stable and re-runnable.
-- ---------------------------------------------------------------------------
insert into public.crm
  (domain, company_name, lead_type, account_owner, industry, location, country,
   employee_growth, employee_count, annual_revenue, contract_renewal_date)
with ids(domain, company_name, owner, industry, location, country) as (
  values
  ('https://brightpath-logistics.com','Brightpath Logistics','Marcus Lee','Logistics','Columbus, OH','USA'),
  ('https://vantagehealth.io','Vantage Health','Priya Nair','Healthcare','Nashville, TN','USA'),
  ('https://corewave.io','Corewave Systems','Dana Whitfield','SaaS','San Jose, CA','USA'),
  ('https://northgate-retail.com','Northgate Retail','Sam Cool','Retail','Minneapolis, MN','USA'),
  ('https://summitbiologics.com','Summit Biologics','Tom Alvarez','Biotech','Cambridge, MA','USA'),
  ('https://ridgelinefin.com','Ridgeline Financial','Rachel Kim','Fintech','Charlotte, NC','USA'),
  ('https://cobaltgaming.com','Cobalt Gaming','Ben Okafor','Gaming','Los Angeles, CA','USA'),
  ('https://emberline-energy.com','Emberline Energy','Sofia Duarte','Energy','Tulsa, OK','USA'),
  ('https://fathommedia.tv','Fathom Media','Liam Byrne','Media','Atlanta, GA','USA'),
  ('https://graniteinsurance.com','Granite Insurance','Marcus Lee','Insurance','Columbus, OH','USA'),
  ('https://harborview-travel.com','Harborview Travel','Priya Nair','Travel','Orlando, FL','USA'),
  ('https://ironwoodmfg.com','Ironwood Manufacturing','Dana Whitfield','Manufacturing','Cleveland, OH','USA'),
  ('https://juniper-ag.com','Juniper Agriculture','Sam Cool','Agriculture','Lincoln, NE','USA'),
  ('https://kestrelaero.com','Kestrel Aerospace','Tom Alvarez','Aerospace','Wichita, KS','USA'),
  ('https://luminaedu.org','Lumina Education','Rachel Kim','Education','Austin, TX','USA'),
  ('https://nimbus-cloud.io','Nimbus Cloud','Ben Okafor','SaaS','Seattle, WA','USA'),
  ('https://onyx-security.io','Onyx Security','Sofia Duarte','Cybersecurity','Reston, VA','USA'),
  ('https://polaris-realty.com','Polaris Realty','Liam Byrne','Real Estate','Denver, CO','USA'),
  ('https://quartztelecom.net','Quartz Telecom','Marcus Lee','Telecom','Dallas, TX','USA'),
  ('https://sable-automotive.com','Sable Automotive','Priya Nair','Automotive','Detroit, MI','USA'),
  ('https://terracehospitality.com','Terrace Hospitality','Dana Whitfield','Hospitality','Miami, FL','USA'),
  ('https://vireo-health.com','Vireo Health','Sam Cool','Healthcare','Boston, MA','USA'),
  ('https://willowbrook-retail.com','Willowbrook Retail','Tom Alvarez','Retail','Chicago, IL','USA'),
  ('https://zephyrpay.io','Zephyr Pay','Rachel Kim','Fintech','New York, NY','USA'),
  ('https://arcadia-games.com','Arcadia Games','Ben Okafor','Gaming','Vancouver, BC','Canada'),
  ('https://bluepoint-marine.com','Bluepoint Marine','Sofia Duarte','Logistics','Seattle, WA','USA'),
  ('https://cedarpine-foods.com','Cedarpine Foods','Liam Byrne','Consumer Goods','Portland, OR','USA'),
  ('https://driftwood-apparel.com','Driftwood Apparel','Marcus Lee','Retail','Los Angeles, CA','USA'),
  ('https://evergreen-power.com','Evergreen Power','Priya Nair','Energy','Houston, TX','USA'),
  ('https://foxglen-labs.com','Foxglen Labs','Dana Whitfield','Biotech','San Diego, CA','USA'),
  ('https://goldleaf-capital.com','Goldleaf Capital','Sam Cool','Fintech','Chicago, IL','USA'),
  ('https://hollowcreate.io','Hollow Create','Tom Alvarez','Media','Toronto, ON','Canada'),
  ('https://indigo-analytics.io','Indigo Analytics','Rachel Kim','SaaS','Austin, TX','USA'),
  ('https://jasper-logistics.com','Jasper Logistics','Ben Okafor','Logistics','Memphis, TN','USA'),
  ('https://kingfisher-air.com','Kingfisher Air','Sofia Duarte','Aerospace','Everett, WA','USA'),
  ('https://larkspur-beauty.com','Larkspur Beauty','Liam Byrne','Consumer Goods','New York, NY','USA'),
  ('https://mosswarehouse.com','Moss Warehouse','Marcus Lee','E-commerce','Columbus, OH','USA'),
  ('https://nightingale-care.com','Nightingale Care','Priya Nair','Healthcare','Philadelphia, PA','USA'),
  ('https://oakmere-realty.com','Oakmere Realty','Dana Whitfield','Real Estate','Phoenix, AZ','USA'),
  ('https://pinecrest-outdoor.com','Pinecrest Outdoor','Sam Cool','Retail','Boulder, CO','USA'),
  ('https://quill-software.io','Quill Software','Tom Alvarez','SaaS','Raleigh, NC','USA'),
  ('https://rowan-insurance.com','Rowan Insurance','Rachel Kim','Insurance','Hartford, CT','USA'),
  ('https://silverbrook-mining.com','Silverbrook Mining','Ben Okafor','Mining','Salt Lake City, UT','USA'),
  ('https://thornfield-agri.com','Thornfield Agri','Sofia Duarte','Agriculture','Des Moines, IA','USA'),
  ('https://umbra-media.com','Umbra Media','Liam Byrne','Media','Los Angeles, CA','USA'),
  ('https://verdant-farms.com','Verdant Farms','Marcus Lee','Agriculture','Fresno, CA','USA'),
  ('https://wren-payments.io','Wren Payments','Priya Nair','Fintech','London','United Kingdom'),
  ('https://yarrow-wellness.com','Yarrow Wellness','Dana Whitfield','Healthcare','Denver, CO','USA'),
  ('https://ashford-realty.com','Ashford Realty','Sam Cool','Real Estate','Boston, MA','USA'),
  ('https://beacon-education.org','Beacon Education','Tom Alvarez','Education','Boston, MA','USA')
),
h as (
  select *,
    ('x'||substr(md5(domain),1,8))::bit(32)::bigint  h1,
    ('x'||substr(md5(domain),9,8))::bit(32)::bigint  h2,
    ('x'||substr(md5(domain),17,8))::bit(32)::bigint h3
  from ids
),
j as (
  select *, (h1%1000)::numeric/1000.0 j1, (h2%1000)::numeric/1000.0 j2, (h3%1000)::numeric/1000.0 j3 from h
),
calc as (
  select *,
    round((-22 + 52*j1 - 8*j2)::numeric, 1) as emp_growth,
    greatest(40, round(40 + 9000 * power(j2, 2.3))::int) as emp_count
  from j
)
select
  domain, company_name, 'Customer', owner, industry, location, country,
  emp_growth,
  emp_count,
  least(800000000, round(emp_count * (30000 + 110000*j3))::bigint),
  (date '2026-09-15' + (h3 % 640)::int)
from calc
on conflict (domain) do nothing;

-- ---------------------------------------------------------------------------
-- product_telemetry — one row per account, derived deterministically from the
-- crm row so the numbers track each account's size and growth. md5(domain) is
-- the only randomness, so re-running is stable.
-- ---------------------------------------------------------------------------
insert into public.product_telemetry (
  domain, payment_volume_monthly, payment_volume_yoy_growth, transaction_count_monthly,
  transaction_count_yoy_growth, authorization_rate, decline_rate, payment_methods_used,
  countries_processing, countries_added_yoy, currencies_processed, api_calls_monthly,
  api_volume_yoy_growth, api_error_rate, recurring_payments_monthly, recurring_payment_yoy_growth,
  tokens_stored, risk_rules_active, fraud_rate, chargebacks_monthly, dispute_management_pct,
  reporting_exports_monthly, active_users, active_api_keys, webhooks_monthly, webhook_failure_rate,
  products_adopted, products_added_yoy
)
with s1 as (
  select c.domain, c.annual_revenue r, c.employee_count e, c.employee_growth g,
    (('x'||substr(md5(c.domain),1,8))::bit(32)::bigint) h1,
    (('x'||substr(md5(c.domain),9,8))::bit(32)::bigint) h2,
    (('x'||substr(md5(c.domain),17,8))::bit(32)::bigint) h3
  from public.crm c
),
s2 as (select *, ((h1%1000)::numeric/1000.0) j1, ((h2%1000)::numeric/1000.0) j2, ((h3%1000)::numeric/1000.0) j3 from s1),
s3 as (
  select *,
    round((r*(1.1+0.5*j1))::numeric)::bigint pv,
    round((g*(1.7+0.4*j2))::numeric,2) pvg,
    (12+(h2%110)) ticket,
    round(least(97.5, greatest(82, 88+6*j1-greatest(0,-g)*0.12))::numeric,2) authr
  from s2
),
s4 as (select *, greatest(1000, round((pv/ticket)::numeric)::bigint) txn from s3),
s5 as (
  select *,
    round(least(0.900, greatest(0.050, 0.08 + 0.30*j3 + greatest(0,-g)*0.01))::numeric,3) fraud,
    greatest(2, least(6, 2 + (h2%4)::int + case when g<-10 then -1 when g>30 then 1 else 0 end)) prodn,
    greatest(1, round(ln(e::numeric)*(0.9+0.7*j2))::int) ctry,
    greatest(2, round(ln(e::numeric)*(1.4+2.0*j1))::int) ausers
  from s4
)
select
  domain, pv, pvg, txn,
  round((pvg*(0.80+0.30*j3))::numeric,2),
  authr,
  round((100-authr)::numeric,2),
  (array['Visa','Mastercard','Amex','Apple Pay','Google Pay','iDEAL','Klarna','SEPA Direct Debit','PayPal','Bancontact'])[1:(4+(h1%5))::int],
  ctry,
  case when g<0 then (h3%2)::int else (h3%4)::int + case when g>25 then 2 else 0 end end,
  greatest(1, ctry - (h1%3)::int),
  round((txn*(5+4*j1))::numeric)::bigint,
  round((g*(1.8+0.5*j2))::numeric,2),
  round(least(3.00, greatest(0.20, 0.3 + 1.0*j3 + greatest(0,-g)*0.02))::numeric,2),
  round((txn*(0.04+0.10*j2))::numeric)::bigint,
  round((g*(1.9+0.6*j3))::numeric,2),
  round((txn*(0.25+0.5*j1))::numeric)::bigint,
  (8+(h2%42))::int,
  fraud,
  greatest(0, round((txn*(fraud/100.0)*(0.4+0.5*j1))::numeric)::int),
  round((68+27*j2)::numeric,2),
  (4+(h3%58))::int,
  ausers,
  greatest(1, round((ausers*(0.3+0.4*j2))::numeric)::int),
  round((txn*(2+5*j3))::numeric)::bigint,
  round((0.1+0.8*j1)::numeric,2),
  (array['Online Payments','POS','Risk','Recurring','Payouts','Data & Reporting','Capital','Platforms'])[1:prodn],
  case when g<0 then 0 else (h3%3)::int + case when g>30 then 1 else 0 end end
from s5
on conflict (domain) do nothing;

-- ---------------------------------------------------------------------------
-- gong_signals — call-transcript snippets, ~5 per account. Tone tracks the
-- account: growing accounts skew Expansion/Cross-sell positive; shrinking
-- accounts skew Competitive/Renewal/Feedback negative.
-- ---------------------------------------------------------------------------
-- last_detected_date is computed inline (column is NOT NULL): positive signals
-- skew recent (~260-day span), others wider.
insert into public.gong_signals (transcript_id, domain, category, sentiment, signal, transcript_text, last_detected_date)
select g.transcript_id, g.domain, g.category, g.sentiment, g.signal, g.transcript_text,
  date '2026-08-25' - ((('x' || substr(md5(g.transcript_id), 1, 8))::bit(32)::bigint
    % (case when g.sentiment = 'Positive' then 260 else 400 end))::int)
from (values
('TRX-001','https://rhythmtx.com','Expansion','Positive','Geographic expansion',$q$We're planning to expand our commercial operations into four additional European markets next year, and we'd want those transactions running through Adyen.$q$),
('TRX-002','https://rhythmtx.com','Expansion','Positive','Transaction growth',$q$Our transaction volumes have been growing significantly, and we expect that trend to continue as our patient programs expand.$q$),
('TRX-003','https://rhythmtx.com','Cross-sell','Positive','Recurring Payments',$q$We're looking at expanding our subscription and recurring payment capabilities and would like to understand what Adyen can support.$q$),
('TRX-004','https://rhythmtx.com','Cross-sell','Positive','Risk',$q$We'd like to take a closer look at Adyen's risk capabilities because fraud prevention is becoming more important as our volume increases.$q$),
('TRX-005','https://rhythmtx.com','Competitive','Negative','Competitor evaluation',$q$We're also talking with Stripe to understand what they can offer us as we expand internationally.$q$),
('TRX-006','https://rhythmtx.com','Stakeholder','Positive','Executive engagement',$q$Our VP of Finance will be involved in the evaluation because payments and reconciliation are becoming a bigger priority.$q$),
('TRX-007','https://rhythmtx.com','Stakeholder','Positive','New payments stakeholder',$q$We've recently brought in a new Head of Payments who will be taking a much closer look at our payment infrastructure.$q$),
('TRX-008','https://rhythmtx.com','Renewal','Positive','Renewal interest',$q$We're happy with the relationship and would like to discuss what a longer-term agreement could look like.$q$),
('TRX-009','https://rhythmtx.com','Renewal','Negative','Pricing concern',$q$Before we renew, we need to understand whether our processing economics are still competitive as our volume grows.$q$),
('TRX-010','https://rhythmtx.com','Feedback','Negative','Reporting limitation',$q$The reporting doesn't give our finance team everything they need today, so we're still doing some reconciliation work manually.$q$),
('TRX-011','https://rhythmtx.com','Feedback','Positive','Product value',$q$The centralized reporting and payment visibility have made it much easier for our team to understand what's happening across markets.$q$),
('TRX-012','https://novacore.io','Expansion','Positive','Geographic expansion',$q$We're rolling out NovaCore across several new APAC markets over the next two quarters and want that volume processed through Adyen.$q$),
('TRX-013','https://novacore.io','Expansion','Positive','Volume growth',$q$Our monthly processing volume is up sharply year over year and the forecast has it climbing further as we scale into new segments.$q$),
('TRX-014','https://novacore.io','Cross-sell','Positive','Recurring Payments',$q$We're moving more of our customers onto annual subscriptions and want to consolidate that billing on Adyen.$q$),
('TRX-015','https://novacore.io','Competitive','Negative','Competitor evaluation',$q$We're also running a parallel evaluation with Stripe as part of this expansion, mostly around pricing and local acquiring.$q$),
('TRX-016','https://novacore.io','Stakeholder','Positive','Executive engagement',$q$Our CFO is now sponsoring the payments project and wants a quarterly review of authorization performance.$q$),
('TRX-017','https://helixbio.com','Expansion','Positive','Geographic expansion',$q$We're opening commercial operations in several new European markets and want those transactions running through Adyen.$q$),
('TRX-018','https://helixbio.com','Expansion','Positive','Volume growth',$q$Processing volume has grown a lot this year and we expect it to keep rising as our clinical programs expand.$q$),
('TRX-019','https://helixbio.com','Cross-sell','Positive','Risk',$q$As our transaction values rise we want to evaluate Adyen's risk and fraud tooling more seriously.$q$),
('TRX-020','https://helixbio.com','Competitive','Negative','Competitor evaluation',$q$We're also comparing notes with Checkout.com on European acquiring and pricing.$q$),
('TRX-021','https://helixbio.com','Renewal','Positive','Early renewal interest',$q$The partnership is working well and we'd like to start talking about a multi-year renewal ahead of schedule.$q$),
('TRX-022','https://quantumsec.io','Expansion','Positive','Geographic expansion',$q$We're expanding into more North American enterprise accounts and want the added volume on Adyen.$q$),
('TRX-023','https://quantumsec.io','Expansion','Positive','Volume growth',$q$Our monthly volume is climbing fast and the pipeline suggests that continues through next year.$q$),
('TRX-024','https://quantumsec.io','Cross-sell','Positive','Data & Reporting',$q$We'd like to pull Adyen settlement data directly into our finance warehouse and want to understand the reporting APIs.$q$),
('TRX-025','https://quantumsec.io','Competitive','Negative','Competitor evaluation',$q$We're also talking with Stripe to see what they can offer on pricing as our volume grows.$q$),
('TRX-026','https://quantumsec.io','Stakeholder','Positive','New payments stakeholder',$q$We've hired a Director of Payments who is keen to deepen the Adyen relationship.$q$),
('TRX-027','https://skybridgeair.com','Expansion','Positive','Geographic expansion',$q$We're growing across the Middle East and APAC and want that transaction volume processed through Adyen.$q$),
('TRX-028','https://skybridgeair.com','Expansion','Positive','Volume growth',$q$Our processing volume is up well into the double digits year over year and the trend is holding.$q$),
('TRX-029','https://skybridgeair.com','Cross-sell','Positive','Payouts',$q$We have a growing partner network and are interested in using Adyen for payouts as well as acceptance.$q$),
('TRX-030','https://skybridgeair.com','Competitive','Negative','Competitor evaluation',$q$We're also running a parallel quote with Worldpay, largely around settlement terms.$q$),
('TRX-031','https://skybridgeair.com','Renewal','Positive','Renewal interest',$q$We expect to renew and would like to fold the new payout volume into the same agreement.$q$),
('TRX-032','https://datapulse.ai','Expansion','Positive','Geographic expansion',$q$We're launching in several new European markets this year and want that volume on Adyen from day one.$q$),
('TRX-033','https://datapulse.ai','Expansion','Positive','Volume growth',$q$Our transaction volume is growing very quickly and we expect it to keep accelerating as we move upmarket.$q$),
('TRX-034','https://datapulse.ai','Cross-sell','Positive','Recurring Payments',$q$Usage-based billing is becoming core to our model and we want Adyen to handle the recurring charges.$q$),
('TRX-035','https://datapulse.ai','Competitive','Negative','Competitor evaluation',$q$We're also evaluating Braintree, mainly to benchmark pricing as we scale.$q$),
('TRX-036','https://datapulse.ai','Stakeholder','Positive','Executive engagement',$q$Our founder is personally focused on payment conversion right now given how fast we're growing.$q$),
('TRX-037','https://kettlebell-games.com','Expansion','Positive','Geographic expansion',$q$We're pushing into Latin America and APAC and want local payment methods there supported through Adyen.$q$),
('TRX-038','https://kettlebell-games.com','Expansion','Positive','Volume growth',$q$In-game purchase volume is up sharply and each new title release pushes it higher.$q$),
('TRX-039','https://kettlebell-games.com','Cross-sell','Positive','Risk',$q$Chargebacks tick up whenever we run a big in-game promotion, so we want to look at Adyen's risk rules.$q$),
('TRX-040','https://kettlebell-games.com','Competitive','Negative','Competitor evaluation',$q$We're also in conversations with Nuvei about coverage in emerging markets.$q$),
('TRX-041','https://kettlebell-games.com','Renewal','Positive','Renewal interest',$q$We're happy to extend the contract and want to lock in terms before our next funding round.$q$),
('TRX-042','https://swifthealth.io','Expansion','Positive','Geographic expansion',$q$We're expanding into several new US regions and want the added patient-payment volume on Adyen.$q$),
('TRX-043','https://swifthealth.io','Expansion','Positive','Volume growth',$q$Payment volume has grown steadily and our forecast has it rising further as we sign new provider groups.$q$),
('TRX-044','https://swifthealth.io','Cross-sell','Positive','Recurring Payments',$q$We're launching a membership product and need reliable recurring payments with retry logic.$q$),
('TRX-045','https://swifthealth.io','Competitive','Negative','Competitor evaluation',$q$We're also talking with Stripe about their healthcare-focused tooling.$q$),
('TRX-046','https://swifthealth.io','Stakeholder','Positive','Executive engagement',$q$Our COO has taken ownership of the payments roadmap and wants to accelerate adoption.$q$),
('TRX-047','https://vertexmedia.tv','Expansion','Positive','Geographic expansion',$q$We're growing our subscriber base across Europe and LATAM and want that billing volume on Adyen.$q$),
('TRX-048','https://vertexmedia.tv','Expansion','Positive','Volume growth',$q$Subscription revenue is up year over year and churn is low, so processing volume keeps climbing.$q$),
('TRX-049','https://vertexmedia.tv','Cross-sell','Positive','Data & Reporting',$q$Our finance team wants richer settlement reporting so they can close the books faster each month.$q$),
('TRX-050','https://vertexmedia.tv','Competitive','Negative','Competitor evaluation',$q$We're also comparing terms with Checkout.com for our European volume.$q$),
('TRX-051','https://vertexmedia.tv','Renewal','Positive','Renewal interest',$q$The relationship is solid and we'd like to discuss a longer-term commitment with better volume tiers.$q$),
('TRX-052','https://pinnaclefin.com','Feedback','Positive','Reporting value',$q$The consolidated reporting across regions has made monthly reconciliation noticeably faster for our finance team.$q$),
('TRX-053','https://pinnaclefin.com','Feedback','Negative','Integration friction',$q$Some of our older systems still need custom work to talk to the Adyen APIs and that's slowing a few projects.$q$),
('TRX-054','https://pinnaclefin.com','Renewal','Neutral','Renewal timing',$q$We expect to renew but want to review pricing and volume commitments before we sign anything.$q$),
('TRX-055','https://pinnaclefin.com','Stakeholder','Positive','New payments stakeholder',$q$We've brought in a new Head of Payments who will be reviewing our payment setup over the next quarter.$q$),
('TRX-056','https://pinnaclefin.com','Competitive','Negative','Competitor evaluation',$q$We're benchmarking our processing costs against Stripe and Braintree as part of our annual vendor review.$q$),
('TRX-057','https://greenfield-ag.com','Feedback','Positive','Reporting value',$q$The consolidated settlement reporting has made month-end close smoother for our controllers.$q$),
('TRX-058','https://greenfield-ag.com','Feedback','Negative','Reporting limitation',$q$A couple of the reports don't break out data the way our controllers need, so we still export to spreadsheets.$q$),
('TRX-059','https://greenfield-ag.com','Renewal','Neutral','Renewal timing',$q$We plan to renew but want to align the term with our fiscal year and revisit volume tiers.$q$),
('TRX-060','https://greenfield-ag.com','Stakeholder','Positive','New payments stakeholder',$q$We've brought in a new VP of Finance who will be reviewing our payment setup over the next quarter.$q$),
('TRX-061','https://greenfield-ag.com','Cross-sell','Positive','Risk',$q$As we take more card-not-present volume we'd like to add Adyen's risk management module.$q$),
('TRX-062','https://lumen-edu.org','Feedback','Positive','Reporting value',$q$The payment visibility across campuses has made it much easier for our finance office to track receivables.$q$),
('TRX-063','https://lumen-edu.org','Feedback','Negative','Settlement timing',$q$Settlement timing on a few payment methods is less predictable than we'd like for cash-flow planning.$q$),
('TRX-064','https://lumen-edu.org','Renewal','Neutral','Renewal timing',$q$We expect to renew but the decision needs to go through our procurement committee first.$q$),
('TRX-065','https://lumen-edu.org','Stakeholder','Positive','New payments stakeholder',$q$We've brought in a new Director of Finance who will be reviewing our payment setup over the next quarter.$q$),
('TRX-066','https://lumen-edu.org','Cross-sell','Positive','Recurring Payments',$q$We're introducing payment plans for tuition and want to use Adyen's recurring capabilities.$q$),
('TRX-067','https://ironcladmfg.com','Feedback','Positive','Reporting value',$q$The consolidated reporting has helped our treasury team get a clearer picture of cash across the business.$q$),
('TRX-068','https://ironcladmfg.com','Feedback','Negative','Integration friction',$q$The ERP integration has been more effort than expected and we've had to pull in outside developers.$q$),
('TRX-069','https://ironcladmfg.com','Renewal','Neutral','Renewal timing',$q$We anticipate renewing but want to complete our internal cost review before committing.$q$),
('TRX-070','https://ironcladmfg.com','Stakeholder','Positive','New payments stakeholder',$q$We've brought in a new Treasury Manager who will be reviewing our payment setup over the next quarter.$q$),
('TRX-071','https://ironcladmfg.com','Competitive','Negative','Competitor evaluation',$q$Procurement has asked us to get a competing quote from Fiserv before renewal.$q$),
('TRX-072','https://meridianins.com','Feedback','Positive','Reporting value',$q$The reporting has made it easier for our finance team to reconcile premium collections across states.$q$),
('TRX-073','https://meridianins.com','Feedback','Negative','Reporting limitation',$q$Our actuarial and finance teams want more granular fee breakdowns than the current reports provide.$q$),
('TRX-074','https://meridianins.com','Renewal','Neutral','Renewal timing',$q$We expect to renew but want to review pricing and volume commitments before we sign.$q$),
('TRX-075','https://meridianins.com','Stakeholder','Positive','New payments stakeholder',$q$We've brought in a new Head of Payment Operations who will be reviewing our setup over the next quarter.$q$),
('TRX-076','https://meridianins.com','Cross-sell','Positive','Payouts',$q$We're interested in using Adyen for claims disbursements, not just premium collection.$q$),
('TRX-077','https://polarisenergy.com','Feedback','Positive','Reporting value',$q$The settlement reporting has helped our finance team track receivables across business units.$q$),
('TRX-078','https://polarisenergy.com','Feedback','Negative','Support responsiveness',$q$Response times on a few technical tickets have been slower than we're used to.$q$),
('TRX-079','https://polarisenergy.com','Renewal','Neutral','Renewal timing',$q$We expect to renew but finance wants to revisit our processing costs first.$q$),
('TRX-080','https://polarisenergy.com','Stakeholder','Positive','New payments stakeholder',$q$We've brought in a new VP of Finance who will be reviewing our payment setup over the next quarter.$q$),
('TRX-081','https://polarisenergy.com','Competitive','Negative','Competitor evaluation',$q$Finance is evaluating whether moving to Fiserv would reduce our per-transaction costs.$q$),
('TRX-082','https://apextelecom.net','Feedback','Positive','Reporting value',$q$The reporting has helped our finance automation program by giving us cleaner settlement data.$q$),
('TRX-083','https://apextelecom.net','Feedback','Negative','Reporting limitation',$q$At our scale we need better tooling to reconcile millions of transactions, and today that's partly manual.$q$),
('TRX-084','https://apextelecom.net','Renewal','Neutral','Renewal timing',$q$We expect to renew but want to negotiate volume tiers given how large our processing base is.$q$),
('TRX-085','https://apextelecom.net','Stakeholder','Positive','New payments stakeholder',$q$We've brought in a new Head of Payments who will be reviewing our payment setup over the next quarter.$q$),
('TRX-086','https://apextelecom.net','Cross-sell','Positive','Data & Reporting',$q$We want to license the advanced reporting add-on to support our finance automation program.$q$),
('TRX-087','https://terrafirma-re.com','Feedback','Positive','Reporting value',$q$The payment visibility across properties has made rent reconciliation much easier for our accounting team.$q$),
('TRX-088','https://terrafirma-re.com','Feedback','Negative','Integration friction',$q$Connecting Adyen to our property-management software took longer than the timeline we planned for.$q$),
('TRX-089','https://terrafirma-re.com','Renewal','Neutral','Renewal timing',$q$We expect to renew but want to review pricing and volume commitments before we sign.$q$),
('TRX-090','https://terrafirma-re.com','Stakeholder','Positive','New payments stakeholder',$q$We've brought in a new Controller who will be reviewing our payment setup over the next quarter.$q$),
('TRX-091','https://terrafirma-re.com','Cross-sell','Positive','Recurring Payments',$q$Recurring rent collection is a priority and we want to expand our use of Adyen there.$q$),
('TRX-092','https://brightleaf.co','Competitive','Negative','Competitor evaluation',$q$We're in active discussions with Shopify Payments about moving our retail volume off Adyen.$q$),
('TRX-093','https://brightleaf.co','Renewal','Negative','Pricing concern',$q$Our margins are under pressure and the current processing rates are hard to justify to our board.$q$),
('TRX-094','https://brightleaf.co','Feedback','Negative','Support escalation',$q$We've had two unresolved escalations this quarter and it's eroding confidence internally.$q$),
('TRX-095','https://brightleaf.co','Stakeholder','Negative','Champion departed',$q$Our Head of Payments who owned this relationship has left, and the new team is reviewing all vendors.$q$),
('TRX-096','https://brightleaf.co','Expansion','Negative','Volume decline',$q$We're closing underperforming stores, so processing volume will be lower next year.$q$),
('TRX-097','https://orbitallogistics.com','Competitive','Negative','Competitor evaluation',$q$We've started a formal evaluation of Worldpay to compare pricing and settlement terms.$q$),
('TRX-098','https://orbitallogistics.com','Renewal','Negative','Pricing concern',$q$With volume down this year, our effective per-transaction cost has gone up and finance has flagged it.$q$),
('TRX-099','https://orbitallogistics.com','Feedback','Negative','Support escalation',$q$A settlement discrepancy took weeks to resolve and that caused real friction with our finance team.$q$),
('TRX-100','https://orbitallogistics.com','Stakeholder','Negative','Champion departed',$q$The executive sponsor for the Adyen contract moved on and no one has clearly picked it up.$q$),
('TRX-101','https://orbitallogistics.com','Expansion','Negative','Volume decline',$q$Freight demand has softened and our transaction counts are down year over year.$q$),
('TRX-102','https://coralreef-hosp.com','Competitive','Negative','Competitor evaluation',$q$We're talking to Fiserv about consolidating payments with our property-management vendor.$q$),
('TRX-103','https://coralreef-hosp.com','Renewal','Negative','Pricing concern',$q$We need a materially better rate at renewal or we'll have to look elsewhere.$q$),
('TRX-104','https://coralreef-hosp.com','Feedback','Negative','Support escalation',$q$Several outages during peak season hurt us and the post-incident follow-up was thin.$q$),
('TRX-105','https://coralreef-hosp.com','Stakeholder','Negative','Champion departed',$q$Our main point of contact on the finance side departed and the relationship has cooled.$q$),
('TRX-106','https://coralreef-hosp.com','Expansion','Negative','Volume decline',$q$Occupancy is down across our properties and payment volume has fallen with it.$q$)
) as g(transcript_id, domain, category, sentiment, signal, transcript_text)
on conflict (transcript_id) do nothing;

-- ---------------------------------------------------------------------------
-- gong_signals for the additional 50 accounts — 6 per account from templates,
-- archetype (A growing / B steady / C declining) chosen by employee_growth,
-- company name + a rotating competitor substituted in. Only fills accounts
-- that don't already have signals.
-- ---------------------------------------------------------------------------
insert into public.gong_signals (transcript_id, domain, category, sentiment, signal, transcript_text, last_detected_date)
with tmpl(arch, ord, category, sentiment, signal, tpl) as (
  values
  ('A',1,'Expansion','Positive','Geographic expansion',     $t${co} is opening operations in several new markets over the next two quarters and wants that volume on Adyen.$t$),
  ('A',2,'Expansion','Positive','Volume growth',             $t$Processing volume at {co} is up sharply year over year and the forecast has it climbing further.$t$),
  ('A',3,'Cross-sell','Positive','Recurring Payments',       $t${co} wants to consolidate subscription billing and expand its use of recurring payments.$t$),
  ('A',4,'Cross-sell','Positive','Risk',                     $t$As volume grows, {co} wants to look harder at Adyen risk and fraud tooling.$t$),
  ('A',5,'Competitive','Negative','Competitor evaluation',   $t${co} is also running a parallel evaluation with {comp}, mostly on pricing.$t$),
  ('A',6,'Stakeholder','Positive','Executive engagement',    $t$The CFO at {co} is now sponsoring the payments workstream and wants a quarterly review.$t$),
  ('B',1,'Feedback','Positive','Reporting value',            $t$Consolidated reporting has made monthly reconciliation faster for the {co} finance team.$t$),
  ('B',2,'Feedback','Negative','Integration friction',       $t$Some older systems at {co} still need custom work to talk to the Adyen APIs.$t$),
  ('B',3,'Renewal','Neutral','Renewal timing',               $t${co} expects to renew but wants to review pricing and volume commitments first.$t$),
  ('B',4,'Stakeholder','Positive','New payments stakeholder',$t${co} has brought in a new Head of Payments who will review the setup this quarter.$t$),
  ('B',5,'Cross-sell','Neutral','Payouts',                   $t${co} asked some early questions about using Adyen for payouts, no decision yet.$t$),
  ('B',6,'Competitive','Negative','Competitor evaluation',   $t${co} is benchmarking processing costs against {comp} as part of an annual vendor review.$t$),
  ('C',1,'Competitive','Negative','Competitor evaluation',   $t${co} is in active discussions with {comp} about moving volume off Adyen.$t$),
  ('C',2,'Renewal','Negative','Pricing concern',             $t$Margins at {co} are under pressure and current processing rates are hard to justify to the board.$t$),
  ('C',3,'Feedback','Negative','Support escalation',         $t${co} has had unresolved escalations this quarter and it is eroding confidence.$t$),
  ('C',4,'Stakeholder','Negative','Champion departed',       $t$The {co} payments lead who owned this relationship has left; the new team is reviewing vendors.$t$),
  ('C',5,'Expansion','Negative','Volume decline',            $t${co} is consolidating to fewer providers as transaction volume falls year over year.$t$),
  ('C',6,'Feedback','Negative','Reporting limitation',       $t$Reporting does not give the {co} finance team what they need, so reconciliation is still manual.$t$)
),
comp(i, name) as (values (0,'Stripe'),(1,'Braintree'),(2,'Checkout.com'),(3,'Worldpay'),(4,'Fiserv'),(5,'PayPal'),(6,'Nuvei'),(7,'Global Payments')),
acct as (
  select c.domain, c.company_name,
    case when c.employee_growth >= 15 then 'A' when c.employee_growth <= -10 then 'C' else 'B' end as arch,
    (('x'||substr(md5(c.domain),25,8))::bit(32)::bigint) hc
  from public.crm c
  where not exists (select 1 from public.gong_signals g where g.domain = c.domain)
),
rws as (
  select a.domain, t.category, t.sentiment, t.signal,
    replace(replace(t.tpl, '{co}', a.company_name), '{comp}', cm.name) as transcript_text,
    row_number() over (order by a.domain, t.ord) as rn
  from acct a
  join tmpl t on t.arch = a.arch
  join comp cm on cm.i = (a.hc % 8)
)
select
  'TRX-G' || lpad(rn::text, 4, '0'),
  domain, category, sentiment, signal, transcript_text,
  date '2026-08-25' - ((('x'||substr(md5('TRX-G' || lpad(rn::text, 4, '0')),1,8))::bit(32)::bigint
    % (case when sentiment = 'Positive' then 260 else 400 end))::int)
from rws
on conflict (transcript_id) do nothing;

-- ---------------------------------------------------------------------------
-- crm.adyen_arr — Adyen's annual revenue from each account = processed volume
-- x a blended take rate (~0.22%-1.3%, lower for very large merchants).
-- Runs after product_telemetry is populated.
-- ---------------------------------------------------------------------------
update public.crm c set adyen_arr = sub.arr
from (
  select t.domain,
    greatest(60000, round(
      (t.payment_volume_monthly::numeric * 12)
      * (
          (0.0024 + 0.0100 * ((('x' || substr(md5(t.domain), 25, 8))::bit(32)::bigint % 1000)::numeric / 1000.0))
          - case when cr.annual_revenue > 200000000 then 0.0016
                 when cr.annual_revenue > 80000000  then 0.0008
                 else 0 end
        )
    )::bigint) as arr
  from public.product_telemetry t
  join public.crm cr on cr.domain = t.domain
) sub
where c.domain = sub.domain;

-- crm.num_years_as_customer — established / large accounts skew longer,
-- hypergrowth accounts shorter.
update public.crm set num_years_as_customer = greatest(0.6, round(
    (2.0 + ((('x' || substr(md5(domain), 13, 8))::bit(32)::bigint % 90)::numeric / 10.0))
    - case when employee_growth > 35 then 2.0 when employee_growth > 20 then 1.0 else 0 end
    + case when employee_count > 3000 then 1.5 else 0 end
, 1));
