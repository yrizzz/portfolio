import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiEndpointSchema = new mongoose.Schema({}, { collection: 'apiendpoints', strict: false });
const ApiEndpoint = mongoose.models.ApiEndpoint || mongoose.model('ApiEndpoint', apiEndpointSchema);

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('MONGODB_URI not found');
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
}

const xprofileCode = `module.exports = async (params) => {
  const axios = require("axios");
  
  try {
    const { username } = params;
    
    if (!username) {
      return {
        code: 400,
        status: false,
        message: "Username is required"
      };
    }
    
    // Get global headers for Twitter/X (REQUIRED)
    const globalHeaders = params._globalHeaders?.twitter || params._globalHeaders?.x;
    
    if (!globalHeaders || Object.keys(globalHeaders).length === 0) {
      return {
        code: 400,
        status: false,
        message: "Twitter/X headers not configured. Please add Twitter headers in Global Headers settings."
      };
    }
    
    // Build GraphQL URL
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
    
    // Use global headers
    const headers = globalHeaders;
    
    const response = await axios.get(url, { headers });
    
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
    return {
      code: 500,
      status: false,
      message: err.message || "Internal server error",
      error: err?.response?.data || err.message
    };
  }
};`;

async function updateXProfile() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    console.log('📋 Updating xprofile API...\n');
    
    const result = await ApiEndpoint.updateOne(
      { name: 'xprofile' },
      {
        $set: {
          code: xprofileCode,
          rawScript: xprofileCode,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ xprofile updated successfully!');
      console.log('\n💡 What changed:');
      console.log('   1. ❌ Removed hardcoded headers');
      console.log('   2. ✅ Now uses global headers (twitter or x service)');
      console.log('   3. ⚠️  Returns error if headers not configured');
      console.log('   4. 🔧 Full GraphQL implementation from utils/api');
      
      console.log('\n⚠️  IMPORTANT:');
      console.log('   Add Twitter/X headers in /admin/global-headers');
      console.log('   Service: "twitter" or "x"');
      console.log('   Required headers:');
      console.log('   - Authorization: Bearer token');
      console.log('   - x-csrf-token');
      console.log('   - Cookie');
      console.log('   - User-Agent');
    } else {
      console.log('⚠️  xprofile not found in database');
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateXProfile();
