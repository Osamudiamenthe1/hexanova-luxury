-- =============================================================================
-- Deval Luxury - SAMPLE SEED DATA
-- =============================================================================
-- THIS IS SAMPLE DATA. Replace it with the client's real content when ready.
--
-- How to run:
--   1. Open Supabase -> SQL Editor -> New query
--   2. Paste this file
--   3. Click Run
--
-- Safe to run more than once: every INSERT uses ON CONFLICT DO NOTHING.
--
-- All image fields are left empty on purpose, so the site shows its
-- "no image yet" placeholder during development.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- CATEGORIES (6)
-- -----------------------------------------------------------------------------
insert into public.categories (id, name, slug, description, image_url, sort_order)
values
  ('00000000-0000-0000-0000-000000000101', 'Living',    'living',    'Sofas, armchairs, and coffee tables for the main living space.', null, 1),
  ('00000000-0000-0000-0000-000000000102', 'Dining',    'dining',    'Dining tables, chairs, and sideboards.',                       null, 2),
  ('00000000-0000-0000-0000-000000000103', 'Bedroom',   'bedroom',   'Beds, nightstands, and bedroom storage.',                      null, 3),
  ('00000000-0000-0000-0000-000000000104', 'Lighting',  'lighting',  'Floor lamps, table lamps, and pendants.',                      null, 4),
  ('00000000-0000-0000-0000-000000000105', 'Decor',     'decor',     'Mirrors, vases, and small accents.',                           null, 5),
  ('00000000-0000-0000-0000-000000000106', 'Office',    'office',    'Desks, chairs, and shelving for the home office.',            null, 6)
on conflict (id) do nothing;


-- -----------------------------------------------------------------------------
-- COLLECTIONS (2)
-- -----------------------------------------------------------------------------
insert into public.collections (id, name, slug, description, cover_image_url, is_featured, sort_order)
values
  ('00000000-0000-0000-0000-000000000201', 'Noir Collection',  'noir-collection',  'Deep tones, sculptural forms, and matte finishes.',   null, true, 1),
  ('00000000-0000-0000-0000-000000000202', 'Ivory Collection', 'ivory-collection', 'Warm neutrals, soft linens, and hand-finished wood.', null, true, 2)
on conflict (id) do nothing;


