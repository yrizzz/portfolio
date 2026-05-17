module.exports = async (params) => {
  const axios = require("axios");
  const qs = require("qs");
  
  try {
    const { url } = params;
    
    if (!url) {
      return {
        code: 400,
        status: false,
        message: "URL is required"
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
    
    // Extract shortcode from URL
    let shortcode = '';
    const urlPatterns = [
      /instagram\.com\/p\/([^\/\?]+)/,
      /instagram\.com\/reel\/([^\/\?]+)/,
      /instagram\.com\/tv\/([^\/\?]+)/
    ];
    
    for (const pattern of urlPatterns) {
      const match = url.match(pattern);
      if (match) {
        shortcode = match[1];
        break;
      }
    }
    
    if (!shortcode) {
      return {
        code: 400,
        status: false,
        message: "Invalid Instagram URL"
      };
    }
    
    // Get post data
    const postParams = qs.stringify({
      'variables': JSON.stringify({"shortcode": shortcode}),
      'doc_id': '8845758582119845'
    });
    
    const postResponse = await axios.post('https://www.instagram.com/graphql/query', postParams, {
      headers
    });
    
    const media = postResponse.data.data?.shortcode_media;
    
    if (!media) {
      return {
        code: 404,
        status: false,
        message: "Post not found"
      };
    }
    
    // Extract media URLs
    const result: any = {
      shortcode: media.shortcode,
      type: media.__typename,
      caption: media.edge_media_to_caption?.edges?.[0]?.node?.text,
      likes: media.edge_media_preview_like?.count,
      comments: media.edge_media_to_comment?.count,
      timestamp: media.taken_at_timestamp
    };
    
    // Handle different media types
    if (media.__typename === 'GraphImage') {
      result.displayUrl = media.display_url;
    } else if (media.__typename === 'GraphVideo') {
      result.displayUrl = media.display_url;
      result.videoUrl = media.video_url;
    } else if (media.__typename === 'GraphSidecar') {
      result.items = media.edge_sidecar_to_children?.edges?.map((edge: any) => ({
        type: edge.node.__typename,
        displayUrl: edge.node.display_url,
        videoUrl: edge.node.video_url
      }));
    }
    
    return {
      code: 200,
      status: true,
      message: "Success",
      data: result
    };
    
  } catch (error) {
    return {
      code: 500,
      status: false,
      message: error.message || "Internal server error"
    };
  }
};