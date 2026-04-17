import { useState } from 'react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import Stepper from '../components/Stepper.jsx'
import Field, { FieldRow } from '../components/Field.jsx'
import TextField from '../components/TextField.jsx'
import TextArea from '../components/TextArea.jsx'
import RadioGroup from '../components/RadioGroup.jsx'
import CheckboxGroup from '../components/CheckboxGroup.jsx'
import PhotoUploader from '../components/PhotoUploader.jsx'
import { ChevronLeft, ChevronRight } from '../components/Icon.jsx'
import './Home.css'

const OBSERVACAO_OPTIONS = [
  { value: 'condicao_estrutural', label: 'Condição estrutural do local ou equipamento' },
  { value: 'permissao_trabalho',  label: 'Permissão de Trabalho e/ou procedimentos' },
  { value: 'movimentacao_cargas', label: 'Elevação e Movimentação de Cargas' },
  { value: 'espaco_confinado',    label: 'Espaço Confinado' },
  { value: 'loto',                label: 'LOTO — Bloqueio de Energias Perigosas (Lock Out / Tag Out)' },
  { value: 'eletricidade',        label: 'Serviço em eletricidade' },
  { value: 'trabalho_quente',     label: 'Trabalho à Quente' },
  { value: 'trabalho_altura',     label: 'Trabalho em Altura' },
  { value: 'epi_epc',             label: "Uso de EPI's / EPC's" },
  { value: 'produtos_quimicos',   label: 'Produtos Químicos' },
  { value: 'escavacao',           label: 'Escavação / Perfuração / Demolição' },
  { value: 'meio_ambiente',       label: 'Meio Ambiente' },
]

const STEPS = [
  'Classificação',
  'Identificação',
  'Responsável',
  'Observações',
  'Relato',
  'Fotos & envio',
]

const EMPRESA_OPTIONS = [
  { value: 'frutal',     label: 'Frutal' },
  { value: 'petropolis', label: 'Petrópolis' },
]

const pad = (n) => String(n).padStart(2, '0')
const nowParts = () => {
  const d = new Date()
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}
const emptyForm = () => {
  const { date, time } = nowParts()
  return {
    classificacao: '',
    empresa: '',
    data: date, hora: time,
    area: '', setor: '',
    atividade: '',
    intervencaoPor: '',
    matricula: '', funcao: '',
    observacoes: [], outros: '',
    descricao: '',
    acoes: '',
    altoRisco: '',
    fotos: [],
  }
}

