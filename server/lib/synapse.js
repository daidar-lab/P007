 import sharp from 'sharp'



 const API_URL  = 'https://bsynapse.cervejariacidadeimperial.com/api/v1/analyze/intervencao' // endpoint compatível com OpenAI (chat completions multimodal)


  const PROMPT = `Você é um especialista em Segurança do Trabalho analisando uma foto enviada num Comunicado de Intervenção.

  Analise a imagem e produza uma resposta CONCISA (máximo 180 palavras) em PORTUGUÊS, dividida em três partes curtas:

  1. **O que a foto mostra** (1-2 frases descrevendo a cena).
  2. **Riscos identificados** — liste apenas riscos VISÍVEIS na foto (ex.: trabalho em altura sem EPI, condições estruturais inseguras, cabos expostos, espaço confinado, falta de sinalização, produtos químicos sem identificação, ergonomia inadequada, falta de proteção coletiva, etc.). Se não houver risco aparente, diga "Nenhum risco visível".
  3. **Recomendações** — uma ou duas ações de correção/mitigação aplicáveis ao contexto.

  Use linguagem técnica e objetiva. Se a imagem não tiver relação com Segurança do Trabalho, indique brevemente.`

  export function isEnabled() {
    return !!process.env.API_KEY
  }
  async function reduzirImagem(buffer) {
    return sharp(buffer)
      .resize({ width: 800 })
      .jpeg({ quality: 60 })
      .toBuffer()
  }
  export function describe() {
  return { enabled: isEnabled(), provider: 'synapse' }
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
    console.warn('[IA] desabilitado (API_KEY vazio) — pulando análise')
    return null
  }

  if (!mimeOk(mime)) {
    console.warn(`[IA] MIME não suportado: ${mime} — pulando análise`)
    return null
  }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 60_000)

  try {
    // ✅ 1. REDUZ imagem primeiro
    const imgReduzida = await reduzirImagem(buffer)

    // ✅ 2. MONTA body com imagem reduzida
    const body = {
      prompt: PROMPT,
      image: imgReduzida.toString('base64'),
      mime: 'image/jpeg' // importante: agora é sempre jpeg
    }

    // ✅ 3. ENVIA request
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error(`[IA] FALHA HTTP ${res.status}: ${errText.slice(0, 600)}`)
      return null
    }

    const json = await res.json()
    console.log('[IA RESPONSE]', json)

    return json.data || json.result || json.analysis || null


  } catch (err) {
    console.error(`[IA] FALHA ${err.name || 'Error'}: ${err.message}`)
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