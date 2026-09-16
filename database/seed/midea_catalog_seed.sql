-- Midea Lighting Catalog Seed Script
-- Auto-generated for SwiftSale

BEGIN;

-- 1. Insert Categories
INSERT INTO "Categories" ("Id", "Name", "Description") VALUES ('c0000000-0000-0000-0000-000000000001', 'LED A Bulb', 'Midea Lighting LED A Bulb') ON CONFLICT ("Id") DO NOTHING;
INSERT INTO "Categories" ("Id", "Name", "Description") VALUES ('c0000000-0000-0000-0000-000000000002', 'LED T8 Double Ended/Single', 'Midea Lighting LED T8 Double Ended/Single') ON CONFLICT ("Id") DO NOTHING;
INSERT INTO "Categories" ("Id", "Name", "Description") VALUES ('c0000000-0000-0000-0000-000000000003', 'LED T5 Batten', 'Midea Lighting LED T5 Batten') ON CONFLICT ("Id") DO NOTHING;
INSERT INTO "Categories" ("Id", "Name", "Description") VALUES ('c0000000-0000-0000-0000-000000000004', 'LED Big Panel Back-Lit', 'Midea Lighting LED Big Panel Back-Lit') ON CONFLICT ("Id") DO NOTHING;
INSERT INTO "Categories" ("Id", "Name", "Description") VALUES ('c0000000-0000-0000-0000-000000000005', 'LED Flood Light', 'Midea Lighting LED Flood Light') ON CONFLICT ("Id") DO NOTHING;
INSERT INTO "Categories" ("Id", "Name", "Description") VALUES ('c0000000-0000-0000-0000-000000000006', 'LED High-Bay', 'Midea Lighting LED High-Bay') ON CONFLICT ("Id") DO NOTHING;
INSERT INTO "Categories" ("Id", "Name", "Description") VALUES ('c0000000-0000-0000-0000-000000000007', 'LED Solar Flood Light', 'Midea Lighting LED Solar Flood Light') ON CONFLICT ("Id") DO NOTHING;
INSERT INTO "Categories" ("Id", "Name", "Description") VALUES ('c0000000-0000-0000-0000-000000000008', 'LED Street Lights', 'Midea Lighting LED Street Lights') ON CONFLICT ("Id") DO NOTHING;
INSERT INTO "Categories" ("Id", "Name", "Description") VALUES ('c0000000-0000-0000-0000-000000000009', 'LED Round Downlight', 'Midea Lighting LED Round Downlight') ON CONFLICT ("Id") DO NOTHING;
INSERT INTO "Categories" ("Id", "Name", "Description") VALUES ('c0000000-0000-0000-0000-000000000010', 'LED Square Downlight', 'Midea Lighting LED Square Downlight') ON CONFLICT ("Id") DO NOTHING;
INSERT INTO "Categories" ("Id", "Name", "Description") VALUES ('c0000000-0000-0000-0000-000000000011', 'LED Strip Lights', 'Midea Lighting LED Strip Lights') ON CONFLICT ("Id") DO NOTHING;

-- 2. Insert Products and Initial InventoryBalances

