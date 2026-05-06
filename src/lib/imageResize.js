// Reduz a resolução/qualidade de uma imagem antes do upload.
// Usa createImageBitmap + canvas (suportado em todos os browsers modernos).
// Se o redimensionamento falhar (formato exótico, browser antigo), devolve
// o arquivo original — assim o upload nunca quebra por causa do resize.

const DEFAULT_OPTS = {
  maxSide: 1920,
  quality: 0.85,
  // Apenas comprime imagens raster comuns; SVG/HEIC/etc. passam sem alteração.
  compressMime: /^image\/(jpeg|jpg|png|webp)$/i,
  // Se a imagem original já estiver abaixo desse limite e dentro do tamanho
  // máximo, não é re-encodada.
  skipBelowBytes: 600 * 1024,   // 600 KB
}

export async function resizeImage(file, options = {}) {
  const opts = { ...DEFAULT_OPTS, ...options }

  if (!file || !file.type) return file
  if (!opts.compressMime.test(file.type)) return file

  // Atalho: já é pequena o bastante? Não mexe.
  if (file.size <= opts.skipBelowBytes) return file

  try {
    const bitmap = await createImageBitmap(file)
    const { maxSide, quality } = opts
    const longest = Math.max(bitmap.width, bitmap.height)
    const scale   = longest > maxSide ? maxSide / longest : 1
    const w = Math.round(bitmap.width  * scale)
    const h = Math.round(bitmap.height * scale)

    const canvas = makeCanvas(w, h)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close?.()

    const blob = await canvasToBlob(canvas, 'image/jpeg', quality)
    if (!blob) return file

    // Se por algum motivo o output ficou maior que o original, mantém o original.
    if (blob.size >= file.size) return file

    // Reembrulha como File mantendo o nome (com extensão jpg).
    const newName = file.name.replace(/\.(png|webp|jpe?g)$/i, '') + '.jpg'
    return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() })
  } catch {
    return file  // qualquer falha → original
  }
}

function makeCanvas(w, h) {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(w, h)
  }
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function canvasToBlob(canvas, mime, quality) {
  // OffscreenCanvas usa convertToBlob; HTMLCanvasElement usa toBlob.
  if (canvas.convertToBlob) {
    return canvas.convertToBlob({ type: mime, quality })
  }
  return new Promise((resolve) => canvas.toBlob(resolve, mime, quality))
}
