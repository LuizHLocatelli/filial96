-- Adicionar campo cliente_vip à tabela moda_reservas
ALTER TABLE public.moda_reservas 
ADD COLUMN cliente_vip BOOLEAN NOT NULL DEFAULT false;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.moda_reservas.cliente_vip IS 'Indica se o cliente é VIP. Clientes VIP não têm limite de tempo de reserva de 3 dias.'; 