-- -----------------------------------------------------------------------------
-- PRODUCTS (12)
-- Prices are in naira (NGN), stored as plain numbers.
-- status 'published' means they show up on the public site.
-- -----------------------------------------------------------------------------
insert into public.products (
  id, name, slug, short_description, description,
  category_id, collection_id,
  price, show_price, currency,
  materials, dimensions, lead_time,
  is_featured, status
)
values
  -- ---- Living ----
  (
    '00000000-0000-0000-0000-000000001001',
    'Adaeze Three-Seater Sofa',
    'adaeze-three-seater-sofa',
    'A low-profile sofa with deep seats and a matte, hand-finished frame.',
    'The Adaeze is built around a hardwood frame and finished in a matte oil that lets the natural grain show through. Deep seats, a firm sit, and a low profile give it a quiet, grounded presence in the room. Upholstered in a Belgian linen blend.',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000201',
    2450000.00, true, 'NGN',
    'Solid iroko hardwood frame, Belgian linen blend upholstery, high-resilience foam, feather-wrapped seat cushions',
    '220cm W x 95cm D x 72cm H',
    '10 to 12 weeks',
    true, 'published'
  ),
  (
    '00000000-0000-0000-0000-000000001002',
    'Obi Armchair',
    'obi-armchair',
    'A sculptural armchair with a soft, curved back and slim legs.',
    'The Obi pairs a curved back with a deep, comfortable seat. Its silhouette is soft from every angle, which makes it work equally well as a reading chair or as a pair framing a coffee table.',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000202',
    950000.00, true, 'NGN',
    'Solid oak frame, boucle upholstery, foam seat cushion',
    '78cm W x 82cm D x 76cm H',
    '8 to 10 weeks',
    true, 'published'
  ),
  (
    '00000000-0000-0000-0000-000000001003',
    'Ile Coffee Table',
    'ile-coffee-table',
    'A low, sculptural coffee table in solid oak with a hand-rubbed finish.',
    'The Ile is one solid piece of oak, sculpted into a gentle curve. The top is generous enough for books and a tray; the base is quiet enough that it almost disappears in the room.',
    '00000000-0000-0000-0000-000000000101',
    null,
    620000.00, true, 'NGN',
    'Solid European oak, hand-rubbed natural oil finish',
    '140cm W x 70cm D x 32cm H',
    '6 to 8 weeks',
    false, 'published'
  ),

  -- ---- Dining ----
  (
    '00000000-0000-0000-0000-000000001004',
    'Kano Dining Table',
    'kano-dining-table',
    'A solid oak dining table for eight, with a hand-planed top.',
    'The Kano is built to be the centre of a home. A solid oak top, hand-planed and finished with a food-safe oil, sits on a sturdy trestle base. Seats eight comfortably.',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000201',
    1850000.00, true, 'NGN',
    'Solid European oak, hand-planed top, food-safe oil finish',
    '240cm W x 100cm D x 75cm H',
    '10 to 12 weeks',
    true, 'published'
  ),
  (
    '00000000-0000-0000-0000-000000001005',
    'Amara Dining Chair',
    'amara-dining-chair',
    'A slim dining chair with a woven cane back and a leather seat.',
    'The Amara brings a lightness to a dining room. The cane back keeps the silhouette open; the leather seat softens the look. Stacks two high.',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000202',
    325000.00, true, 'NGN',
    'Solid ash frame, hand-woven cane back, full-grain leather seat',
    '48cm W x 52cm D x 82cm H',
    '8 to 10 weeks',
    false, 'published'
  ),

  -- ---- Bedroom ----
  (
    '00000000-0000-0000-0000-000000001006',
    'Ife Bed (King)',
    'ife-bed-king',
    'A low platform bed with an upholstered headboard and a solid wood base.',
    'The Ife sits low to the floor and feels calm and grounded. The headboard is upholstered in a linen blend, and the frame is solid oak. Fits a standard king mattress.',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000201',
    1650000.00, true, 'NGN',
    'Solid oak frame, Belgian linen blend headboard, plywood slats',
    '200cm W x 215cm D x 90cm H (fits 200x200 mattress)',
    '10 to 12 weeks',
    true, 'published'
  ),
  (
    '00000000-0000-0000-0000-000000001007',
    'Chidi Nightstand',
    'chidi-nightstand',
    'A small nightstand with two soft-close drawers and a solid oak top.',
    'The Chidi has two soft-close drawers, dovetail joints, and a solid oak top. Small enough for tight spaces, sturdy enough to hold a lamp, a book, and a glass of water.',
    '00000000-0000-0000-0000-000000000103',
    null,
    285000.00, true, 'NGN',
    'Solid oak top, oak veneer carcass, dovetail drawer joints, brass hardware',
    '50cm W x 40cm D x 55cm H',
    '6 to 8 weeks',
    false, 'published'
  ),

  -- ---- Lighting ----
  (
    '00000000-0000-0000-0000-000000001008',
    'Lagos Floor Lamp',
    'lagos-floor-lamp',
    'A sculptural floor lamp with a linen shade and a slim brass stem.',
    'The Lagos stands tall and quiet. A slim brass stem, a wide linen shade, and a warm bulb. Casts the kind of light you actually want to sit under at the end of a day.',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000202',
    420000.00, true, 'NGN',
    'Solid brass stem, natural linen shade, weighted marble base',
    '40cm W x 40cm D x 165cm H',
    '4 to 6 weeks',
    true, 'published'
  ),
  (
    '00000000-0000-0000-0000-000000001009',
    'Zaria Pendant',
    'zaria-pendant',
    'A hand-thrown ceramic pendant that throws a soft, downward light.',
    'The Zaria is thrown by hand, so no two are exactly the same. The clay filters the light into a soft, warm pool. Comes with 2 metres of braided fabric cord.',
    '00000000-0000-0000-0000-000000000104',
    null,
    185000.00, true, 'NGN',
    'Hand-thrown stoneware, braided fabric cord, brass fittings',
    '35cm W x 35cm D x 30cm H',
    '4 to 6 weeks',
    false, 'published'
  ),

  -- ---- Decor ----
  (
    '00000000-0000-0000-0000-000000001010',
    'Imani Mirror',
    'imani-mirror',
    'A round mirror with a hand-rubbed oak frame.',
    'The Imani is a simple round mirror with a slim oak frame. Hung above a console or a bed, it quietly opens a room up.',
    '00000000-0000-0000-0000-000000000105',
    null,
    245000.00, true, 'NGN',
    'Solid oak frame, hand-rubbed oil finish, 5mm glass',
    '90cm diameter x 4cm depth',
    '4 to 6 weeks',
    false, 'published'
  ),
  (
    '00000000-0000-0000-0000-000000001011',
    'Bola Vase',
    'bola-vase',
    'A tall, hand-thrown stoneware vase in a warm sand glaze.',
    'The Bola is made to be used. Tall enough for long stems, heavy enough that it won''t tip. The sand glaze is soft to the touch and varies slightly from piece to piece.',
    '00000000-0000-0000-0000-000000000105',
    '00000000-0000-0000-0000-000000000202',
    95000.00, true, 'NGN',
    'Hand-thrown stoneware, food-safe sand glaze',
    '18cm W x 18cm D x 45cm H',
    '2 to 4 weeks',
    false, 'published'
  ),

  -- ---- Office (this one is DRAFT on purpose, to test that drafts stay hidden) ----
  (
    '00000000-0000-0000-0000-000000001012',
    'Tunde Writing Desk',
    'tunde-writing-desk',
    'A slim writing desk with a single leather-lined drawer.',
    'The Tunde is a compact desk for a home office. Solid oak legs, a slim top, and one shallow drawer lined in leather. Built for a laptop, a lamp, and a notebook. DRAFT - not visible on the public site yet.',
    '00000000-0000-0000-0000-000000000106',
    null,
    780000.00, true, 'NGN',
    'Solid oak legs, oak veneer top, leather-lined drawer',
    '120cm W x 55cm D x 75cm H',
    '8 to 10 weeks',
    false, 'draft'
  )
