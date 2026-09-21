const supabase = require('../lib/supabase');

module.exports = async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id,name,slug,image_url,display_order')
      .eq('active', true)
      .order('display_order');
    if (error) throw error;
    res.status(200).json({ categories: data || [] });
  } catch (error) {
    res.status(500).json({ error: 'Unable to load categories', detail: error.message });
  }
};
