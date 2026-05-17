import { connectDB } from './mongodb';
import { GlobalHeader } from '@/models';

/**
 * Get global headers for a specific service and user
 */
export async function getGlobalHeaders(
  userId: string,
  service: string
): Promise<Record<string, string> | null> {
  try {
    await connectDB();
    
    const header = await GlobalHeader.findOne({
      userId,
      service,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!header) {
      return null;
    }

    // Handle both Map and Object
    if (header.headers instanceof Map) {
      return Object.fromEntries(header.headers);
    } else if (typeof header.headers === 'object' && header.headers !== null) {
      return header.headers;
    }
    
    return null;
  } catch (error) {
    console.error('[getGlobalHeaders] Error:', error);
    return null;
  }
}

/**
 * Get all active global headers for a user
 */
export async function getAllGlobalHeaders(
  userId: string
): Promise<Record<string, Record<string, string>>> {
  try {
    await connectDB();
    
    const headers = await GlobalHeader.find({
      userId,
      isActive: true,
    }).lean();

    const result: Record<string, Record<string, string>> = {};
    
    for (const header of headers) {
      // Handle both Map and Object
      if (header.headers instanceof Map) {
        result[header.service] = Object.fromEntries(header.headers);
      } else if (typeof header.headers === 'object' && header.headers !== null) {
        result[header.service] = header.headers;
      }
    }

    return result;
  } catch (error) {
    console.error('[getAllGlobalHeaders] Error:', error);
    return {};
  }
}
