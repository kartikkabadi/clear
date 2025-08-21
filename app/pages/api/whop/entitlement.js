export default async function handler(req, res) {
  try {
    // Whop dev proxy injects identifying headers for local development
    const whopUserId = req.headers["x-whop-user-id"] || null;
    const whopInstallId = req.headers["x-whop-install-id"] || null;
    const forced = process.env.FORCE_WHOP_PRO === "true";

    // Minimal stub: treat presence of Whop headers or FORCE_WHOP_PRO as entitlement
    // In production, replace with a call to Whop API using @whop/api to validate access
    const hasPro = Boolean(whopUserId && whopInstallId) || forced;

    res.status(200).json({
      hasPro,
      userId: whopUserId,
      installId: whopInstallId
    });
  } catch (error) {
    res.status(200).json({ hasPro: false, error: error?.message || "unknown" });
  }
}

