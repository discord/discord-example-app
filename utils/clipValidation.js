import https from 'https';
import db from '../models/index.js';
import { where } from 'sequelize';

const PLATFORM_PATTERNS = {
  INSTAGRAM: {
    REEL: /^https?:\/\/(?:www\.)?instagram\.com\/reels?\/([a-zA-Z0-9_-]+)/,
    POST: /^https?:\/\/(?:www\.)?instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
    USERNAME: /^https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/
  },
  TIKTOK: {
    VIDEO: /^https?:\/\/(?:www\.)?tiktok\.com\/@([a-zA-Z0-9._]+)\/video\/(\d+)/,
    USERNAME: /^https?:\/\/(?:www\.)?tiktok\.com\/@([a-zA-Z0-9._]+)/
  },
  YOUTUBE: {
    SHORTS: /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
    VIDEO: /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    USERNAME: /^https?:\/\/(?:www\.)?youtube\.com\/@([a-zA-Z0-9._-]+)/
  }
};

async function extractInstagramUsername(url) {
  try {
    const options = {
      method: 'GET',
      hostname: 'real-time-instagram-scraper-api1.p.rapidapi.com',
      path: `/v1/media_info?code_or_id_or_url=${encodeURIComponent(url)}`,
      headers: {
        'x-rapidapi-key': process.env.X_API_KEY,
        'x-rapidapi-host': 'real-time-instagram-scraper-api1.p.rapidapi.com'
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        const chunks = [];

        res.on('data', (chunk) => chunks.push(chunk));

        res.on('end', () => {
          try {
            const body = Buffer.concat(chunks);
            const data = JSON.parse(body.toString());
            console.log(data);
            if (data.data && data.data.items && data.data.items[0] && data.data.items[0].user) {
              resolve(data.data.items[0].user.username);
            } else {
              reject(new Error(data.message));
            }
          } catch (error) {
            reject(new Error(`Failed to parse Instagram API response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Instagram API request failed: ${error.message}`));
      });

      req.end();
    });
  } catch (error) {
    throw new Error(`Invalid Instagram URL: ${error.message}`);
  }
}

function extractTikTokUsername(url) {
  const match = PLATFORM_PATTERNS.TIKTOK.VIDEO.exec(url);
  if (match && match[1]) {
    return match[1];
  }
  throw new Error('Invalid TikTok URL format');
}

function extractYoutubeUsername(url) {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.split('/').filter(Boolean);
    
    if (path[0] === '@') {
      return path[1];
    }
    
    // For shorts/videos, we'd need YouTube's API to get the channel info
    throw new Error('YouTube API integration required for this URL type');
  } catch (error) {
    throw new Error(`Invalid YouTube URL: ${error.message}`);
  }
}

export async function validateClipUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // First check if clip already exists in database
    const existingClip = await db.Clip.findOne({
      where: { url }
    });

    if (existingClip) {
      throw new Error('Clip has already been uploaded');
    }
    
    // Instagram validation
    if (urlObj.hostname.includes('instagram.com')) {
      if (!PLATFORM_PATTERNS.INSTAGRAM.REEL.test(url) && 
          !PLATFORM_PATTERNS.INSTAGRAM.POST.test(url)) {
        throw new Error('URL must be an Instagram reel or post');
      }
      const username = await extractInstagramUsername(url);
      console.log(username);
      return {
        platform: 'INSTAGRAM',
        username
      };
    }
    
    // TikTok validation
    if (urlObj.hostname.includes('tiktok.com')) {
      if (!PLATFORM_PATTERNS.TIKTOK.VIDEO.test(url)) {
        throw new Error('URL must be a TikTok video');
      }
      return {
        platform: 'TIKTOK',
        username: extractTikTokUsername(url)
      };
    }
    
    // YouTube validation
    if (urlObj.hostname.includes('youtube.com')) {
      if (!PLATFORM_PATTERNS.YOUTUBE.SHORTS.test(url) && 
          !PLATFORM_PATTERNS.YOUTUBE.VIDEO.test(url)) {
        throw new Error('URL must be a YouTube video or short');
      }
      return {
        platform: 'YOUTUBE',
        username: extractYoutubeUsername(url)
      };
    }
    
    throw new Error('Unsupported platform');
  } catch (error) {
    if (error.message.includes('Invalid URL')) {
      throw new Error('Invalid URL format');
    }
    throw error;
  }
}

