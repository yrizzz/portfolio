module.exports = async (params) => {
  const axios = require("axios");
  const qs = require("qs");
  
  try {
    const { username } = params;
    
    if (!username) {
      return {
        code: 400,
        status: false,
        message: "Username is required"
      };
    }
    
    // Get global headers for Instagram (REQUIRED)
    const globalHeaders = params._globalHeaders?.instagram;
    
    if (!globalHeaders || Object.keys(globalHeaders).length === 0) {
      return {
        code: 400,
        status: false,
        message: "Instagram headers not configured. Please add Instagram headers in Global Headers settings."
      };
    }
    
    // Use ONLY global headers
    const headers = globalHeaders;
    
    // Get user ID first
    const searchResponse = await axios.get(`https://www.instagram.com/web/search/topsearch/?context=user&count=0&query=${username}`, {
      headers
    });
    
    if (!searchResponse.data.users || searchResponse.data.users.length === 0) {
      return {
        code: 404,
        status: false,
        message: "User not found"
      };
    }
    
    const userId = searchResponse.data.users[0].user.id;
    
    // Get stories
    const storyParams = qs.stringify({
      'variables': JSON.stringify({"user_id": userId, "include_chaining": false, "include_reel": true, "include_suggested_users": false, "include_logged_out_extras": false, "include_highlight_reels": false, "include_live_status": true}),
      'doc_id': '7770222023030604'
    });
    
    const storyResponse = await axios.post('https://www.instagram.com/graphql/query', storyParams, {
      headers
    });
    
    const reelMedia = storyResponse.data.data?.user?.reel?.items || [];
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: {
        username,
        userId,
        stories: reelMedia.map((item: any) => ({
          id: item.id,
          type: item.__typename,
          displayUrl: item.display_url,
          videoUrl: item.video_versions?.[0]?.url,
          takenAt: item.taken_at_timestamp
        }))
      }
    };
    
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "Internal server error"
    };
  }
};