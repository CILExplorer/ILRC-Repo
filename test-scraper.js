const Parser = require('rss-parser');
const parser = new Parser();

// Feed URLs exactly as defined in the user's specification (or their correct online URLs)
const feeds = [
  { name: 'Kluwer Arbitration Blog', url: 'https://kluwerarbitrationblog.com/feed/' },
  { name: 'EJIL: Talk!', url: 'https://www.ejiltalk.org/feed/' },
  { name: 'Jus Mundi Blog', url: 'https://jusmundi.com/en/feed/' },
  { name: 'ICSID News', url: 'https://icsid.worldbank.org/news/rss' },
  { name: 'UN News International Law', url: 'https://news.un.org/feed/subscribe/en/news/topic/international-law/feed/rss.xml' },
];

async function test() {
  console.log("Starting RSS feed validation with custom User-Agent...");
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/xml, application/xml, text/html, */*'
  };

  for (const f of feeds) {
    try {
      const res = await fetch(f.url, { headers });
      if (!res.ok) {
        throw new Error(`HTTP Error Status: ${res.status}`);
      }
      const xml = await res.text();
      const feed = await parser.parseString(xml);
      console.log(`✅ [${f.name}] Successfully parsed.`);
      console.log(`   Feed Title: "${feed.title}"`);
      console.log(`   Latest Article: "${feed.items[0]?.title || 'No articles found'}"`);
      console.log(`   Latest URL: "${feed.items[0]?.link || 'N/A'}"`);
    } catch (e) {
      console.error(`❌ [${f.name}] Failed to parse feed:`, e.message);
    }
  }
}

test();
