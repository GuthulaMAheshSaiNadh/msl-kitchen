const supabase = require('../lib/supabase');

module.exports = async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id,name,slug,description,image_url,price_inr,compare_at_price_inr,vegetarian,bestseller,is_new,recommended,preparation_minutes,categories(name)')
      .eq('active', true)
      .eq('available', true)
      .order('display_order');
    if (error) throw error;
    res.status(200).json({ items: data || [] });
  } catch (error) {
    res.status(500).json({ error: 'Unable to load menu', detail: error.message });
  }
};
