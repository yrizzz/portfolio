import { connectDB } from '@/lib/mongodb';
import { License, User } from '@/models';

/**
 * Check if user has an active license
 */
export async function hasActiveLicense(userId: string): Promise<boolean> {
  try {
    await connectDB();
    const activeLicense = await License.findOne({
      userId,
      isActive: true,
      endDate: { $gte: new Date() },
    });

    return !!activeLicense;
  } catch (error) {
    console.error('Error checking license:', error);
    return false;
  }
}

/**
 * Get user's active license
 */
export async function getActiveLicense(userId: string) {
  try {
    await connectDB();
    const license = await License.findOne({
      userId,
      isActive: true,
      endDate: { $gte: new Date() },
    }).sort({ endDate: -1 }).lean();

    return license;
  } catch (error) {
    console.error('Error getting license:', error);
    return null;
  }
}

/**
 * Check if license is expired and deactivate if needed
 */
export async function checkAndDeactivateExpiredLicenses() {
  try {
    await connectDB();
    const result = await License.updateMany(
      {
        isActive: true,
        endDate: { $lt: new Date() },
      },
      {
        isActive: false,
      }
    );

    console.log(`Deactivated ${result.modifiedCount} expired licenses`);
    return result.modifiedCount;
  } catch (error) {
    console.error('Error checking expired licenses:', error);
    return 0;
  }
}

/**
 * Process auto-renewal for licenses
 */
export async function processAutoRenewals() {
  try {
    await connectDB();
    // Find licenses that need renewal (expiring in next 24 hours with autoRenew enabled)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const licensesToRenew = await License.find({
      isActive: true,
      autoRenew: true,
      endDate: {
        $lte: tomorrow,
        $gte: new Date(),
      },
    }).lean();

    const renewed: string[] = [];
    const failed: string[] = [];

    for (const license of licensesToRenew) {
      try {
        // TODO: Process payment with payment gateway
        // For now, we'll just extend the license (demo mode)

        const licenseConfig: Record<string, number> = {
          DAILY: 1,
          WEEKLY: 7,
          MONTHLY: 30,
        };

        const days = licenseConfig[license.type] || 30;
        const newEndDate = new Date(license.endDate);
        newEndDate.setDate(newEndDate.getDate() + days);

        await License.findByIdAndUpdate(license._id, {
          endDate: newEndDate,
        });

        renewed.push(license._id.toString());
      } catch (error) {
        console.error(`Failed to renew license ${license._id}:`, error);
        failed.push(license._id.toString());
      }
    }

    console.log(`Auto-renewal: ${renewed.length} renewed, ${failed.length} failed`);

    return { renewed, failed };
  } catch (error) {
    console.error('Error processing auto-renewals:', error);
    return { renewed: [], failed: [] };
  }
}

/**
 * Validate license for API access
 */
export async function validateLicenseForAPI(userId: string): Promise<{
  valid: boolean;
  license?: any;
  error?: string;
}> {
  try {
    const license = await getActiveLicense(userId);

    if (!license) {
      return {
        valid: false,
        error: 'No active license found',
      };
    }

    return {
      valid: true,
      license,
    };
  } catch (error) {
    console.error('Error validating license:', error);
    return {
      valid: false,
      error: 'License validation failed',
    };
  }
}
