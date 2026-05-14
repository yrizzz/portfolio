import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is not set!');
}

const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

const xprofileCode = `
const axios = require('axios');

// Main execution function
module.exports = async ({ username }) => {
    try {
      const url = \`https://x.com/i/api/graphql/-oaLodhGbbnzJBACb1kk2Q/UserByScreenName?variables=\${encodeURIComponent(
        JSON.stringify({
          screen_name: username,
          withGrokTranslatedBio: false,
        })
      )}&features=\${encodeURIComponent(
        JSON.stringify({
          hidden_profile_subscriptions_enabled: true,
          profile_label_improvements_pcf_label_in_post_enabled: true,
          responsive_web_profile_redirect_enabled: false,
          rweb_tipjar_consumption_enabled: true,
          verified_phone_label_enabled: false,
          subscriptions_verification_info_is_identity_verified_enabled: true,
          subscriptions_verification_info_verified_since_enabled: true,
          highlights_tweets_tab_ui_enabled: true,
          responsive_web_twitter_article_notes_tab_enabled: true,
          subscriptions_feature_can_gift_premium: true,
          creator_subscriptions_tweet_preview_api_enabled: true,
          responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
          responsive_web_graphql_timeline_navigation_enabled: true,
        })
      )}&fieldToggles=\${encodeURIComponent(
        JSON.stringify({
          withPayments: false,
          withAuxiliaryUserLabels: true,
        })
      )}\`;
      
      const headers = {
        "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
        "x-csrf-token": "fb228f66bfc778d8adc247a2361b7d21f874300e188c6064dfd562056cdbe9b7732753c7bd3298de4c07d915ec4af68e85ecd1c12f465f3e34a9c2638cdbca06f91bdcbe5e27fb11f82e732f1ac4e12d",
        "Accept": "*/*",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
        "Cookie": 'guest_id_marketing=v1%3A176518126492800702; guest_id_ads=v1%3A176518126492800702; guest_id=v1%3A176518126492800702; d_prefs=MjoxLGNvbnNlbnRfdmVyc2lvbjoyLHRleHRfdmVyc2lvbjoxMDAw; __cuid=78619a9c484b46a5abd2fe5ccd2b09df; personalization_id="v1_G6EgcXXv4Os9wcbPmuCnZQ=="; g_state={"i_l":0,"i_ll":1766470524685,"i_b":"6tYrkNR53PmEs5CJ23eU6UWcvbeqvKtKLXwCTNdilZs","i_e":{"enable_itp_optimization":0}}; kdt=iJlCKDoSogJn1qy1sypC6bLoSax8x7dACj4HfVbS; auth_token=a6f4a18741b5393c57fc30e9557e8efd0842fad9; ct0=fb228f66bfc778d8adc247a2361b7d21f874300e188c6064dfd562056cdbe9b7732753c7bd3298de4c07d915ec4af68e85ecd1c12f465f3e34a9c2638cdbca06f91bdcbe5e27fb11f82e732f1ac4e12d; twid=u%3D1192069840355262469; lang=en; __cf_bm=ZFNlUtFA4YSw9DKD3JhgNMpx2QO0SN.51TrhmZcl2a4-1767667801.1899114-1.0.1.1-DjmZlDrrN4x4mzP6bA7nLX8by08zrGtUxHbfdgjPwWMK9_5iHiMQuSsINp5UCiB.p8c.Y1h5fqqpfJDUq84Bk3Ir6.miIGsza.xdrFiGV7qSjAdDsuUHb0cNO0Re8HBK'
      };

      const response = await axios.get(url, {
        headers: headers
      });

      const user = response.data?.data?.user?.result;

      if (!user || user.__typename !== "User") {
        return {
          code: 404,
          status: false,
          message: "User not found or unavailable",
        };
      }

      const profileImage = user.avatar?.image_url?.replace("_normal", "_400x400");

      return {
        code: 200,
        status: true,
        message: "Success",
        data: {
          id: user.id,
          rest_id: user.rest_id,
          name: user.core.name,
          screen_name: user.core.screen_name,
          description: user.legacy.description,
          followers_count: user.legacy.followers_count,
          following_count: user.legacy.friends_count,
          profile_image: profileImage,
          profile_banner: user.legacy.profile_banner_url,
        },
      };
    } catch (err) {
      console.error(err?.response?.data || err);
      return {
        code: 500,
        status: false,
        message: "Internal server error",
        err: err?.response?.data || err
      };
    }
};
`;

async function fixXProfile() {
  console.log('🔧 Fixing xprofile API...\n');
  
  try {
    const endpoint = await prisma.apiEndpoint.findFirst({
      where: { name: 'xprofile' }
    });

    if (!endpoint) {
      console.log('❌ xprofile not found in database');
      return;
    }

    await prisma.apiEndpoint.update({
      where: { id: endpoint.id },
      data: { code: xprofileCode }
    });

    console.log('✅ Fixed xprofile API');

  } catch (error) {
    console.error('❌ Error fixing xprofile:', error.message);
  }
}

fixXProfile()
  .then(() => {
    console.log('\n✨ xprofile fixed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix failed:', error);
    process.exit(1);
  });
