import Header from '../components/Header.jsx'
import { List } from '../components/ListItem.jsx'
import ListItem from '../components/ListItem.jsx'
import Badge from '../components/Badge.jsx'
import { navigate } from '../lib/router.js'
import { getUser } from '../lib/auth.js'
import { hasPermission, PERMISSIONS } from '../lib/rbac.js'

const ENTIDADES = [
  {
    key: 'classificacoes',
    title: 'Classificações',
    subtitle: 'Tipos de reporte (Etapa 1 do comunicado)',
    perm: PERMISSIONS.CADASTROS_MANAGE,
  },
  {
    key: 'filiais',
    title: 'Filiais',
    subtitle: 'Frutal, Petrópolis e outras unidades',
    perm: PERMISSIONS.CADASTROS_MANAGE,
  },
  {
    key: 'areas',
    title: 'Áreas',
    subtitle: 'Áreas organizacionais por filial',
    perm: PERMISSIONS.CADASTROS_MANAGE,
  },
  {
    key: 'setores',
    title: 'Setores',
    subtitle: 'Subdivisão das áreas',
    perm: PERMISSIONS.CADASTROS_MANAGE,
  },
  {
    key: 'itens-observados',
    title: 'Itens observados',
    subtitle: 'Checklist da Etapa 4 do comunicado',
    perm: PERMISSIONS.CADASTROS_MANAGE,
  },
  {
    key: 'usuarios',
    title: 'Usuários',
    subtitle: 'Crie e gerencie quem acessa o sistema',
    perm: PERMISSIONS.USUARIOS_MANAGE,
    highlight: true,
  },
  {
    key: 'emails-workflow',
    title: 'Workflow de E-mails',
    subtitle: 'Destinatários para alertas de comunicados',
    perm: PERMISSIONS.CADASTROS_MANAGE,
  },
]

export default function CadastrosIndex() {
  const user = getUser()
  const visiveis = ENTIDADES.filter(e => hasPermission(user, e.perm))

  return (
    <div className="screen screen--wide">
      <Header
        title="Cadastros"
        subtitle="Gerencie as listas usadas no Comunicado"
      />
      {visiveis.length === 0 ? (
        <p className="text-muted">Nenhum cadastro disponível para o seu perfil.</p>
      ) : (
        <List>
          {visiveis.map(e => (
            <ListItem
              key={e.key}
              title={e.title}
              subtitle={e.subtitle}
              trailing={e.highlight ? <Badge variant="outline">Admin</Badge> : null}
              showChevron
              onClick={() => navigate(`cadastros/${e.key}`)}
            />
          ))}
        </List>
      )}
    </div>
  )
}
