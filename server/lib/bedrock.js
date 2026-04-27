import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime'

const REGION    = process.env.AWS_REGION       || 'us-east-1'
const MODEL_ID  = process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-haiku-4-5-20251001-v1:0'
const MAX_TOKENS = 600

const PROMPT = `Você é um especialista em Segurança do Trabalho analisando uma foto enviada num Comunicado de Intervenção.

Analise a imagem e produza uma resposta CONCISA (máximo 180 palavras) em PORTUGUÊS, dividida em três partes curtas:

1. **O que a foto mostra** (1-2 frases descrevendo a cena).
2. **Riscos identificados** — liste apenas riscos VISÍVEIS na foto (ex.: trabalho em altura sem EPI, condições estruturais inseguras, cabos expostos, espaço confinado, falta de sinalização, produtos químicos sem identificação, ergonomia inadequada, falta de proteção coletiva, etc.). Se não houver risco aparente, diga "Nenhum risco visível".
3. **Recomendações** — uma ou duas ações de correção/mitigação aplicáveis ao contexto.

Use linguagem técnica e objetiva. Se a imagem não tiver relação com Segurança do Trabalho, indique brevemente.`

// Cliente é criado preguiçosamente (lazy) para que o módulo carregue mesmo
// sem credenciais AWS configuradas (caso a feature esteja desabilitada).
let _client = null
function getClient() {
  if (_client) return _client
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY não configurados')
  }
  _client = new BedrockRuntimeClient({
    region: REGION,
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  })
  return _client
}

export function isEnabled() {
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
}

export function describe() {
  return { enabled: isEnabled(), region: REGION, model: MODEL_ID }
}

// MIME → formato aceito pela ConverseCommand (jpeg | png | gif | webp)
function mimeToFormat(mime) {
  if (!mime) return null
  const m = String(mime).toLowerCase()
  if (m === 'image/jpeg' || m === 'image/jpg') return 'jpeg'
  if (m === 'image/png')  return 'png'
  if (m === 'image/gif')  return 'gif'
  if (m === 'image/webp') return 'webp'
  return null
}

/**
 * Analisa uma foto via Bedrock Converse API e retorna um texto descritivo.
 * @param {Buffer} buffer  Bytes da imagem (Buffer estende Uint8Array — vai
 *                         direto em `source.bytes`, sem precisar de base64).
 * @param {string} mime    MIME type (image/jpeg, image/png, image/webp, image/gif).
 * @returns {Promise<string|null>} Texto da análise ou null em caso de falha.
 */
export async function analyzePhoto(buffer, mime) {
  if (!isEnabled()) {
    console.warn('[bedrock] desabilitado (AWS_ACCESS_KEY_ID vazio) — pulando análise')
    return null
  }
  const format = mimeToFormat(mime)
  if (!format) {
    console.warn(`[bedrock] MIME não suportado: ${mime} — pulando análise`)
    return null
  }

  const client = getClient()

  // AbortController dá um teto de 60s por análise (o SDK tem retries internos)
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 60_000)

  const t0 = Date.now()
  try {
    const cmd = new ConverseCommand({
      modelId: MODEL_ID,
      messages: [{
        role: 'user',
        content: [
          { image: { format, source: { bytes: buffer } } },
          { text: PROMPT },
        ],
      }],
      inferenceConfig: { maxTokens: MAX_TOKENS, temperature: 0.2 },
    })
    const response = await client.send(cmd, { abortSignal: ctrl.signal })
    const blocks = response?.output?.message?.content || []
    const text = blocks.map(b => b.text).filter(Boolean).join('\n').trim()
    console.log(`[bedrock] ok em ${Date.now() - t0}ms (${text.length} chars, ${buffer.length} bytes ${format})`)
    return text || null
  } catch (err) {
    const status = err.$metadata?.httpStatusCode ?? '?'
    const reqId  = err.$metadata?.requestId ?? '-'
    console.error(
      `[bedrock] FALHA ${err.name || 'Error'} ` +
      `(http=${status} requestId=${reqId} model=${MODEL_ID} region=${REGION}): ${err.message}`
    )
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Roda analyzePhoto em paralelo para várias fotos (Promise.allSettled).
 * Falhas individuais não interrompem as outras.
 */
export async function analyzePhotos(fotos) {
  if (!isEnabled() || fotos.length === 0) {
    return fotos.map(f => ({ ...f, analise_ia: null }))
  }
  const results = await Promise.allSettled(
    fotos.map(f => analyzePhoto(f.buffer, f.mime))
  )
  return fotos.map((f, i) => ({
    ...f,
    analise_ia: results[i].status === 'fulfilled' ? results[i].value : null,
  }))
}
