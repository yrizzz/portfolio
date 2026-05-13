import { prisma } from '@/lib/prisma';

/**
 * Check if user has an active license
 */
export async function hasActiveLicense(userId: string): Promise<boolean> {
  try {
    const activeLicense = await prisma.license.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
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
    const license = await prisma.license.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        endDate: 'desc',
      },
    });

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
    const expiredLicenses = await prisma.license.findMany({
      where: {
        isActive: true,
        endDate: {
          lt: new Date(),
        },
      },
    });

    if (expiredLicenses.length > 0) {
      await prisma.license.updateMany({
        where: {
          id: {
            in: expiredLicenses.map(l => l.id),
          },
        },
        data: {
          isActive: false,
        },
      });

      console.log(`Deactivated ${expiredLicenses.length} expired licenses`);
    }

    return expiredLicenses.length;
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
    // Find licenses that need renewal (expiring in next 24 hours with autoRenew enabled)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const licensesToRenew = await prisma.license.findMany({
      where: {
        isActive: true,
        autoRenew: true,
        endDate: {
          lte: tomorrow,
          gte: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

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

        await prisma.license.update({
          where: { id: license.id },
          data: {
            endDate: newEndDate,
          },
        });

        renewed.push(license.id);
      } catch (error) {
        console.error(`Failed to renew license ${license.id}:`, error);
        failed.push(license.id);
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
