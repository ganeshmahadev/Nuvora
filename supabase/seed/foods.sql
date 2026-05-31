-- Seed: global food catalog (50+ common foods, all per 100g basis)
-- created_by = null means global catalog entry

insert into public.foods (name, brand, calories_per_100g, protein_g, carb_g, fat_g, fiber_g, sodium_mg, is_verified) values
-- Proteins
('Chicken Breast (cooked)',    null, 165,  31.0,  0.0,  3.6,  0.0,  74.0,  true),
('Turkey Breast (cooked)',     null, 135,  30.0,  0.0,  1.5,  0.0,  64.0,  true),
('Salmon (cooked)',            null, 208,  20.0,  0.0, 13.0,  0.0,  59.0,  true),
('Tuna (canned in water)',     null, 116,  26.0,  0.0,  0.8,  0.0, 337.0,  true),
('Cod (cooked)',               null, 105,  23.0,  0.0,  0.9,  0.0,  78.0,  true),
('Shrimp (cooked)',            null,  99,  24.0,  0.2,  0.3,  0.0, 111.0,  true),
('Beef (lean ground, cooked)', null, 215,  26.0,  0.0, 12.0,  0.0,  76.0,  true),
('Beef Steak (cooked)',        null, 271,  26.0,  0.0, 18.0,  0.0,  59.0,  true),
('Pork Tenderloin (cooked)',   null, 143,  26.0,  0.0,  4.0,  0.0,  62.0,  true),
('Whole Egg',                  null, 155,  13.0,  1.1, 11.0,  0.0, 124.0,  true),
('Egg White',                  null,  52,  11.0,  0.7,  0.2,  0.0, 166.0,  true),

-- Dairy
('Milk (whole)',               null,  61,   3.2,  4.8,  3.3,  0.0,  44.0,  true),
('Milk (2%)',                  null,  50,   3.4,  4.8,  1.9,  0.0,  47.0,  true),
('Greek Yogurt (full-fat)',    null,  97,   9.0,  3.6,  5.0,  0.0,  36.0,  true),
('Greek Yogurt (non-fat)',     null,  59,  10.0,  3.6,  0.4,  0.0,  36.0,  true),
('Cottage Cheese',             null,  98,  11.0,  3.4,  4.3,  0.0, 364.0,  true),
('Cheddar Cheese',             null, 402,  25.0,  1.3, 33.0,  0.0, 621.0,  true),
('Mozzarella',                 null, 280,  28.0,  2.2, 17.0,  0.0, 627.0,  true),
('Butter',                     null, 717,   0.9,  0.1, 81.0,  0.0, 714.0,  true),

-- Legumes & Plant Protein
('Tofu (firm)',                null,  76,   8.0,  2.0,  4.8,  0.4,   7.0,  true),
('Edamame',                    null, 121,  11.0,  9.0,  5.2,  5.0,   6.0,  true),
('Lentils (cooked)',           null, 116,   9.0, 20.0,  0.4,  7.9,   2.0,  true),
('Chickpeas (cooked)',         null, 164,   8.9, 27.0,  2.6,  7.6,  24.0,  true),
('Black Beans (cooked)',       null, 132,   8.9, 24.0,  0.5,  8.7,   1.0,  true),
('Hummus',                     null, 177,   8.0, 14.0, 10.0,  6.0, 379.0,  true),

-- Grains & Carbs
('White Rice (cooked)',        null, 130,   2.7, 28.0,  0.3,  0.4,   1.0,  true),
('Brown Rice (cooked)',        null, 112,   2.6, 24.0,  0.9,  1.8,   1.0,  true),
('Oats (dry)',                 null, 389,  17.0, 66.0,  7.0, 10.6,   2.0,  true),
('Quinoa (cooked)',            null, 120,   4.4, 22.0,  1.9,  2.8,   7.0,  true),
('Pasta (cooked)',             null, 158,   5.8, 31.0,  0.9,  1.8,   1.0,  true),
('Bread (whole wheat)',        null, 247,  13.0, 41.0,  4.2,  7.0, 400.0,  true),
('Bagel',                      null, 245,   9.8, 48.0,  1.5,  2.1, 430.0,  true),
('White Potato',               null,  77,   2.0, 17.0,  0.1,  2.2,   6.0,  true),
('Sweet Potato',               null,  86,   1.6, 20.0,  0.1,  3.0,  55.0,  true),

-- Fruits
('Banana',                     null,  89,   1.1, 23.0,  0.3,  2.6,   1.0,  true),
('Apple',                      null,  52,   0.3, 14.0,  0.2,  2.4,   1.0,  true),
('Orange',                     null,  47,   0.9, 12.0,  0.1,  2.4,   0.0,  true),
('Blueberries',                null,  57,   0.7, 14.0,  0.3,  2.4,   1.0,  true),
('Strawberries',               null,  32,   0.7,  7.7,  0.3,  2.0,   1.0,  true),
('Avocado',                    null, 160,   2.0,  9.0, 15.0,  6.7,   7.0,  true),
('Mango',                      null,  60,   0.8, 15.0,  0.4,  1.6,   1.0,  true),

-- Vegetables
('Broccoli',                   null,  34,   2.8,  6.6,  0.4,  2.6,  33.0,  true),
('Spinach',                    null,  23,   2.9,  3.6,  0.4,  2.2,  79.0,  true),
('Carrots',                    null,  41,   0.9, 10.0,  0.2,  2.8,  69.0,  true),
('Cucumber',                   null,  15,   0.7,  3.6,  0.1,  0.5,   2.0,  true),
('Bell Pepper (red)',          null,  31,   1.0,  6.0,  0.3,  2.1,   4.0,  true),
('Tomato',                     null,  18,   0.9,  3.9,  0.2,  1.2,   5.0,  true),
('Onion',                      null,  40,   1.1,  9.3,  0.1,  1.7,   4.0,  true),

-- Nuts, Seeds & Oils
('Almonds',                    null, 579,  21.0, 22.0, 50.0, 12.5,   1.0,  true),
('Walnuts',                    null, 654,  15.0, 14.0, 65.0,  6.7,   2.0,  true),
('Cashews',                    null, 553,  18.0, 30.0, 44.0,  3.3, 12.0,   true),
('Peanut Butter',              null, 588,  25.0, 20.0, 50.0,  6.0, 152.0,  true),
('Olive Oil',                  null, 884,   0.0,  0.0,100.0,  0.0,   0.0,  true),
('Coconut Oil',                null, 862,   0.0,  0.0,100.0,  0.0,   0.0,  true),

-- Other
('Dark Chocolate (70%)',       null, 600,   7.8, 46.0, 43.0, 10.9,  20.0,  true),
('Orange Juice',               null,  45,   0.7, 10.0,  0.2,  0.2,   1.0,  true)

on conflict do nothing;
