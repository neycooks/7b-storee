type ShopItemType = 'item' | 'gamepass' | 'shirt' | 'pants';

export function normalizeShopItemType(raw: string | null | undefined): ShopItemType {
  const value = (raw || '').toLowerCase().trim();

  if (value === 'gamepass' || value === 'pass') return 'gamepass';
  if (value === 'item' || value === 'asset' || value === 'clothing' || value === 'tshirt' || value === 'accessory') return 'item';
  if (value === 'shirt') return 'shirt';
  if (value === 'pants' || value === 'trousers') return 'pants';

  return 'item';
}
