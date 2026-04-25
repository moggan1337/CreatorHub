/**
 * Platform integrations index
 * Exports all platform integrations for easy importing
 */

const TikTokPlatform = require('./tiktok');
const YouTubePlatform = require('./youtube');
const InstagramPlatform = require('./instagram');
const TwitterPlatform = require('./twitter');

module.exports = {
  TikTokPlatform,
  YouTubePlatform,
  InstagramPlatform,
  TwitterPlatform
};
