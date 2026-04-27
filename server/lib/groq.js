// Análise de imagens via Groq (API OpenAI-compatível).
// Não precisa de SDK — usa fetch nativo do Node 22.
// Mantém o mesmo contrato (analyzePhoto, analyzePhotos, isEnabled, describe)
// pra ser plugado nas rotas sem mais alterações.

const API_URL  = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL    = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct'
const MAX_TOKENS = 600

const PROMPT = `Você é um especialista em Segurança do Trabalho analisando uma foto enviada num Comunicado de Intervenção.

Analise a imagem e produza uma resposta CONCISA (máximo 180 palavras) em PORTUGUÊS, dividida em três partes curtas:

1. **O que a foto mostra** (1-2 frases descrevendo a cena).
2. **Riscos identificados** — liste apenas riscos VISÍVEIS na foto (ex.: trabalho em altura sem EPI, condições estruturais inseguras, cabos expostos, espaço confinado, falta de sinalização, produtos químicos sem identificação, ergonomia inadequada, falta de proteção coletiva, etc.). Se não houver risco aparente, diga "Nenhum risco visível".
3. **Recomendações** — uma ou duas ações de correção/mitigação aplicáveis ao contexto.

Use linguagem técnica e objetiva. Se a imagem não tiver relação com Segurança do Trabalho, indique brevemente.`

export function isEnabled() {
  return !!process.env.GROQ_API_KEY
}

export function describe() {
  return { enabled: isEnabled(), provider: 'groq', model: MODEL }
}

function mimeOk(mime) {
  return /^image\/(jpeg|jpg|png|gif|webp)$/i.test(String(mime || ''))
}

/**
 * Analisa uma foto via Groq (chat completions multimodal).
 * @param {Buffer} buffer  Bytes da imagem.
 * @param {string} mime    MIME type (image/jpeg, image/png, image/webp, image/gif).
 * @returns {Promise<string|null>}  Texto da análise ou null em caso de falha.
 */
export async function analyzePhoto(buffer, mime) {
  if (!isEnabled()) {
    console.warn('[groq] desabilitado (GROQ_API_KEY vazio) — pulando análise')
    return null
  }
  if (!mimeOk(mime)) {
    console.warn(`[groq] MIME não suportado: ${mime} — pulando análise`)
    return null
  }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 60_000)

  const t0 = Date.now()
  try {
    const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`
    const body = {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.2,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      }],
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error(
        `[groq] FALHA HTTP ${res.status} model=${MODEL}: ${errText.slice(0, 600)}`
      )
      return null
    }

    const json = await res.json()
    const text = json?.choices?.[0]?.message?.content
    const trimmed = typeof text === 'string' ? text.trim() : ''
    console.log(
      `[groq] ok em ${Date.now() - t0}ms ` +
      `(${trimmed.length} chars, ${buffer.length} bytes ${mime})`
    )
    return trimmed || null
  } catch (err) {
    console.error(`[groq] FALHA ${err.name || 'Error'}: ${err.message}`)
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
