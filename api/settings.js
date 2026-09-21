const { getSupabase } = require('../lib/supabase');

module.exports = async function handler(req, res) {
  try {
    const supabase = getSupabase();
    const { data: business, error: businessError } = await supabase.from('business_settings').select('*').limit(1).maybeSingle();
    if (businessError) throw businessError;
    const { data: slabs, error: slabError } = await supabase.from('delivery_slabs').select('*').eq('active', true).order('display_order');
    if (slabError) throw slabError;
    res.status(200).json({ business, delivery_slabs: slabs || [] });
  } catch (error) {
    res.status(500).json({ error: 'Unable to load settings', detail: error.message });
  }
};
