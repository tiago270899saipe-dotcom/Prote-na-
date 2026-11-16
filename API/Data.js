const URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const KEY = 'proteina:data';

const DEFAULT = {
  whatsapp: '5493773461721',
  about: 'Somos Proteína, tu tienda de suplementos en Mercedes, Corrientes. Nutrición y rendimiento con productos de calidad y atención personalizada.',
  info: 'Retiro por el local\nConsultá por stock y pedidos a encargo',
  products: [
    { id: 'p1', name: 'Whey Protein 2 Lb Gold Nutrition', cat: 'Proteínas', price: 80000, stock: 5, img: '' },
    { id: 'p2', name: 'Classic Whey Protein One Fit 2 Lb', cat: 'Proteínas', price: 45000, stock: 5, img: '' },
    { id: 'p3', name: 'Creatina 200 g One Fit', cat: 'Creatinas', price: 15000, stock: 5, img: '' },
    { id: 'p4', name: 'Creatina 500 g One Fit', cat: 'Creatinas', price: 30000, stock: 5, img: '' },
    { id: 'p5', name: 'Creatina Star Nutrition 300 g Doypack', cat: 'Creatinas', price: 25000, stock: 5, img: '' }
  ]
};

const redis = async (cmd) => (await fetch(URL, {
  method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN }, body: JSON.stringify(cmd)
})).json();

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const { result } = await redis(['GET', KEY]);
      return res.status(200).json(result ? JSON.parse(result) : DEFAULT);
    }
    if (req.method === 'POST') {
      const pass = process.env.ADMIN_PASSWORD;
      if (!pass || req.headers['x-admin-password'] !== pass)
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      await redis(['SET', KEY, JSON.stringify(body)]);
      return res.status(200).json({ ok: true });
    }
    res.status(405).end();
  } catch (e) {
    if (req.method === 'GET') return res.status(200).json(DEFAULT);
    res.status(500).json({ error: 'No se pudo guardar. Revisá la base de datos en Vercel.' });
  }
};

