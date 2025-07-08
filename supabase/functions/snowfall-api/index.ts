
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed. Only POST requests are supported.'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    })
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration')
      return new Response(JSON.stringify({
        success: false,
        error: 'Server configuration error - missing database credentials'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Check API key
    const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '')
    const validApiKey = Deno.env.get('SNOWFALL_API_KEY')
    
    console.log('API Key check:', {
      hasProvidedKey: !!apiKey,
      hasValidKey: !!validApiKey,
      keysMatch: apiKey === validApiKey
    })
    
    if (!validApiKey) {
      console.error('SNOWFALL_API_KEY environment variable not set')
      return new Response(JSON.stringify({
        success: false,
        error: 'Server configuration error - API key not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!apiKey || apiKey !== validApiKey) {
      console.error('Invalid API key provided')
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid or missing API key'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    let requestData
    try {
      requestData = await req.json()
      console.log('Request data received:', requestData)
    } catch (e) {
      console.error('Invalid JSON in request body:', e)
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { minecraft_username, playstyle, movement, pvp, building, projectiles } = requestData

    // Validate inputs
    if (!minecraft_username || typeof minecraft_username !== 'string' || minecraft_username.trim().length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Minecraft username is required and must be a non-empty string'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const stats = [playstyle, movement, pvp, building, projectiles]
    if (stats.some(stat => typeof stat !== 'number' || stat < 1 || stat > 100)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'All stats must be numbers between 1 and 100'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Calculate overall score (average of the 5 stats)
    const overall_score = Number(((playstyle + movement + pvp + building + projectiles) / 5).toFixed(2))
    
    // Calculate tier based on score
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

    console.log(`Processing player: ${minecraft_username}, overall: ${overall_score}, tier: ${tier}`)

    // Prepare player data
    const playerData = {
      minecraft_username: minecraft_username.trim(),
      playstyle: Number(playstyle),
      movement: Number(movement),
      pvp: Number(pvp),
      building: Number(building),
      projectiles: Number(projectiles),
      overall_score,
      tier,
      updated_at: new Date().toISOString()
    }

    console.log('Attempting to upsert player data:', playerData)

    // Use upsert to handle insert/update automatically
    const { data: player, error } = await supabase
      .from('snowfall_players')
      .upsert(playerData, {
        onConflict: 'minecraft_username'
      })
      .select()
      .single()

    if (error) {
      console.error('Database operation error:', error)
      return new Response(JSON.stringify({
        success: false,
        error: `Database error: ${error.message}`,
        details: error.details || error.hint || 'Database operation failed',
        code: error.code || 'UNKNOWN'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!player) {
      console.error('No player data returned from database')
      return new Response(JSON.stringify({
        success: false,
        error: 'Database operation completed but no data returned'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Successfully processed player:', player)

    return new Response(JSON.stringify({
      success: true,
      player: {
        minecraft_username: player.minecraft_username,
        playstyle: player.playstyle,
        movement: player.movement,
        pvp: player.pvp,
        building: player.building,
        projectiles: player.projectiles,
        overall_score: player.overall_score,
        tier: player.tier
      },
      message: `Successfully added/updated ${player.minecraft_username} with tier ${tier} (${overall_score}/100)`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Snowfall API unexpected error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'An unexpected error occurred while processing the request',
      details: error.message || 'No additional details',
      type: error.name || 'UnknownError'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
