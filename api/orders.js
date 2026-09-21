const crypto = require('crypto');
const supabase = require('../lib/supabase');

function deliveryFee(distance, slabs) {
  const slab = slabs.find((item) => distance >= Number(item.min_km) && (item.max_km == null || distance < Number(item.max_km)));
  return slab ? slab.fee_inr : null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    if (!Array.isArray(body.items) || body.items.length === 0) return res.status(400).json({ error: 'Cart is empty' });
    if (!body.address?.house_flat || !body.address?.street_area) return res.status(400).json({ error: 'Delivery address is required' });

    const ids = body.items.map((item) => item.menu_item_id);
    const { data: products, error: productError } = await supabase.from('menu_items').select('id,name,price_inr,available').in('id', ids).eq('active', true).eq('available', true);
    if (productError) throw productError;
    const byId = new Map((products || []).map((item) => [item.id, item]));
    const orderItems = body.items.map((item) => {
      const product = byId.get(item.menu_item_id);
      if (!product) throw new Error('One or more menu items are unavailable');
      const quantity = Math.max(1, Number(item.quantity || 1));
      return { menu_item_id: product.id, item_name: product.name, unit_price_inr: product.price_inr, quantity, customizations: item.customizations || [], line_total_inr: product.price_inr * quantity };
    });
    const subtotal = orderItems.reduce((sum, item) => sum + item.line_total_inr, 0);
    const { data: settings, error: settingsError } = await supabase.from('business_settings').select('*').limit(1).maybeSingle();
    if (settingsError) throw settingsError;
    const { data: slabs, error: slabError } = await supabase.from('delivery_slabs').select('*').eq('active', true).order('display_order');
    if (slabError) throw slabError;
    const distance = Number(body.distance_km || 0);
    const delivery = deliveryFee(distance, slabs || []);
    if (delivery == null) return res.status(400).json({ error: 'Outside delivery zone' });
    const tax = Math.round(subtotal * Number(settings?.default_tax_percent || 5) / 100);
    const total = subtotal + delivery + tax;
    const orderNumber = `MSL${Date.now().toString().slice(-6)}`;
    const { data: order, error: orderError } = await supabase.from('orders').insert({ order_number: orderNumber, address_snapshot: body.address, distance_km: distance, payment_method: body.payment_method || 'cod', subtotal_inr: subtotal, delivery_fee_inr: delivery, tax_inr: tax, total_inr: total, estimated_minutes: 45 }).select().single();
    if (orderError) throw orderError;
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems.map((item) => ({ ...item, order_id: order.id })));
    if (itemsError) throw itemsError;
    res.status(201).json({ order: { ...order, items: orderItems } });
  } catch (error) {
    res.status(500).json({ error: 'Unable to create order', detail: error.message, request_id: crypto.randomUUID() });
  }
};