-- Product 1: MDL-BUA44505W-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000001', 'MDL-BUA44505W-01', 'LED A Bulb 5W 6500K', 'c0000000-0000-0000-0000-000000000001', 'PCS', 100, 'Power: 5W
Lumens: 480 lm
Color Temp: 6500K', 0.00, 115.80, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000001', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 2: MDL-BUA607W-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000002', 'MDL-BUA607W-01', 'LED A Bulb 7W 6500K', 'c0000000-0000-0000-0000-000000000001', 'PCS', 100, 'Power: 7W
Lumens: 630 lm
Color Temp: 6500K', 0.00, 145.80, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000002', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 3: MDL-BUA609W-01-3K
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000003', 'MDL-BUA609W-01-3K', 'LED A Bulb 9W 3000K', 'c0000000-0000-0000-0000-000000000001', 'PCS', 100, 'Power: 9W
Lumens: 780 lm
Color Temp: 3000K', 0.00, 177.80, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000003', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 4: MDL-BUA609W-01-65K
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000004', 'MDL-BUA609W-01-65K', 'LED A Bulb 9W 6500K', 'c0000000-0000-0000-0000-000000000001', 'PCS', 100, 'Power: 9W
Lumens: 810 lm
Color Temp: 6500K', 0.00, 225.80, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000004', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 5: MDL-BUA6012W-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000005', 'MDL-BUA6012W-01', 'LED A Bulb 12W 6500K', 'c0000000-0000-0000-0000-000000000001', 'PCS', 100, 'Power: 12W
Lumens: 1100 lm
Color Temp: 6500K', 0.00, 225.80, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000005', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 6: MDL-BUA6015W-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000006', 'MDL-BUA6015W-01', 'LED A Bulb 15W 6500K', 'c0000000-0000-0000-0000-000000000001', 'PCS', 100, 'Power: 15W
Lumens: 1500 lm
Color Temp: 6500K', 0.00, 285.80, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000006', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 7: MDL-TUT809W-06
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000007', 'MDL-TUT809W-06', 'LED T8 Tube 9W 6500K', 'c0000000-0000-0000-0000-000000000002', 'PCS', 25, 'Power: 9W
Lumens: 480 lm
Color Temp: 6500K', 0.00, 169.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000007', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 8: MDL-TUT818W-07
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000008', 'MDL-TUT818W-07', 'LED T8 Tube 18W 6500K', 'c0000000-0000-0000-0000-000000000002', 'PCS', 25, 'Power: 18W
Lumens: 630 lm
Color Temp: 6500K', 0.00, 229.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000008', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 9: MDL-TUT818W-S6/O
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000009', 'MDL-TUT818W-S6/O', 'LED T8 Tube 18W 6500K (S6/O)', 'c0000000-0000-0000-0000-000000000002', 'PCS', 25, 'Power: 18W
Lumens: 780 lm
Color Temp: 6500K', 0.00, 229.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000009', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 10: MDL-FITT812R18W-02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000010', 'MDL-FITT812R18W-02', 'T8 Bracket Single Type 12W 1.2m', 'c0000000-0000-0000-0000-000000000002', 'PCS', 12, 'Power: 12W
Lumens: 810 lm
Color Temp: 6500K
Size: 1.2m / 4 FT', 0.00, 319.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000010', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 11: MDL-FIXT812S
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000011', 'MDL-FIXT812S', 'T8 LED Bracket Single Type 1.2m', 'c0000000-0000-0000-0000-000000000003', 'PCS', 40, 'Type: 1.2m / 4 FT Single Type Bracket', 0.00, 149.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000011', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 12: MDL-FIXT812D
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000012', 'MDL-FIXT812D', 'T8 LED Bracket Double Type 1.2m', 'c0000000-0000-0000-0000-000000000003', 'PCS', 40, 'Type: 1.2m / 4 FT Double Type Bracket', 0.00, 219.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000012', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 13: MDL-FIXT806S
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000013', 'MDL-FIXT806S', 'T8 LED Bracket Single Type 0.6m', 'c0000000-0000-0000-0000-000000000003', 'PCS', 40, 'Type: 0.6m Single Type Bracket', 0.00, 109.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000013', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 14: MDL-FITT503R04W3K-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000014', 'MDL-FITT503R04W3K-01', 'LED T5 Batten 4W 3000K', 'c0000000-0000-0000-0000-000000000003', 'PCS', 25, 'Power: 4W
Lumens: 380 lm
Color Temp: 3000K', 0.00, 179.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000014', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 15: MDL-FITT503R04W4K-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000015', 'MDL-FITT503R04W4K-01', 'LED T5 Batten 4W 4000K', 'c0000000-0000-0000-0000-000000000003', 'PCS', 25, 'Power: 4W
Lumens: 380 lm
Color Temp: 4000K', 0.00, 179.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000015', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 16: MDL-FITT503R04W65K-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000016', 'MDL-FITT503R04W65K-01', 'LED T5 Batten 4W 6500K', 'c0000000-0000-0000-0000-000000000003', 'PCS', 25, 'Power: 4W
Lumens: 380 lm
Color Temp: 6500K', 0.00, 179.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000016', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 17: MDL-FITT506R07W3K-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000017', 'MDL-FITT506R07W3K-01', 'LED T5 Batten 7W 3000K', 'c0000000-0000-0000-0000-000000000003', 'PCS', 25, 'Power: 7W
Lumens: 700 lm
Color Temp: 3000K', 0.00, 229.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000017', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 18: MDL-FITT506R07W4K-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000018', 'MDL-FITT506R07W4K-01', 'LED T5 Batten 7W 4000K', 'c0000000-0000-0000-0000-000000000003', 'PCS', 25, 'Power: 7W
Lumens: 700 lm
Color Temp: 4000K', 0.00, 229.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000018', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 19: MDL-FITT506R07W65K-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000019', 'MDL-FITT506R07W65K-01', 'LED T5 Batten 7W 6500K', 'c0000000-0000-0000-0000-000000000003', 'PCS', 25, 'Power: 7W
Lumens: 700 lm
Color Temp: 6500K', 0.00, 229.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000019', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 20: MDL-FITT509R10W3K-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000020', 'MDL-FITT509R10W3K-01', 'LED T5 Batten 10W 3000K', 'c0000000-0000-0000-0000-000000000003', 'PCS', 25, 'Power: 10W
Lumens: 1000 lm
Color Temp: 3000K', 0.00, 289.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000020', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 21: MDL-FITT509R10W4K-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000021', 'MDL-FITT509R10W4K-01', 'LED T5 Batten 10W 4000K', 'c0000000-0000-0000-0000-000000000003', 'PCS', 25, 'Power: 10W
Lumens: 1000 lm
Color Temp: 4000K', 0.00, 289.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000021', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 22: MDL-FITT509R10W65K-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000022', 'MDL-FITT509R10W65K-01', 'LED T5 Batten 10W 6500K', 'c0000000-0000-0000-0000-000000000003', 'PCS', 25, 'Power: 10W
Lumens: 1000 lm
Color Temp: 6500K', 0.00, 289.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000022', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 23: MDL-FITT512R14W3K-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000023', 'MDL-FITT512R14W3K-01', 'LED T5 Batten 14W 3000K', 'c0000000-0000-0000-0000-000000000003', 'PCS', 25, 'Power: 14W
Lumens: 1400 lm
Color Temp: 3000K', 0.00, 339.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000023', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 24: MDL-FITT512R14W4K-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000024', 'MDL-FITT512R14W4K-01', 'LED T5 Batten 14W 4000K', 'c0000000-0000-0000-0000-000000000003', 'PCS', 25, 'Power: 14W
Lumens: 1400 lm
Color Temp: 4000K', 0.00, 339.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000024', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 25: MDL-FITT512R14W65K-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000025', 'MDL-FITT512R14W65K-01', 'LED T5 Batten 14W 6500K', 'c0000000-0000-0000-0000-000000000003', 'PCS', 25, 'Power: 14W
Lumens: 1400 lm
Color Temp: 6500K', 0.00, 339.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000025', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 26: MDL-PL66B40W-02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000026', 'MDL-PL66B40W-02', 'LED Big Panel Back-Lit 40W 6500K', 'c0000000-0000-0000-0000-000000000004', 'PCS', 6, 'Power: 40W
Lumens: 4000 lm
Color Temp: 6500K', 0.00, 1009.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000026', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 27: MDL-PL612B72W
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000027', 'MDL-PL612B72W', 'LED Big Panel Back-Lit 72W 6500K', 'c0000000-0000-0000-0000-000000000004', 'PCS', 4, 'Power: 72W
Lumens: 7200 lm
Color Temp: 6500K', 0.00, 1589.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000027', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 28: MDL-PL66B40W,PJ-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000028', 'MDL-PL66B40W,PJ-01', 'Surface Mounted Frame 600x600', 'c0000000-0000-0000-0000-000000000004', 'PCS', 25, 'Dimension: 600*600 mm', 0.00, 409.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000028', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 29: MDL-PL66B40W,PJ-02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000029', 'MDL-PL66B40W,PJ-02', 'Surface Mounted Frame 600x1200', 'c0000000-0000-0000-0000-000000000004', 'PCS', 25, 'Dimension: 600*1200 mm', 0.00, 599.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000029', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 30: MDL-PLAC
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000030', 'MDL-PLAC', 'Panel Light Accessory Clip (4 clips/8 screws)', 'c0000000-0000-0000-0000-000000000004', 'SET', 4, 'Packaging: 4 clips / 8 screws', 0.00, 99.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000030', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 31: MDL-FLF20W65-03
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000031', 'MDL-FLF20W65-03', 'LED Flood Light 20W 6500K', 'c0000000-0000-0000-0000-000000000005', 'PCS', 40, 'Power: 20W
Lumens: 1800 lm
Color Temp: 6500K', 0.00, 898.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000031', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 32: MDL-FLF50W65-03
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000032', 'MDL-FLF50W65-03', 'LED Flood Light 50W 6500K', 'c0000000-0000-0000-0000-000000000005', 'PCS', 16, 'Power: 50W
Lumens: 4500 lm
Color Temp: 6500K', 0.00, 1308.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000032', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 33: MDL-FLF100W65-03
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000033', 'MDL-FLF100W65-03', 'LED Flood Light 100W 6500K', 'c0000000-0000-0000-0000-000000000005', 'PCS', 10, 'Power: 100W
Lumens: 9000 lm
Color Temp: 6500K', 0.00, 1888.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000033', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 34: MDL-FLF150W65-03
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000034', 'MDL-FLF150W65-03', 'LED Flood Light 150W 6500K', 'c0000000-0000-0000-0000-000000000005', 'PCS', 5, 'Power: 150W
Lumens: 13500 lm
Color Temp: 6500K', 0.00, 3688.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000034', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 35: MDL-FLF200W65-03
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000035', 'MDL-FLF200W65-03', 'LED Flood Light 200W 6500K', 'c0000000-0000-0000-0000-000000000005', 'PCS', 4, 'Power: 200W
Lumens: 18000 lm
Color Temp: 6500K', 0.00, 4788.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000035', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 36: MDL-HB100W65-03
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000036', 'MDL-HB100W65-03', 'LED High-Bay 100W 6500K', 'c0000000-0000-0000-0000-000000000006', 'PCS', 8, 'Power: 100W
Lumens: 12000 lm
Color Temp: 6500K', 0.00, 3999.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000036', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 37: MDL-HB200W65-03
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000037', 'MDL-HB200W65-03', 'LED High-Bay 200W 6500K', 'c0000000-0000-0000-0000-000000000006', 'PCS', 4, 'Power: 200W
Lumens: 18000 lm
Color Temp: 6500K', 0.00, 6998.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000037', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 38: MDL-FLSF100W
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000038', 'MDL-FLSF100W', 'LED Solar Flood Light 100W 6500K', 'c0000000-0000-0000-0000-000000000007', 'PCS', 10, 'Power: 100W
Lumens: 1200 lm
Color Temp: 6500K', 0.00, 2299.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000038', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 39: MDL-FLSF200W
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000039', 'MDL-FLSF200W', 'LED Solar Flood Light 200W 6500K', 'c0000000-0000-0000-0000-000000000007', 'PCS', 10, 'Power: 200W
Lumens: 2700 lm
Color Temp: 6500K', 0.00, 3399.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000039', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 40: MDL-FLSF300W
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000040', 'MDL-FLSF300W', 'LED Solar Flood Light 300W 6500K', 'c0000000-0000-0000-0000-000000000007', 'PCS', 5, 'Power: 300W
Lumens: 4100 lm
Color Temp: 6500K', 0.00, 4399.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000040', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 41: MDL-SLS50W-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000041', 'MDL-SLS50W-01', 'LED Street Light 50W 6500K', 'c0000000-0000-0000-0000-000000000008', 'PCS', 20, 'Power: 50W
Lumens: 600 lm
Color Temp: 6500K', 0.00, 1199.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000041', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 42: MDL-SLS100W-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000042', 'MDL-SLS100W-01', 'LED Street Light 100W 6500K', 'c0000000-0000-0000-0000-000000000008', 'PCS', 10, 'Power: 100W
Lumens: 1200 lm
Color Temp: 6500K', 0.00, 1599.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000042', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 43: MDL-SLS200W-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000043', 'MDL-SLS200W-01', 'LED Street Light 200W 6500K', 'c0000000-0000-0000-0000-000000000008', 'PCS', 10, 'Power: 200W
Lumens: 1800 lm
Color Temp: 6500K', 0.00, 1949.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000043', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 44: MDL-SLS300W-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000044', 'MDL-SLS300W-01', 'LED Street Light 300W 6500K', 'c0000000-0000-0000-0000-000000000008', 'PCS', 8, 'Power: 300W
Lumens: 2250 lm
Color Temp: 6500K', 0.00, 2399.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000044', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 45: MDL-SLS-01.PJ1
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000045', 'MDL-SLS-01.PJ1', 'Solar Street Light Installation Arm Small', 'c0000000-0000-0000-0000-000000000008', 'PCS', 24, 'Size: Small Installation Arm', 0.00, 299.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000045', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 46: MDL-SLS-01.PJ2
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000046', 'MDL-SLS-01.PJ2', 'Solar Street Light Installation Arm Medium', 'c0000000-0000-0000-0000-000000000008', 'PCS', 25, 'Size: Medium Installation Arm', 0.00, 299.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000046', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 47: MDL-SLS-01.PJ3
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000047', 'MDL-SLS-01.PJ3', 'Solar Street Light Installation Arm Large', 'c0000000-0000-0000-0000-000000000008', 'PCS', 25, 'Size: Large Installation Arm', 0.00, 299.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000047', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 48: MDL-DL04R06W3K-02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000048', 'MDL-DL04R06W3K-02', 'LED Round Downlight 6W 3000K', 'c0000000-0000-0000-0000-000000000009', 'PCS', 40, 'Power: 6W
Lumens: 480 lm
Color Temp: 3000K', 0.00, 225.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000048', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 49: MDL-DL04R06W65K-02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000049', 'MDL-DL04R06W65K-02', 'LED Round Downlight 6W 6500K', 'c0000000-0000-0000-0000-000000000009', 'PCS', 40, 'Power: 6W
Lumens: 480 lm
Color Temp: 6500K', 0.00, 225.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000049', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 50: MDL-DL25R04W-03A
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000050', 'MDL-DL25R04W-03A', 'LED Round Downlight 4W CCT', 'c0000000-0000-0000-0000-000000000009', 'PCS', 40, 'Power: 4W
Lumens: 290 lm
Color Temp: CCT', 0.00, 199.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000050', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 51: MDL-DL40R010W 03A
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000051', 'MDL-DL40R010W 03A', 'LED Round Downlight 10W CCT', 'c0000000-0000-0000-0000-000000000009', 'PCS', 40, 'Power: 10W
Lumens: 900 lm
Color Temp: CCT', 0.00, 345.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000051', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 52: MDL-DL06R12W3K-02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000052', 'MDL-DL06R12W3K-02', 'LED Round Downlight 12W 3000K', 'c0000000-0000-0000-0000-000000000009', 'PCS', 40, 'Power: 12W
Lumens: 960 lm
Color Temp: 3000K', 0.00, 385.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000052', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 53: MDL-DL06R12W65K 02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000053', 'MDL-DL06R12W65K 02', 'LED Round Downlight 12W 6500K', 'c0000000-0000-0000-0000-000000000009', 'PCS', 40, 'Power: 12W
Lumens: 960 lm
Color Temp: 6500K', 0.00, 385.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000053', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 54: MDL-DL06R16W65K 02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000054', 'MDL-DL06R16W65K 02', 'LED Round Downlight 16W 6500K', 'c0000000-0000-0000-0000-000000000009', 'PCS', 40, 'Power: 16W
Lumens: 1280 lm
Color Temp: 6500K', 0.00, 425.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000054', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 55: MDL-DL08R24W65K 02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000055', 'MDL-DL08R24W65K 02', 'LED Round Downlight 24W 6500K', 'c0000000-0000-0000-0000-000000000009', 'PCS', 20, 'Power: 24W
Lumens: 1920 lm
Color Temp: 6500K', 0.00, 625.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000055', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 56: MDSMR-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000056', 'MDSMR-01', 'Surface Mounted Frame Round 4.0 Inch', 'c0000000-0000-0000-0000-000000000009', 'PCS', 10, 'Size: 4.0 Inch Round Frame', 0.00, 59.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000056', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 57: MDSMR-02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000057', 'MDSMR-02', 'Surface Mounted Frame Round 6.0 Inch', 'c0000000-0000-0000-0000-000000000009', 'PCS', 10, 'Size: 6.0 Inch Round Frame', 0.00, 89.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000057', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 58: MDSMR-03
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000058', 'MDSMR-03', 'Surface Mounted Frame Round 8.0 Inch', 'c0000000-0000-0000-0000-000000000009', 'PCS', 10, 'Size: 8.0 Inch Round Frame', 0.00, 119.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000058', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 59: MDL-DL04S06W3K-02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000059', 'MDL-DL04S06W3K-02', 'LED Square Downlight 6W 3000K', 'c0000000-0000-0000-0000-000000000010', 'PCS', 40, 'Power: 6W
Lumens: 480 lm
Color Temp: 3000K', 0.00, 235.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000059', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 60: MDL-DL04S06W65K-02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000060', 'MDL-DL04S06W65K-02', 'LED Square Downlight 6W 6500K', 'c0000000-0000-0000-0000-000000000010', 'PCS', 40, 'Power: 6W
Lumens: 480 lm
Color Temp: 6500K', 0.00, 235.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000060', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 61: MDL-DL06S12W3K-02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000061', 'MDL-DL06S12W3K-02', 'LED Square Downlight 12W 3000K', 'c0000000-0000-0000-0000-000000000010', 'PCS', 40, 'Power: 12W
Lumens: 960 lm
Color Temp: 3000K', 0.00, 395.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000061', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 62: MDL-DL06S12W65K-02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000062', 'MDL-DL06S12W65K-02', 'LED Square Downlight 12W 6500K', 'c0000000-0000-0000-0000-000000000010', 'PCS', 40, 'Power: 12W
Lumens: 960 lm
Color Temp: 6500K', 0.00, 395.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000062', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 63: MDL-DL06S16W3K-02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000063', 'MDL-DL06S16W3K-02', 'LED Square Downlight 16W 3000K', 'c0000000-0000-0000-0000-000000000010', 'PCS', 40, 'Power: 16W
Lumens: 1280 lm
Color Temp: 3000K', 0.00, 435.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000063', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 64: MDL-DL06S16W65K-02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000064', 'MDL-DL06S16W65K-02', 'LED Square Downlight 16W 6500K', 'c0000000-0000-0000-0000-000000000010', 'PCS', 40, 'Power: 16W
Lumens: 1280 lm
Color Temp: 6500K', 0.00, 435.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000064', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 65: MDL-DL08S24W3K-02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000065', 'MDL-DL08S24W3K-02', 'LED Square Downlight 24W 3000K', 'c0000000-0000-0000-0000-000000000010', 'PCS', 20, 'Power: 24W
Lumens: 1920 lm
Color Temp: 3000K', 0.00, 635.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000065', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 66: MDL-DL08S24W65K-02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000066', 'MDL-DL08S24W65K-02', 'LED Square Downlight 24W 6500K', 'c0000000-0000-0000-0000-000000000010', 'PCS', 20, 'Power: 24W
Lumens: 1920 lm
Color Temp: 6500K', 0.00, 635.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000066', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 67: MDSMS-01
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000067', 'MDSMS-01', 'Surface Mounted Frame Square 4.0 Inch', 'c0000000-0000-0000-0000-000000000010', 'PCS', 10, 'Size: 4.0 Inch Square Frame', 0.00, 63.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000067', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 68: MDSMS-02
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000068', 'MDSMS-02', 'Surface Mounted Frame Square 6.0 Inch', 'c0000000-0000-0000-0000-000000000010', 'PCS', 10, 'Size: 6.0 Inch Square Frame', 0.00, 93.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000068', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 69: MDSMS-03
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000069', 'MDSMS-03', 'Surface Mounted Frame Square 8.0 Inch', 'c0000000-0000-0000-0000-000000000010', 'PCS', 10, 'Size: 8.0 Inch Square Frame', 0.00, 123.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000069', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 70: MDL-STS12W-3K
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000070', 'MDL-STS12W-3K', 'LED Soft Strip Light 12W 3000K (50m)', 'c0000000-0000-0000-0000-000000000011', 'ROLL', 2, 'Power: 12W
Lumens: 480 lm
Color Temp: 3000K
Packaging: 50m / 1 Ctn', 0.00, 11450.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000070', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 71: MDL-STS12W-4K
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000071', 'MDL-STS12W-4K', 'LED Soft Strip Light 12W 4000K (50m)', 'c0000000-0000-0000-0000-000000000011', 'ROLL', 2, 'Power: 12W
Lumens: 960 lm
Color Temp: 4000K
Packaging: 50m / 1 Ctn', 0.00, 11450.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000071', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 72: MDL-STS12W-65K
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000072', 'MDL-STS12W-65K', 'LED Soft Strip Light 12W 6500K (50m)', 'c0000000-0000-0000-0000-000000000011', 'ROLL', 2, 'Power: 12W
Lumens: 1280 lm
Color Temp: 6500K
Packaging: 50m / 1 Ctn', 0.00, 11450.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000072', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

