-- Criar tabela de configurações dos Agentes Multimodais
CREATE TABLE IF NOT EXISTS agente_multimodal_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    bias VARCHAR(500),
    objective TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para agente_multimodal_config
ALTER TABLE agente_multimodal_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own configs" ON agente_multimodal_config
    FOR ALL
    USING (auth.uid() = user_id);

-- Criar tabela de conversas
CREATE TABLE IF NOT EXISTS agente_multimodal_conversas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID NOT NULL REFERENCES agente_multimodal_config(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    messages JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para agente_multimodal_conversas
ALTER TABLE agente_multimodal_conversas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own conversations" ON agente_multimodal_conversas
    FOR ALL
    USING (auth.uid() = user_id);

-- Criar tabela de vídeos gerados (persistência)
CREATE TABLE IF NOT EXISTS agente_multimodal_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES agente_multimodal_conversas(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    video_url TEXT NOT NULL,
    video_duration_seconds INTEGER DEFAULT 8,
    aspect_ratio VARCHAR(10) DEFAULT '16:9',
    status VARCHAR(50) DEFAULT 'completed',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para agente_multimodal_videos
ALTER TABLE agente_multimodal_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own videos" ON agente_multimodal_videos
    FOR ALL
    USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_agente_multimodal_config_user_id ON agente_multimodal_config(user_id);
CREATE INDEX IF NOT EXISTS idx_agente_multimodal_conversas_config_id ON agente_multimodal_conversas(config_id);
CREATE INDEX IF NOT EXISTS idx_agente_multimodal_videos_user_id ON agente_multimodal_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_agente_multimodal_videos_created_at ON agente_multimodal_videos(created_at DESC);
