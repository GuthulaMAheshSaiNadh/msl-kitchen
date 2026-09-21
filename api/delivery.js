const { getSupabase } = require('../lib/supabase');

function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => value * Math.PI / 180;
  const earthRadius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return res.status(400).json({ error: 'Valid latitude and longitude are required' });
    const supabase = getSupabase();
    const { data: kitchen, error: kitchenError } = await supabase.from('kitchens').select('latitude,longitude,name,address').eq('slug', 'msl-kitchen-gachibowli').eq('active', true).single();
    if (kitchenError) throw kitchenError;
    const distance = Number(distanceKm(Number(kitchen.latitude), Number(kitchen.longitude), latitude, longitude).toFixed(2));
    const { data: slabs, error: slabError } = await supabase.from('delivery_slabs').select('min_km,max_km,fee_inr').eq('active', true).order('display_order');
    if (slabError) throw slabError;
    const slab = (slabs || []).find((item) => distance >= Number(item.min_km) && (item.max_km == null || distance < Number(item.max_km)));
    if (!slab) return res.status(400).json({ error: 'Outside delivery zone', distance_km: distance, available_until_km: Math.max(...(slabs || []).map((x) => Number(x.max_km || 0))) });
    res.status(200).json({ available: true, distance_km: distance, delivery_fee_inr: slab.fee_inr, kitchen });
  } catch (error) {
    res.status(500).json({ error: 'Unable to calculate delivery', detail: error.message });
  }
};
