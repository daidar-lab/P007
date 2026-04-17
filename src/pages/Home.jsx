import { useState } from 'react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import Field, { FieldRow } from '../components/Field.jsx'
import TextField from '../components/TextField.jsx'
import TextArea from '../components/TextArea.jsx'
import RadioGroup from '../components/RadioGroup.jsx'
import CheckboxGroup from '../components/CheckboxGroup.jsx'
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

const EMPTY = {
  classificacao: '',
  empresa: '', unidade: '',
  data: '', hora: '', turno: '',
  area: '', setor: '',
  atividade: '',
  intervencaoPor: '',
  matricula: '', funcao: '',
  observacoes: [], outros: '',
  descricao: '',
  acoes: '',
  altoRisco: '',
}

export default function Home() {
  const [form, setForm] = useState(EMPTY)
  const [sent, setSent] = useState(false)

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))
  const onInput = (k) => (e) => set(k)(e.target.value)

  const submit = (e) => {
    e.preventDefault()
    console.log('Comunicado de Intervenção:', form)
    setSent(true)
    setTimeout(() => setSent(false), 3500)
  }

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

      <Card elevated padding="lg" className="stack stack-md">
        <Field label="Classificação" required>
          <RadioGroup
            name="classificacao"
            value={form.classificacao}
            onChange={set('classificacao')}
            options={[
              { value: 'comportamento', label: 'Comportamento Inseguro' },
              { value: 'condicao',      label: 'Condição Insegura' },
              { value: 'quase_acidente',label: 'Quase Acidente' },
            ]}
          />
        </Field>
      </Card>

      <section className="stack stack-md">
        <h2 className="section-title">Identificação</h2>
        <Card padding="lg" className="stack stack-md">
          <FieldRow>
            <Field label="Empresa">
              <TextField
                value={form.empresa}
                onChange={onInput('empresa')}
                placeholder="Ex.: Cidade Imperial"
              />
            </Field>
            <Field label="Unidade">
              <TextField
                value={form.unidade}
                onChange={onInput('unidade')}
                placeholder="Ex.: Matriz"
              />
            </Field>
          </FieldRow>

          <FieldRow>
            <Field label="Data">
              <TextField type="date" value={form.data} onChange={onInput('data')} />
            </Field>
            <Field label="Hora">
              <TextField type="time" value={form.hora} onChange={onInput('hora')} />
            </Field>
          </FieldRow>

          <Field label="Turno">
            <RadioGroup
              name="turno"
              value={form.turno}
              onChange={set('turno')}
              options={[
                { value: '1', label: '1º' },
                { value: '2', label: '2º' },
                { value: '3', label: '3º' },
                { value: 'adm', label: 'ADM' },
              ]}
            />
          </Field>

          <Field label="Área onde a intervenção foi realizada">
            <TextField
              value={form.area}
              onChange={onInput('area')}
              placeholder="Ex.: Área de produção"
            />
          </Field>

          <Field label="Setor onde a intervenção foi realizada">
            <TextField
              value={form.setor}
              onChange={onInput('setor')}
              placeholder="Ex.: Linha 02"
            />
          </Field>

          <Field label="Atividade realizada no momento da intervenção">
            <TextArea
              value={form.atividade}
              onChange={onInput('atividade')}
              placeholder="Descreva a atividade em andamento"
            />
          </Field>
        </Card>
      </section>

      <section className="stack stack-md">
        <h2 className="section-title">Responsável pela intervenção</h2>
        <Card padding="lg" className="stack stack-md">
          <Field label="Intervenção realizada por">
            <TextField
              value={form.intervencaoPor}
              onChange={onInput('intervencaoPor')}
              placeholder="Nome completo"
            />
          </Field>
          <FieldRow>
            <Field label="Matrícula">
              <TextField
                value={form.matricula}
                onChange={onInput('matricula')}
                placeholder="000000"
                inputMode="numeric"
              />
            </Field>
            <Field label="Função">
              <TextField
                value={form.funcao}
                onChange={onInput('funcao')}
                placeholder="Ex.: Técnico"
              />
            </Field>
          </FieldRow>
        </Card>
      </section>

      <section className="stack stack-md">
        <h2 className="section-title">O que observei?</h2>
        <CheckboxGroup
          value={form.observacoes}
          onChange={set('observacoes')}
          options={OBSERVACAO_OPTIONS}
        />
        <Field label="Outros">
          <TextField
            value={form.outros}
            onChange={onInput('outros')}
            placeholder="Descreva outra condição observada"
          />
        </Field>
      </section>

      <section className="stack stack-md">
        <h2 className="section-title">Relato</h2>
        <Card padding="lg" className="stack stack-md">
          <Field label="Breve descrição do que foi observado">
            <TextArea
              rows={5}
              value={form.descricao}
              onChange={onInput('descricao')}
              placeholder="O que aconteceu, quando e onde"
            />
          </Field>
          <Field label="O que fiz a respeito (ações imediatas)">
            <TextArea
              rows={5}
              value={form.acoes}
              onChange={onInput('acoes')}
              placeholder="Ação tomada no momento"
            />
          </Field>
        </Card>
      </section>

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

      <div className="stack stack-sm" style={{ marginTop: 'var(--space-2)' }}>
        <Button type="submit" variant="primary" size="lg" full>
          Enviar Comunicado
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="md"
          full
          onClick={() => setForm(EMPTY)}
        >
          Limpar formulário
        </Button>
        <p className="disclaimer">
          Entregar o Comunicado de Intervenção à Segurança do Trabalho.
        </p>
      </div>

      {sent && (
        <div className="toast" role="status">
          Comunicado registrado. Obrigado pelo reporte.
        </div>
      )}
    </form>
  )
}
