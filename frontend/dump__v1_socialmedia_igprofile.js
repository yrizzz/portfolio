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
    
    // Get user ID
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
    
    // Get profile data
    const profileParams = qs.stringify({
      'variables': JSON.stringify({"id": userId, "render_surface": "PROFILE"}),
      'server_timestamps': 'true',
      'doc_id': '28812098038405011'
    });
    
    const profileResponse = await axios.post('https://www.instagram.com/graphql/query', profileParams, {
      headers
    });
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: profileResponse.data.data.user
    };
    
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "Internal server error"
    };
  }
};