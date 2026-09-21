module.exports = async function handler(req, res) {
  res.status(200).json({ ok: true, service: 'msl-kitchen-api' });
};
