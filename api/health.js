const { getSupabase } = require('../lib/supabase');

function keyKind(key) {
  if (!key) return 'missing';
  if (key.startsWith('sb_secret_')) return 'sb_secret';
  if (key.startsWith('sb_publishable_')) return 'sb_publishable';
  if (key.startsWith('eyJ')) {
    try {
      const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8'));
      return payload.role === 'service_role' ? 'legacy_service_role' : `jwt_${payload.role || 'unknown'}`;
    } catch (_) {
      return 'jwt_unknown';
    }
  }
  return 'unknown';
}

module.exports = async function handler(req, res) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('business_settings').select('id').limit(1);
    if (error) throw error;
    res.status(200).json({ ok: true, service: 'msl-kitchen-api', supabase: { url_configured: Boolean(process.env.SUPABASE_URL), key_kind: keyKind(key), read_access: true } });
  } catch (error) {
    res.status(500).json({ ok: false, service: 'msl-kitchen-api', supabase: { url_configured: Boolean(process.env.SUPABASE_URL), key_kind: keyKind(key), read_access: false }, error: error.message });
  }
};
