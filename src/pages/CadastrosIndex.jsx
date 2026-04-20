import Header from '../components/Header.jsx'
import { List } from '../components/ListItem.jsx'
import ListItem from '../components/ListItem.jsx'
import Badge from '../components/Badge.jsx'
import { navigate } from '../lib/router.js'

const ENTIDADES = [
  {
    key: 'classificacoes',
    title: 'Classificações',
    subtitle: 'Tipos de reporte (Etapa 1 do comunicado)',
    available: true,
  },
  {
    key: 'filiais',
    title: 'Filiais',
    subtitle: 'Frutal, Petrópolis e outras unidades',
    available: true,
  },
  {
    key: 'areas',
    title: 'Áreas',
    subtitle: 'Áreas organizacionais por filial',
    available: true,
  },
  {
    key: 'setores',
    title: 'Setores',
    subtitle: 'Subdivisão das áreas',
    available: true,
  },
  {
    key: 'itens-observados',
    title: 'Itens observados',
    subtitle: 'Checklist da Etapa 4 do comunicado',
    available: true,
  },
]

export default function CadastrosIndex() {
  return (
    <div className="screen">
      <Header
        title="Cadastros"
        subtitle="Gerencie as listas usadas no Comunicado"
      />
      <List>
        {ENTIDADES.map(e => (
          <ListItem
            key={e.key}
            title={e.title}
            subtitle={e.subtitle}
            trailing={!e.available ? <Badge variant="soft">em breve</Badge> : null}
            showChevron={e.available}
            onClick={() => e.available && navigate(`cadastros/${e.key}`)}
          />
        ))}
      </List>
    </div>
  )
}
