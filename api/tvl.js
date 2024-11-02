import axios from "axios";

export default async function handler(req, res) {
  const { projectId } = req.query;

  if (!projectId) {
    return res.status(400).json({ error: "Project ID is required" });
  }

  // Construct the API URL to query L2Beat
  const apiUrl = `https://l2beat.com/api/trpc/activity.chart?batch=1&input=${encodeURIComponent(
    JSON.stringify({
      0: {
        json: {
          filter: {
            type: "projects",
            projectIds: [projectId],
          },
          range: "max",
          excludeAssociatedTokens: false,
        },
      },
    })
  )}`;

  try {
    const response = await axios.get(apiUrl);
    const jsonData = response.data[0]?.result?.data?.json;
    console.log("L2Beat API response:", response.data);

    // Check if the data exists and is valid
    if (!jsonData || jsonData.length === 0) {
      return res.status(404).json({ error: "No data found for this project" });
    }

    const latestData = jsonData[jsonData.length - 1];
    if (!latestData || latestData.length < 4) {
      return res.status(500).json({ error: "Malformed data from L2Beat" });
    }

    // Calculate TVL sum from the latest data
    const tvl = (latestData[1] + latestData[2] + latestData[3]) / 100000000;

    res.status(200).json({ projectId, tvl });
  } catch (error) {
    console.error("Error fetching data from L2Beat:", error.message);
    res.status(500).json({ error: "Failed to fetch TVL data" });
  }
}
