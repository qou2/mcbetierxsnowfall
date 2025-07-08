import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { minecraft_username, playstyle, movement, pvp, building, projectiles } = await req.json()

    // Validate inputs
    if (!minecraft_username) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Minecraft username is required!'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const stats = [playstyle, movement, pvp, building, projectiles]
    if (stats.some(stat => stat === undefined || stat < 1 || stat > 100)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'All stats must be numbers between 1 and 100!'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Calculate overall score (average of the 5 stats)
    const overall_score = (playstyle + movement + pvp + building + projectiles) / 5
    
    // Calculate tier based on score using the correct thresholds
    let tier = 'No Rank'
    if (overall_score >= 97) tier = 'HT1'
    else if (overall_score >= 93) tier = 'MT1'
    else if (overall_score >= 89) tier = 'LT1'
    else if (overall_score >= 84) tier = 'HT2'
    else if (overall_score >= 80) tier = 'MT2'
    else if (overall_score >= 76) tier = 'LT2'
    else if (overall_score >= 71) tier = 'HT3'
    else if (overall_score >= 67) tier = 'MT3'
    else if (overall_score >= 63) tier = 'LT3'
    else if (overall_score >= 58) tier = 'HT4'
    else if (overall_score >= 54) tier = 'MT4'
    else if (overall_score >= 50) tier = 'LT4'

    // Insert/update player in database
    const { data: player, error } = await supabase
      .from('snowfall_players')
      .upsert({
        minecraft_username,
        playstyle,
        movement,
        pvp,
        building,
        projectiles,
        overall_score,
        tier,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to add/update player ranking in database!'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      success: true,
      player: {
        minecraft_username,
        playstyle,
        movement,
        pvp,
        building,
        projectiles,
        overall_score: parseFloat(overall_score.toFixed(1)),
        tier
      },
      message: `Successfully added/updated ${minecraft_username} with tier ${tier} (${overall_score.toFixed(1)}/100)`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Test API error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'An error occurred while processing the request!'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})