on conflict (id) do nothing;


-- -----------------------------------------------------------------------------
-- PRODUCT IMAGES
-- -----------------------------------------------------------------------------
-- Intentionally left empty. Add images through the admin panel in Phase 4.
-- The site will show a "no image" placeholder in the meantime.


-- -----------------------------------------------------------------------------
-- PROJECTS (3)
-- -----------------------------------------------------------------------------
insert into public.projects (
  id, title, slug, client_name, location, year,
  summary, description, cover_image_url, is_featured, status
)
values
  (
    '00000000-0000-0000-0000-000000000301',
    'Ikoyi Apartment',
    'ikoyi-apartment',
    'The Adeyemi Family',
    'Ikoyi, Lagos',
    2024,
    'A full renovation of a three-bedroom apartment overlooking the lagoon.',
    'A complete renovation of a 1970s apartment in Ikoyi. We opened up the main living space, refinished the original parquet, and furnished the apartment with a mix of bespoke pieces and carefully chosen vintage finds. The brief was simple: a home that feels calm and works hard.',
    null, true, 'published'
  ),
  (
    '00000000-0000-0000-0000-000000000302',
    'Lekki Beach House',
    'lekki-beach-house',
    'Private Client',
    'Lekki, Lagos',
    2024,
    'A relaxed family beach house furnished almost entirely in natural materials.',
    'A five-bedroom beach house on the Lekki peninsula. The client wanted a place where the family could walk in from the water and not worry about the furniture. Everything is either solid wood, hand-woven, or washable. We worked with local craftspeople for the larger pieces.',
    null, true, 'published'
  ),
  (
    '00000000-0000-0000-0000-000000000303',
    'Abuja Corporate Lounge',
    'abuja-corporate-lounge',
    'Meridian Group',
    'Maitama, Abuja',
    2023,
    'A quiet, generous reception lounge for a corporate headquarters.',
    'A reception and waiting lounge for a corporate headquarters in Maitama. The brief was a space that felt calm and generous rather than corporate and cold. We designed a low, wraparound seating arrangement with custom lighting and commissioned a series of framed prints from a Nigerian artist.',
    null, false, 'published'
  )
