export default function getPublicBaseUrl(req) {
  const configuredBaseUrl = process.env.BASE_URL?.trim();
  const baseUrl = configuredBaseUrl || `${req.protocol}://${req.get("host")}`;
  return baseUrl.replace(/\/+$/, "");
}