export async function extractClipMetadata(url) {
  try {
    const urlObj = new URL(url);
    
    // For Instagram: Use RapidAPI Instagram Scraper
    if (urlObj.hostname.includes('instagram.com')) {
      const options = {
        method: 'GET',
        hostname: 'real-time-instagram-scraper-api1.p.rapidapi.com',
        path: `/v1/media_info?code_or_id_or_url=${encodeURIComponent(url)}`,
        headers: {
          'x-rapidapi-key': process.env.X_API_KEY,
          'x-rapidapi-host': 'real-time-instagram-scraper-api1.p.rapidapi.com'
        }
      };

      return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          const chunks = [];

          res.on('data', (chunk) => chunks.push(chunk));

          res.on('end', () => {
            try {
              const body = Buffer.concat(chunks);
              const data = JSON.parse(body.toString());
              
              if (data.data?.items?.[0]) {
                const item = data.data.items[0];
                resolve({
                  views: item.play_count || item.video_view_count || 0,
                  likes: item.like_count || 0,
                  platform: 'INSTAGRAM',
                  duration: item.video_duration || 0
                });
              } else {
                reject(new Error('Could not extract metadata from Instagram response'));
              }
            } catch (error) {
              reject(new Error(`Failed to parse Instagram API response: ${error.message}`));
            }
          });
        });

        req.on('error', (error) => {
          reject(new Error(`Instagram API request failed: ${error.message}`));
        });

        req.end();
      });
    }
    
    // For TikTok: Use TikTok API
    if (urlObj.hostname.includes('tiktok.com')) {
      return {
        views: 0, // Requires TikTok API
        likes: 0, // Requires TikTok API
        platform: 'TIKTOK'
      };
    }
    
    // For YouTube: Use YouTube Data API
    if (urlObj.hostname.includes('youtube.com')) {
      return {
        views: 0, // Requires YouTube API
        likes: 0, // Requires YouTube API
        platform: 'YOUTUBE'
      };
    }
    
    throw new Error('Unsupported platform');
  } catch (error) {
    throw new Error(`Failed to extract metadata: ${error.message}`);
  }
}

export async function updateClipsMetadata() {
  try {
    // Get all clips from database
    const clips = await db.Clip.findAll()
        // Find all clips where campaigns are active and have a posted date after campaign start date);
    console.log(`Starting metadata update for ${clips.length} clips`);

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Process clips in batches to avoid rate limits
    for (const clip of clips) {
      try {
        // Add delay between requests to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

        const metadata = await extractClipMetadata(clip.url);
        
        // Update the clip with new metadata
        await clip.update({
          views: metadata.views,
          likes: metadata.likes,
          lastMetadataUpdate: new Date()
        });

        results.success++;
        console.log(`Updated metadata for clip: ${clip.url}`);
      } catch (error) {
        results.failed++;
        results.errors.push({
          url: clip.url,
          error: error.message
        });
        console.error(`Failed to update metadata for ${clip.url}:`, error.message);
      }
    }

    console.log('Metadata update complete:', {
      totalProcessed: clips.length,
      successful: results.success,
      failed: results.failed
    });

    return results;
  } catch (error) {
    console.error('Failed to update clips metadata:', error);
    throw error;
  }
}

// Helper function to update a single clip's metadata
export async function updateSingleClipMetadata(clipId) {
  try {
    const clip = await db.Clip.findByPk(clipId);
    if (!clip) {
      throw new Error('Clip not found');
    }

    const metadata = await extractClipMetadata(clip.url);
    
    await clip.update({
      views: metadata.views,
      likes: metadata.likes,
      lastMetadataUpdate: new Date()
    });

    return {
      success: true,
      clip: clip.toJSON()
    };
  } catch (error) {
    console.error(`Failed to update metadata for clip ${clipId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
} 