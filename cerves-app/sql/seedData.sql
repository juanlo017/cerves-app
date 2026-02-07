-- ============================================================================
-- SEED DATA (Sample drinks)
-- ============================================================================

INSERT INTO drinks (name, category, liters_per_unit, kcal_per_unit, eur_per_unit, is_active) VALUES
-- Beers
('Cerveza Estrella Galicia', 'beer', 0.330, 142, 1.20, true),
('Cerveza Mahou', 'beer', 0.330, 139, 1.00, true),
('Cerveza Cruzcampo', 'beer', 0.330, 140, 0.90, true),
('Cerveza Alhambra', 'beer', 0.330, 148, 1.50, true),
('Cerveza San Miguel', 'beer', 0.330, 144, 1.10, true),

-- Wine
('Vino Tinto Copa', 'wine', 0.150, 125, 2.50, true),
('Vino Blanco Copa', 'wine', 0.150, 121, 2.50, true),
('Vino Rosado Copa', 'wine', 0.150, 120, 2.50, true),

-- Cocktails
('Gin Tonic', 'cocktail', 0.250, 200, 7.00, true),
('Mojito', 'cocktail', 0.300, 217, 6.50, true),
('Margarita', 'cocktail', 0.200, 168, 7.50, true),
('Cubata (Ron Cola)', 'cocktail', 0.250, 220, 6.00, true),

-- Spirits
('Chupito', 'spirit', 0.040, 97, 2.00, true),
('Whisky', 'spirit', 0.050, 110, 5.00, true),

-- Soft drinks
('Coca Cola', 'soft', 0.330, 139, 2.00, true),
('Fanta Naranja', 'soft', 0.330, 145, 2.00, true),
('Agua Mineral', 'soft', 0.500, 0, 1.50, true),
('Zumo Natural', 'soft', 0.200, 90, 3.00, true);