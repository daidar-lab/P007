import { useState } from 'react'
import StatusBar from '../components/StatusBar.jsx'
import Header from '../components/Header.jsx'
import SearchBar from '../components/SearchBar.jsx'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import { List } from '../components/ListItem.jsx'
import ListItem from '../components/ListItem.jsx'
import Avatar from '../components/Avatar.jsx'
import Badge from '../components/Badge.jsx'
import Switch from '../components/Switch.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'
import TabBar from '../components/TabBar.jsx'
import {
  Plus, Bell, Home as HomeIcon, Compass, Heart, User,
  Moon, Lock, Globe, Card as CardIcon, Settings
} from '../components/Icon.jsx'
import './Home.css'

export default function Home() {
  const [segment, setSegment] = useState('hoje')
  const [tab, setTab] = useState('home')

  return (
    <>
      <StatusBar />
      <div className="screen">
        <Header
          leading={<Avatar name="AR" size={36} />}
          title="Bom dia, Ana"
          subtitle="Quarta, 17 abr"
          trailing={
            <Button variant="secondary" size="sm" icon={<Bell width={18} height={18} />} aria-label="Notificações" />
          }
        />

        <SearchBar placeholder="Buscar ações, pessoas, lugares" />

        <SegmentedControl
          value={segment}
          onChange={setSegment}
          options={[
            { value: 'hoje', label: 'Hoje' },
            { value: 'semana', label: 'Semana' },
            { value: 'mes', label: 'Mês' },
          ]}
        />

        <Card elevated padding="lg">
          <div className="row row-between">
            <span className="text-section">Saldo</span>
            <Badge variant="outline">Conta principal</Badge>
          </div>
          <div className="balance">
            <span className="balance__value">R$ 12.480</span>
            <span className="balance__decimals">,32</span>
          </div>
          <p className="text-muted" style={{ margin: '4px 0 20px' }}>
            +R$ 248,90 hoje · 12 transações
          </p>
          <div className="row row-gap-3">
            <Button variant="primary" icon={<Plus width={18} height={18} />}>Enviar</Button>
            <Button variant="secondary">Receber</Button>
            <Button variant="ghost" size="md" icon={<Settings width={18} height={18} />} aria-label="Ajustes" />
          </div>
        </Card>

        <section className="stack stack-md">
          <div className="row row-between">
            <h2 className="text-title" style={{ margin: 0 }}>Atalhos</h2>
            <button className="link">Ver todos</button>
          </div>
          <div className="shortcuts">
            {[
              { icon: <CardIcon />, label: 'Cartões' },
              { icon: <Globe />, label: 'Câmbio' },
              { icon: <Lock />, label: 'Cofre' },
              { icon: <Heart />, label: 'Favoritos' },
            ].map(s => (
              <button key={s.label} className="shortcut">
                <span className="shortcut__icon">{s.icon}</span>
                <span className="shortcut__label">{s.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="stack stack-md">
          <h2 className="text-title" style={{ margin: 0 }}>Ajustes</h2>
          <List>
            <ListItem
              leading={<Moon width={18} height={18} />}
              title="Aparência"
              subtitle="Automático"
              trailing={<span>Sistema</span>}
              showChevron
            />
            <ListItem
              leading={<Bell width={18} height={18} />}
              title="Notificações"
              subtitle="Push, e-mail e SMS"
              trailing={<Switch defaultChecked />}
            />
            <ListItem
              leading={<Lock width={18} height={18} />}
              title="Privacidade"
              subtitle="Face ID ativo"
              showChevron
            />
            <ListItem
              leading={<Globe width={18} height={18} />}
              title="Idioma"
              trailing={<span>Português</span>}
              showChevron
            />
          </List>
        </section>

        <section className="stack stack-md">
          <h2 className="text-title" style={{ margin: 0 }}>Pessoas</h2>
          <List>
            {[
              { n: 'Marina Alves', s: 'Enviou R$ 120,00', t: '09:24' },
              { n: 'Pedro Lima',   s: 'Solicitou R$ 45,00', t: '08:57' },
              { n: 'Júlia Rocha',  s: 'Você enviou R$ 300', t: 'Ontem' },
            ].map(p => (
              <ListItem
                key={p.n}
                leading={<Avatar name={p.n} size={36} />}
                title={p.n}
                subtitle={p.s}
                trailing={<span className="text-subtle">{p.t}</span>}
                showChevron
              />
            ))}
          </List>
        </section>

        <TabBar
          value={tab}
          onChange={setTab}
          items={[
            { value: 'home',    label: 'Início',  icon: <HomeIcon width={20} height={20} /> },
            { value: 'explore', label: 'Explorar',icon: <Compass width={20} height={20} /> },
            { value: 'favs',    label: 'Favoritos',icon: <Heart width={20} height={20} /> },
            { value: 'me',      label: 'Perfil',  icon: <User width={20} height={20} /> },
          ]}
        />
      </div>
    </>
  )
}
