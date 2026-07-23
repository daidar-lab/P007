import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendComunicadoEmail(comunicado, emailTo, nomeTo) {
  if (!emailTo) return
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[mailer] SMTP não configurado. Pulando envio de email para:', emailTo)
    return
  }

  let fromName = process.env.EMAIL_FROM || 'Comunicado de Intervenção · CCI'
  fromName = fromName.replace(/^["']|["']$/g, '') // Remove aspas caso o usuário tenha colocado no .env
  const from = `"${fromName}" <${process.env.SMTP_USER}>`

  const baseUrl = 'https://comunicadointervencao.cervejariacidadeimperial.com'
  const link = `${baseUrl}/#/comunicados/${comunicado.id}`

  const text = `Olá ${nomeTo || 'Equipe'},

Foi registrado um novo Comunicado de Intervenção na área associada ao seu perfil.

ID: ${comunicado.id}
Data/Hora: ${comunicado.data_comunicado} ${comunicado.hora_comunicado}
Atividade: ${comunicado.atividade || 'Não especificada'}
Intervenção por: ${comunicado.intervencao_por || 'Não especificado'}
Alto Risco Potencial: ${comunicado.alto_risco_potencial ? 'Sim' : 'Não'}

Por favor, acesse o link para visualizar mais detalhes e analisar as fotos:
${link}`

  const html = `<div style="font-family: sans-serif; color: #111;">
  <p>Olá <strong>${nomeTo || 'Equipe'}</strong>,</p>
  <p>Foi registrado um novo Comunicado de Intervenção na área associada ao seu perfil.</p>
  <ul>
    <li><strong>ID:</strong> ${comunicado.id}</li>
    <li><strong>Data/Hora:</strong> ${comunicado.data_comunicado} ${comunicado.hora_comunicado}</li>
    <li><strong>Atividade:</strong> ${comunicado.atividade || 'Não especificada'}</li>
    <li><strong>Intervenção por:</strong> ${comunicado.intervencao_por || 'Não especificado'}</li>
    <li><strong>Alto Risco Potencial:</strong> ${comunicado.alto_risco_potencial ? 'Sim' : 'Não'}</li>
  </ul>
  <p>Por favor, acesse <a href="${link}" style="color: #0056b3; font-weight: bold;">este link</a> para visualizar mais detalhes e analisar as fotos no sistema.</p>
</div>`

  try {
    const info = await transporter.sendMail({
      from,
      to: emailTo,
      subject: `[CCI] Novo Comunicado de Intervenção - ID ${comunicado.id}`,
      text,
      html,
    })
    console.log(`[mailer] Email enviado para ${emailTo}: ${info.messageId}`)
  } catch (err) {
    console.error(`[mailer] Erro ao enviar email para ${emailTo}:`, err)
  }
}
