
import { addSnowfallRank } from "@/services/snowfallService"

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      api_key, 
      minecraft_username, 
      playstyle, 
      movement, 
      pvp, 
      building, 
      projectiles 
    } = req.body

    // Validate API key (you'll need to set this up in your environment)
    if (api_key !== process.env.SNOWFALL_API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' })
    }

    // Validate required fields
    if (!minecraft_username || !playstyle || !movement || !pvp || !building || !projectiles) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate score ranges (0-100)
    const scores = [playstyle, movement, pvp, building, projectiles]
    if (scores.some(score => score < 0 || score > 100)) {
      return res.status(400).json({ error: 'Scores must be between 0 and 100' })
    }

    const player = await addSnowfallRank(
      minecraft_username,
      Number(playstyle),
      Number(movement),
      Number(pvp),
      Number(building),
      Number(projectiles)
    )

    res.status(200).json({
      success: true,
      player,
      message: `Rank added for ${minecraft_username}`
    })

  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
