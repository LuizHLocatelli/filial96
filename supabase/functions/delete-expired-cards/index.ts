import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log(`Function "delete-expired-cards" up and running!`)

// A lógica principal da função
Deno.serve(async (req) => {
  // O Supabase injeta as variáveis de ambiente necessárias.
  // Criamos um cliente Supabase com a role de serviço para ter permissões de admin.
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const currentTime = new Date().toISOString()

    // 1. Encontrar todos os cards promocionais cuja data de fim já passou.
    const { data: expiredCards, error: selectError } = await supabaseAdmin
      .from('promotional_cards')
      .select('id, image_url')
      .lt('end_date', currentTime)

    if (selectError) {
      throw new Error(`Error fetching expired cards: ${selectError.message}`)
    }

    if (!expiredCards || expiredCards.length === 0) {
      console.log('No expired cards to delete.')
      return new Response(JSON.stringify({ message: 'No expired cards to delete.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log(`Found ${expiredCards.length} expired cards to delete.`)

    // Extrair os caminhos dos arquivos de imagem do `image_url` completo.
    const filePaths = expiredCards
      .map((card) => {
        try {
          const url = new URL(card.image_url)
          // O caminho do arquivo no bucket começa depois de '/storage/v1/object/public/promotional_cards/'
          const pathSegments = url.pathname.split('/')
          const filePath = pathSegments.slice(5).join('/')
          return filePath
        } catch (e) {
          console.error(`Invalid URL for card ID ${card.id}: ${card.image_url}`)
          return null
        }
      })
      .filter((path): path is string => path !== null)

    // 2. Deletar as imagens do Supabase Storage.
    if (filePaths.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('promotional_cards')
        .remove(filePaths)

      if (storageError) {
        // Não lançamos um erro fatal aqui para que a exclusão do banco de dados ainda possa ser tentada.
        console.error(`Error deleting files from storage: ${storageError.message}`)
      } else {
        console.log(`Successfully deleted ${filePaths.length} images from storage.`)
      }
    }

    // 3. Deletar os registros dos cards do banco de dados.
    const cardIds = expiredCards.map((card) => card.id)
    const { error: deleteError } = await supabaseAdmin
      .from('promotional_cards')
      .delete()
      .in('id', cardIds)

    if (deleteError) {
      throw new Error(`Error deleting cards from database: ${deleteError.message}`)
    }

    console.log(`Successfully deleted ${cardIds.length} card records from the database.`)

    return new Response(JSON.stringify({ message: `Successfully deleted ${cardIds.length} expired cards.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}) 