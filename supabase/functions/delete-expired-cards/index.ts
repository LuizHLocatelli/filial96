import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
};

serve(async (req) => {
  // This is an example of a POST request handler
  if (req.method === 'POST') {
    try {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const now = new Date().toISOString();

      // Find expired cards
      const { data: expiredCards, error: selectError } = await supabaseAdmin
        .from('promotional_cards')
        .select('id, image_url')
        .lt('end_date', now);

      if (selectError) {
        throw selectError;
      }

      if (!expiredCards || expiredCards.length === 0) {
        return new Response(JSON.stringify({ message: 'No expired cards to delete.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      const cardIdsToDelete = expiredCards.map((card) => card.id);
      const imagePathsToDelete = expiredCards
        .map((card) => {
          if (!card.image_url) return null;
          // Extract file path from image URL, e.g. "sector/uuid.png"
          try {
            const url = new URL(card.image_url);
            // The path is usually the last two segments of the pathname
            const pathParts = url.pathname.split('/');
            return pathParts.slice(pathParts.length - 2).join('/');
          } catch (e) {
            console.error('Invalid image_url:', card.image_url);
            return null;
          }
        })
        .filter((path): path is string => path !== null);

      // Delete cards from the database
      const { error: deleteDbError } = await supabaseAdmin
        .from('promotional_cards')
        .delete()
        .in('id', cardIdsToDelete);

      if (deleteDbError) {
        throw deleteDbError;
      }

      // Delete images from storage
      if (imagePathsToDelete.length > 0) {
        const { error: deleteStorageError } = await supabaseAdmin.storage
          .from('promotional_cards')
          .remove(imagePathsToDelete);

        if (deleteStorageError) {
          // Log the error but don't throw, as the DB records are already deleted
          console.error('Error deleting from storage:', deleteStorageError);
        }
      }

      return new Response(JSON.stringify({ message: `Deleted ${expiredCards.length} expired cards.` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}); 