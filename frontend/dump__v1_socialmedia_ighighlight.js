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
    
    // Get highlights
    const highlightParams = qs.stringify({
      'variables': JSON.stringify({"user_id": userId, "include_chaining": true, "include_reel": true, "include_suggested_users": false, "include_logged_out_extras": false, "include_highlight_reels": true}),
      'doc_id': '7770222023030604'
    });
    
    const highlightResponse = await axios.post('https://www.instagram.com/graphql/query', highlightParams, {
      headers
    });
    
    const highlights = highlightResponse.data.data?.user?.edge_highlight_reels?.edges || [];
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: {
        username,
        userId,
        highlights: highlights.map((edge: any) => ({
          id: edge.node.id,
          title: edge.node.title,
          cover: edge.node.cover_media?.thumbnail_src
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