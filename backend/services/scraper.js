const axios = require("axios");
const cheerio = require("cheerio");

// We use ScraperAPI to bypass anti-bot protections.
// Get a free key at https://scraperapi.com (5000 free requests/month)
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

const buildScraperUrl = (targetUrl) => {
  if (!SCRAPER_API_KEY) {
    // Direct fetch (may be blocked by Amazon/Flipkart in production)
    return targetUrl;
  }
  return `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}`;
};

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-IN,en;q=0.9",
};

// ─── Amazon Scraper ────────────────────────────────────────────────────────────
async function scrapeAmazon(url) {
  try {
    const { data } = await axios.get(buildScraperUrl(url), { headers, timeout: 15000 });
    const $ = cheerio.load(data);

    const title = $("#productTitle").text().trim();

    // Price can be in different selectors depending on product type
    const priceWhole = $(".a-price-whole").first().text().replace(/[^0-9]/g, "");
    const priceFraction = $(".a-price-fraction").first().text().replace(/[^0-9]/g, "");
    const currentPrice = priceWhole
      ? parseFloat(`${priceWhole}.${priceFraction || "00"}`)
      : null;

    const originalPriceText = $(".a-text-price .a-offscreen").first().text();
    const originalPrice = originalPriceText
      ? parseFloat(originalPriceText.replace(/[^0-9.]/g, ""))
      : null;

    const image =
      $("#landingImage").attr("src") ||
      $("#imgTagWrapperId img").attr("src") ||
      "";

    const ratingText = $(".a-icon-alt").first().text();
    const rating = ratingText ? parseFloat(ratingText.split(" ")[0]) : null;

    const reviewText = $("#acrCustomerReviewText").text().replace(/[^0-9]/g, "");
    const reviewCount = reviewText ? parseInt(reviewText) : null;

    // Extract ASIN from URL
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
    const asin = asinMatch ? asinMatch[1] : null;

    if (!title || !currentPrice) {
      throw new Error("Could not extract product data from Amazon. The page structure may have changed.");
    }

    return {
      title,
      url,
      image,
      platform: "amazon",
      currentPrice,
      originalPrice,
      currency: "INR",
      rating,
      reviewCount,
      asin,
      isAvailable: true,
    };
  } catch (error) {
    throw new Error(`Amazon scrape failed: ${error.message}`);
  }
}

// ─── Flipkart Scraper ──────────────────────────────────────────────────────────
async function scrapeFlipkart(url) {
  try {
    const { data } = await axios.get(buildScraperUrl(url), { headers, timeout: 15000 });
    const $ = cheerio.load(data);

    const title =
      $(".B_NuCI").text().trim() ||
      $("h1.yhB1nd").text().trim() ||
      $("span.B_NuCI").text().trim();

    const priceText =
      $("._30jeq3._16Jk6d").text() ||
      $("._30jeq3").first().text();
    const currentPrice = priceText
      ? parseFloat(priceText.replace(/[^0-9.]/g, ""))
      : null;

    const originalPriceText = $("._3I9_wc._2p6lqe").text() || $("._3I9_wc").text();
    const originalPrice = originalPriceText
      ? parseFloat(originalPriceText.replace(/[^0-9.]/g, ""))
      : null;

    const image =
      $("._396cs4._2amPTt._3qGmMb").attr("src") ||
      $("img._396cs4").attr("src") ||
      "";

    const ratingText = $("._3LWZlK").first().text();
    const rating = ratingText ? parseFloat(ratingText) : null;

    const reviewText = $("span._2_R_DZ").text().replace(/[^0-9]/g, "");
    const reviewCount = reviewText ? parseInt(reviewText) : null;

    if (!title || !currentPrice) {
      throw new Error("Could not extract product data from Flipkart.");
    }

    return {
      title,
      url,
      image,
      platform: "flipkart",
      currentPrice,
      originalPrice,
      currency: "INR",
      rating,
      reviewCount,
      isAvailable: true,
    };
  } catch (error) {
    throw new Error(`Flipkart scrape failed: ${error.message}`);
  }
}

// ─── Detect platform and scrape ───────────────────────────────────────────────
async function scrapeProduct(url) {
  if (url.includes("amazon.in") || url.includes("amazon.com")) {
    return scrapeAmazon(url);
  } else if (url.includes("flipkart.com")) {
    return scrapeFlipkart(url);
  } else {
    throw new Error("Unsupported platform. Please use an Amazon or Flipkart URL.");
  }
}

module.exports = { scrapeProduct, scrapeAmazon, scrapeFlipkart };