-- Product 73: MDL-ST01ZW 03.PJ-1
INSERT INTO "Products" ("Id", "SKU", "Name", "CategoryId", "UnitIdentifier", "PiecesPerBox", "Description", "CostPrice", "SellingPrice", "ReorderLevel", "IsActive", "CreatedAt")
VALUES ('d0000000-0000-0000-0000-000000000073', 'MDL-ST01ZW 03.PJ-1', 'LED Strip Light French Standard Plug', 'c0000000-0000-0000-0000-000000000011', 'PCS', 100, 'Type: French Standard Plug Accessory', 0.00, 175.00, 5, TRUE, NOW() AT TIME ZONE 'UTC')
ON CONFLICT ("SKU") DO UPDATE SET
  "Name" = EXCLUDED."Name",
  "CategoryId" = EXCLUDED."CategoryId",
  "UnitIdentifier" = EXCLUDED."UnitIdentifier",
  "PiecesPerBox" = EXCLUDED."PiecesPerBox",
  "Description" = EXCLUDED."Description",
  "CostPrice" = EXCLUDED."CostPrice",
  "SellingPrice" = EXCLUDED."SellingPrice",
  "ReorderLevel" = EXCLUDED."ReorderLevel",
  "IsActive" = TRUE;

INSERT INTO "InventoryBalances" ("ProductId", "QuantityOnHand", "ReservedQuantity", "AverageCost")
VALUES ('d0000000-0000-0000-0000-000000000073', 0.00, 0.00, 0.00)
ON CONFLICT ("ProductId") DO UPDATE SET
  "QuantityOnHand" = 0.00,
  "ReservedQuantity" = 0.00,
  "AverageCost" = 0.00;

COMMIT;
