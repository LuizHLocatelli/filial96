# 🕵️ Instruções para Debug do Problema de Timezone

## 🎯 **Objetivo**
Identificar exatamente onde a data está sendo alterada de 31/05 para 30/05 quando um depósito é registrado.

## 🔍 **Como Testar**

### **Passo 1: Abrir o Navegador com Console**
1. Abra o Chrome/Edge
2. Pressione `F12` para abrir as ferramentas de desenvolvedor
3. Vá para a aba **Console**
4. Acesse: `http://localhost:5173` (o projeto já está rodando)

### **Passo 2: Reproduzir o Problema**
1. Navegue até **Crediário > Depósitos**
2. Clique no dia **31/05** (ou hoje)
3. **ANTES** de preencher o formulário, observe o console
4. Preencha o formulário e clique em "Registrar Depósito"
5. **OBSERVE ATENTAMENTE** todos os logs no console

### **Passo 3: Capturar os Logs**
Procure pelos seguintes logs no console:

```
🚀 addDeposito chamado com:
  data_original: [DATA_AQUI]
  data_toString: [DATA_AQUI]
  data_toISOString: [DATA_AQUI]
  data_formatDateForDatabase: [DATA_AQUI]
  timezone: [TIMEZONE_AQUI]
  timezoneOffset: [OFFSET_AQUI]

📅 Data formatada para banco: [DATA_AQUI]

📝 Inserindo no banco com data: [DATA_AQUI]

✅ Dados retornados do banco: [DADOS_AQUI]

🔄 Convertendo item do banco:
  data_string: [DATA_DO_BANCO]
  data_converted: [DATA_CONVERTIDA]
```

## 🧐 **O que Observar**

### **✅ Datas que DEVEM estar corretas:**
- `data_original`: Deve mostrar 31/05/2024
- `data_formatDateForDatabase`: Deve ser "2024-05-31"
- `data_string` (do banco): Deve ser "2024-05-31"

### **❌ Onde pode estar o problema:**
- Se `data_toISOString` mostrar 30/05, o problema é de timezone local
- Se `data_string` do banco mostrar 30/05, o problema é no Supabase
- Se `data_converted` mostrar 30/05, o problema é na conversão de volta

## 📋 **Formulário de Teste**

**Cole estas informações aqui após o teste:**

```
=== TESTE DE TIMEZONE - 31/05/2024 ===

Horário do teste: [HH:MM]
Dia selecionado: [31/05]

--- LOGS CAPTURADOS ---
🚀 data_original: 
🚀 data_toString: 
🚀 data_toISOString: 
🚀 data_formatDateForDatabase: 
🚀 timezone: 
🚀 timezoneOffset: 

📅 Data formatada para banco: 

📝 Inserindo no banco com data: 

✅ Dados retornados do banco: 

🔄 data_string (do banco): 
🔄 data_converted: 

--- RESULTADO FINAL ---
Data salva no aplicativo: [DD/MM/AAAA]
Está correto? [SIM/NÃO]
```

## 🔧 **Casos Específicos para Testar**

### **Teste 1: Horário Normal (14:00)**
- Selecionar 31/05
- Registrar às 14:00
- Verificar se salva como 31/05

### **Teste 2: Horário Noturno (21:00)** ⚠️ **MAIS IMPORTANTE**
- Selecionar 31/05
- Registrar às 21:00 (como no problema original)
- Verificar se salva como 31/05 ou 30/05

### **Teste 3: Véspera de Fuso Horário (23:30)**
- Selecionar 31/05
- Registrar às 23:30
- Verificar resultado

## 🎯 **Hipóteses a Verificar**

1. **Timezone Offset**: Se o `timezoneOffset` não for -180 (GMT-3)
2. **Conversão ISO**: Se `toISOString` mostrar data diferente
3. **Banco de Dados**: Se `data_string` vier diferente do banco
4. **Reconversão**: Se `data_converted` der problema

## 📞 **Após o Teste**

Me envie:
1. **Todos os logs copiados do console**
2. **Screenshots da tela (se possível)**
3. **Horário exato do teste**
4. **Resultado final no app**

Com essas informações, poderei identificar exatamente onde está o problema e implementar a correção definitiva! 🎯

---

**⚡ Nota Importante**: Os logs foram adicionados temporariamente apenas para debug. Eles serão removidos após identificarmos e corrigirmos o problema. 