on conflict (id) do nothing;


-- -----------------------------------------------------------------------------
-- PROJECT IMAGES
-- -----------------------------------------------------------------------------
-- Empty on purpose. Add images through the admin panel in Phase 4.


-- -----------------------------------------------------------------------------
-- PROJECT <-> PRODUCT LINKS
-- -----------------------------------------------------------------------------
-- Links the products used in each project. The public site uses these links
-- to connect a project back to the shop.
insert into public.project_products (project_id, product_id)
values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000001001'), -- Ikoyi -> Adaeze Sofa
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000001003'), -- Ikoyi -> Ile Coffee Table
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000001008'), -- Ikoyi -> Lagos Floor Lamp
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000001002'), -- Lekki -> Obi Armchair
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000001011'), -- Lekki -> Bola Vase
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000001002'), -- Abuja -> Obi Armchair
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000001008')  -- Abuja -> Lagos Floor Lamp
on conflict (project_id, product_id) do nothing;


-- -----------------------------------------------------------------------------
-- TESTIMONIALS (3)
-- -----------------------------------------------------------------------------
insert into public.testimonials (id, author_name, author_title, quote, project_id, is_visible, sort_order)
values
  (
    '00000000-0000-0000-0000-000000000401',
    'Mrs. F. Adeyemi',
    'Ikoyi Apartment',
    'The team understood exactly how we wanted to live in the space. Every piece has a reason to be there.',
    '00000000-0000-0000-0000-000000000301',
    true, 1
  ),
  (
    '00000000-0000-0000-0000-000000000402',
    'Mr. O. Balogun',
    'Lekki Beach House',
    'They listened to how our family actually uses the house, and delivered a home that feels lived in from day one.',
    '00000000-0000-0000-0000-000000000302',
    true, 2
  ),
  (
    '00000000-0000-0000-0000-000000000403',
    'Meridian Group',
    'Abuja',
    'A calm, considered space that our clients consistently comment on. Worth every conversation.',
    '00000000-0000-0000-0000-000000000303',
    true, 3
  )
on conflict (id) do nothing;


-- -----------------------------------------------------------------------------
-- SITE SETTINGS
-- -----------------------------------------------------------------------------
-- Key-value store. The public site reads these by key.
-- The admin panel (Phase 4) gives you a form to edit these.
insert into public.site_settings (key, value) values
  ('brand_name',        'Deval Luxury'),
  ('tagline',           'Interiors and furniture, made in Nigeria.'),
  ('hero_headline',     'Rooms made to be lived in.'),
  ('hero_subheadline',  'A design studio and furniture atelier based in Lagos. We design interiors and build the pieces that fill them.'),
  ('hero_image_url',    ''),
  ('about_title',       'A studio and a workshop.'),
  ('about_body',        'Deval Luxury is two businesses under one roof: an interior design studio and a furniture atelier. We take on a small number of projects each year so we can give each one the attention it deserves. Everything we make is built in our Lagos workshop, by people we know by name.'),
  ('about_image_url',   ''),
  ('address',           'Lagos, Nigeria'),
  ('phone',             '+234 800 000 0000'),
  ('email',             'hello@devalluxury.com'),
  ('whatsapp_number',   ''),
  ('instagram_url',     'https://instagram.com/'),
  ('facebook_url',      ''),
  ('city',              'Benin City'),
  ('service_areas',     'Benin City, Lagos, Abuja'),
  ('opening_hours',     'Mo-Fr 09:00-18:00, Sa 10:00-14:00')
on conflict (key) do nothing;


-- =============================================================================
-- Done.
-- Next step: create the admin user in Supabase Auth (see instructions in chat).
-- =============================================================================