export default function Home() {
  const [form, setForm] = useState(emptyForm)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [sentCount, setSentCount] = useState(0)

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))
  const onInput = (k) => (e) => set(k)(e.target.value)

  const { date: todayStr, time: nowTimeStr } = nowParts()

  const onDataChange = (e) => {
    let value = e.target.value || todayStr
    if (value > todayStr) value = todayStr
    setForm(f => {
      const hora = value === todayStr && f.hora > nowTimeStr ? nowTimeStr : f.hora
      return { ...f, data: value, hora }
    })
  }
  const onHoraChange = (e) => {
    let value = e.target.value || nowTimeStr
    if (form.data === todayStr && value > nowTimeStr) value = nowTimeStr
    set('hora')(value)
  }

  const filled = (v) => typeof v === 'string' ? v.trim().length > 0 : !!v

  const canAdvance = () => {
    switch (step) {
      case 0:
        return filled(form.classificacao)
      case 1:
        return (
          filled(form.empresa) &&
          filled(form.data) &&
          filled(form.hora) &&
          filled(form.area) &&
          filled(form.setor) &&
          filled(form.atividade)
        )
      case 2:
        return (
          filled(form.intervencaoPor) &&
          filled(form.matricula) &&
          filled(form.funcao)
        )
      case 3: {
        if (form.observacoes.length === 0) return false
        if (form.observacoes.includes('outros') && !filled(form.outros)) return false
        return true
      }
      case 4:
        return (
          filled(form.descricao) &&
          filled(form.acoes) &&
          filled(form.altoRisco)
        )
      case 5:
        return true
      default:
        return true
    }
  }

  const goBack = () => setStep(s => Math.max(0, s - 1))
  const goNext = () => setStep(s => Math.min(STEPS.length - 1, s + 1))

  const submit = async (e) => {
    e.preventDefault()
    if (!canAdvance() || submitting) return
    setSubmitting(true)

    // Simula envio do comunicado e upload das fotos.
    // Dados do formulário: ~600ms. Cada foto: +400ms (máx. 5s no total).
    const photoCount = form.fotos.length
    const delay = Math.min(600 + photoCount * 400, 5000)
    await new Promise(resolve => setTimeout(resolve, delay))

    console.log('Comunicado de Intervenção:', form)

    form.fotos.forEach(p => URL.revokeObjectURL(p.src))
    setSubmitting(false)
    setSentCount(photoCount)
    setSent(true)

    setTimeout(() => {
      setSent(false)
      setForm(emptyForm())
      setStep(0)
    }, 2800)
  }

  const isLast = step === STEPS.length - 1

  return (
    <form className="screen" onSubmit={submit} noValidate>
      <div className="brand">
        <div className="brand__logo">CI</div>
        <div>
          <p className="brand__name">Cidade Imperial</p>
          <p className="brand__tag">Segurança do Trabalho · Interno</p>
        </div>
      </div>

      <Header
        title="Comunicado de Intervenção"
        subtitle="Condições e comportamentos inseguros"
      />

      <Stepper steps={STEPS} current={step} />

      <div className="wizard-step">
        {step === 0 && (
          <Card elevated padding="lg" className="stack stack-md">
            <Field label="Classificação" required>
              <RadioGroup
                name="classificacao"
                value={form.classificacao}
                onChange={set('classificacao')}
                direction="col"
                options={[
                  { value: 'comportamento',  label: 'Comportamento Inseguro' },
                  { value: 'condicao',       label: 'Condição Insegura' },
                  { value: 'quase_acidente', label: 'Quase Acidente' },
                ]}
              />
            </Field>
          </Card>
        )}

        {step === 1 && (
          <Card padding="lg" className="stack stack-md">
            <Field label="Empresa" required>
              <RadioGroup
                name="empresa"
                value={form.empresa}
                onChange={set('empresa')}
                options={EMPRESA_OPTIONS}
              />
            </Field>
            <FieldRow>
              <Field label="Data" hint="Não pode ser futura" required>
                <TextField
                  type="date"
                  value={form.data}
                  max={todayStr}
                  onChange={onDataChange}
                />
              </Field>
              <Field label="Hora" hint="Não pode ser futura" required>
                <TextField
                  type="time"
                  value={form.hora}
                  max={form.data === todayStr ? nowTimeStr : undefined}
                  onChange={onHoraChange}
                />
              </Field>
            </FieldRow>
            <Field label="Área onde a intervenção foi realizada" required>
              <TextField value={form.area} onChange={onInput('area')} placeholder="Ex.: Área de produção" />
            </Field>
            <Field label="Setor onde a intervenção foi realizada" required>
              <TextField value={form.setor} onChange={onInput('setor')} placeholder="Ex.: Linha 02" />
            </Field>
            <Field label="Atividade realizada no momento da intervenção" required>
              <TextArea value={form.atividade} onChange={onInput('atividade')} placeholder="Descreva a atividade em andamento" />
            </Field>
          </Card>
        )}

        {step === 2 && (
          <Card padding="lg" className="stack stack-md">
            <Field label="Intervenção realizada por" required>
              <TextField value={form.intervencaoPor} onChange={onInput('intervencaoPor')} placeholder="Nome completo" />
            </Field>
            <FieldRow>
              <Field label="Matrícula" required>
                <TextField value={form.matricula} onChange={onInput('matricula')} placeholder="000000" inputMode="numeric" />
              </Field>
              <Field label="Função" required>
                <TextField value={form.funcao} onChange={onInput('funcao')} placeholder="Ex.: Técnico" />
              </Field>
            </FieldRow>
          </Card>
        )}

        {step === 3 && (
          <Field label="Itens observados" hint="Marque ao menos um item" required>
            <CheckboxGroup
              value={form.observacoes}
              onChange={set('observacoes')}
              options={[
                ...OBSERVACAO_OPTIONS,
                {
                  value: 'outros',
                  label: 'Outros',
                  extra: (
                    <TextField
                      value={form.outros}
                      onChange={onInput('outros')}
                      placeholder="Descreva outra condição observada"
                      autoFocus
                    />
                  ),
                },
              ]}
            />
          </Field>
        )}

        {step === 4 && (
          <div className="stack stack-md">
            <Card padding="lg" className="stack stack-md">
              <Field label="Breve descrição do que foi observado" required>
                <TextArea
                  rows={5}
                  value={form.descricao}
                  onChange={onInput('descricao')}
                  placeholder="O que aconteceu, quando e onde"
                />
              </Field>
              <Field label="O que fiz a respeito (ações imediatas)" required>
                <TextArea
                  rows={5}
                  value={form.acoes}
                  onChange={onInput('acoes')}
                  placeholder="Ação tomada no momento"
                />
              </Field>
            </Card>

            <Card elevated padding="lg">
              <Field label="A classificação deste reporte é de Alto Risco Potencial?" required>
                <RadioGroup
                  name="altoRisco"
                  value={form.altoRisco}
                  onChange={set('altoRisco')}
                  options={[
                    { value: 'sim', label: 'Sim' },
                    { value: 'nao', label: 'Não' },
                  ]}
                />
              </Field>
            </Card>
          </div>
        )}

        {step === 5 && (
          <div className="stack stack-md">
            <Field
              label="Fotos da intervenção"
              hint="Opcional — adicione até 10 fotos da galeria ou tire na hora"
            >
              <PhotoUploader
                value={form.fotos}
                onChange={set('fotos')}
                max={10}
              />
            </Field>
            <p className="disclaimer">
              Ao enviar, este comunicado será entregue à Segurança do Trabalho.
            </p>
          </div>
        )}
      </div>

      {!canAdvance() && (
        <p className="required-hint">
          Preencha todos os campos desta etapa para continuar.
        </p>
      )}

      <div className="wizard-actions">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={goBack}
          disabled={step === 0 || submitting}
          icon={<ChevronLeft width={18} height={18} />}
        >
          Voltar
        </Button>

        {isLast ? (
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!canAdvance() || submitting}
            icon={submitting ? <span className="spinner" aria-hidden="true" /> : null}
          >
            {submitting
              ? (form.fotos.length > 0
                  ? `Enviando ${form.fotos.length} ${form.fotos.length === 1 ? 'foto' : 'fotos'}…`
                  : 'Enviando…')
              : 'Enviar Comunicado'}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={goNext}
            disabled={!canAdvance()}
            iconRight={<ChevronRight width={18} height={18} />}
          >
            Avançar
          </Button>
        )}
      </div>

      {sent && (
        <div className="toast" role="status">
          {sentCount > 0
            ? `Comunicado registrado com ${sentCount} ${sentCount === 1 ? 'foto' : 'fotos'}.`
            : 'Comunicado registrado. Obrigado pelo reporte.'}
        </div>
      )}
    </form>
  )
}
