import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, Users, Car, ClipboardList, LogIn, LogOut,
  Plus, Trash2, Search, Printer, MessageCircle, Wrench, CheckCircle2,
  Clock3, CircleDollarSign, Menu, X
} from 'lucide-react';
import './styles.css';

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const money = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const todayISO = () => new Date().toISOString().slice(0, 10);
const nowBR = () => new Date().toLocaleString('pt-BR');

function useLocalState(key, initial) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; } catch { return initial; }
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value]);
  return [value, setValue];
}

const statusList = ['Aguardando', 'Em serviço', 'Aguardando peças', 'Pronto', 'Entregue'];

function App() {
  const [logged, setLogged] = useLocalState('vinicar_logged', false);
  const [clients, setClients] = useLocalState('vinicar_clients', []);
  const [vehicles, setVehicles] = useLocalState('vinicar_vehicles', []);
  const [orders, setOrders] = useLocalState('vinicar_orders', []);
  const [page, setPage] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!logged) return <Login onLogin={() => setLogged(true)} />;

  const nav = [
    ['dashboard', 'Painel', LayoutDashboard],
    ['clients', 'Clientes', Users],
    ['vehicles', 'Veículos', Car],
    ['orders', 'Ordens de Serviço', ClipboardList],
    ['entry', 'Entrada de veículo', LogIn],
    ['exit', 'Saída / Entrega', LogOut],
  ];

  return (
    <div className="app-shell">
      <aside className={mobileOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand"><div className="brand-mark">V</div><div><strong>VINICAR</strong><span>Auto Center</span></div></div>
        <button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={22}/></button>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button key={id} className={page === id ? 'nav-item active' : 'nav-item'} onClick={() => { setPage(id); setMobileOpen(false); }}>
              <Icon size={19}/> {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">Seu carro, nossa paixão.</div>
      </aside>

      <main className="content">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMobileOpen(true)}><Menu/></button>
          <div><h1>{nav.find(n => n[0] === page)?.[1]}</h1><p>Controle operacional da oficina</p></div>
          <button className="ghost" onClick={() => setLogged(false)}>Sair</button>
        </header>

        {page === 'dashboard' && <Dashboard orders={orders} vehicles={vehicles}/>} 
        {page === 'clients' && <Clients clients={clients} setClients={setClients}/>} 
        {page === 'vehicles' && <Vehicles vehicles={vehicles} setVehicles={setVehicles} clients={clients}/>} 
        {page === 'orders' && <Orders orders={orders} setOrders={setOrders} clients={clients} vehicles={vehicles}/>} 
        {page === 'entry' && <Entry clients={clients} setClients={setClients} vehicles={vehicles} setVehicles={setVehicles} orders={orders} setOrders={setOrders} onDone={() => setPage('orders')}/>} 
        {page === 'exit' && <Exit orders={orders} setOrders={setOrders}/>} 
      </main>
    </div>
  );
}

function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (user.trim() && pass.trim()) onLogin(); else setError('Digite usuário e senha.');
  };
  return <div className="login-page">
    <form className="login-card" onSubmit={submit}>
      <div className="login-logo">V</div>
      <h1>Vinicar Auto Center</h1>
      <p>Sistema de Ordem de Serviço</p>
      <label>Usuário<input value={user} onChange={e=>setUser(e.target.value)} placeholder="ex.: vinicar"/></label>
      <label>Senha<input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••"/></label>
      {error && <div className="error">{error}</div>}
      <button className="primary" type="submit">Entrar</button>
      <small>Primeira versão: o login aceita qualquer usuário e senha preenchidos.</small>
    </form>
  </div>;
}

function Dashboard({ orders, vehicles }) {
  const open = orders.filter(o => o.status !== 'Entregue');
  const ready = orders.filter(o => o.status === 'Pronto');
  const delivered = orders.filter(o => o.status === 'Entregue');
  const revenue = delivered.reduce((s,o)=>s+Number(o.total||0),0);
  return <>
    <section className="cards four">
      <Stat icon={Car} label="Na oficina" value={open.length}/>
      <Stat icon={Wrench} label="Em andamento" value={orders.filter(o=>o.status==='Em serviço').length}/>
      <Stat icon={CheckCircle2} label="Prontos" value={ready.length}/>
      <Stat icon={CircleDollarSign} label="Faturamento entregue" value={money(revenue)}/>
    </section>
    <section className="panel">
      <div className="panel-title"><h2>Últimas ordens de serviço</h2></div>
      {orders.length === 0 ? <Empty text="Nenhuma OS cadastrada ainda."/> :
        <div className="table-wrap"><table><thead><tr><th>OS</th><th>Cliente</th><th>Veículo</th><th>Status</th><th>Total</th></tr></thead><tbody>
          {[...orders].reverse().slice(0,8).map(o=><tr key={o.id}><td>#{o.number}</td><td>{o.clientName}</td><td>{o.vehicleText}</td><td><Status value={o.status}/></td><td>{money(o.total)}</td></tr>)}
        </tbody></table></div>}
    </section>
  </>;
}

function Stat({ icon:Icon, label, value }) { return <div className="stat"><div className="stat-icon"><Icon/></div><div><span>{label}</span><strong>{value}</strong></div></div>; }
function Empty({text}) { return <div className="empty"><ClipboardList size={38}/><p>{text}</p></div>; }
function Status({value}) { return <span className={'status s-'+value.toLowerCase().replaceAll(' ','-').normalize('NFD').replace(/[\u0300-\u036f]/g,'')}>{value}</span>; }

function Clients({clients,setClients}) {
  const [form,setForm]=useState({name:'',phone:'',document:'',notes:''});
  const [q,setQ]=useState('');
  const add=e=>{e.preventDefault(); if(!form.name.trim()) return; setClients([...clients,{id:uid(),...form}]); setForm({name:'',phone:'',document:'',notes:''});};
  const filtered=clients.filter(c=>JSON.stringify(c).toLowerCase().includes(q.toLowerCase()));
  return <div className="grid-2"><section className="panel"><h2>Novo cliente</h2><form className="form-grid" onSubmit={add}>
    <label className="full">Nome<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label>
    <label>Telefone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
    <label>CPF/CNPJ<input value={form.document} onChange={e=>setForm({...form,document:e.target.value})}/></label>
    <label className="full">Observações<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
    <button className="primary full"><Plus size={18}/> Salvar cliente</button>
  </form></section><section className="panel"><div className="panel-title"><h2>Clientes</h2><SearchBox q={q} setQ={setQ}/></div>
  {filtered.length===0?<Empty text="Nenhum cliente encontrado."/>:<div className="list">{filtered.map(c=><div className="list-item" key={c.id}><div><strong>{c.name}</strong><span>{c.phone||'Sem telefone'} {c.document&&'• '+c.document}</span></div><button className="danger-icon" onClick={()=>setClients(clients.filter(x=>x.id!==c.id))}><Trash2 size={17}/></button></div>)}</div>}</section></div>;
}

function Vehicles({vehicles,setVehicles,clients}) {
  const [form,setForm]=useState({clientId:'',plate:'',brand:'',model:'',year:'',color:'',km:''});
  const [q,setQ]=useState('');
  const add=e=>{e.preventDefault(); if(!form.plate.trim()) return; const c=clients.find(x=>x.id===form.clientId); setVehicles([...vehicles,{id:uid(),...form,clientName:c?.name||''}]); setForm({clientId:'',plate:'',brand:'',model:'',year:'',color:'',km:''});};
  const filtered=vehicles.filter(v=>JSON.stringify(v).toLowerCase().includes(q.toLowerCase()));
  return <div className="grid-2"><section className="panel"><h2>Novo veículo</h2><form className="form-grid" onSubmit={add}>
    <label className="full">Cliente<select value={form.clientId} onChange={e=>setForm({...form,clientId:e.target.value})}><option value="">Selecione</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label>Placa<input value={form.plate} onChange={e=>setForm({...form,plate:e.target.value.toUpperCase()})} required/></label><label>Marca<input value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}/></label>
    <label>Modelo<input value={form.model} onChange={e=>setForm({...form,model:e.target.value})}/></label><label>Ano<input value={form.year} onChange={e=>setForm({...form,year:e.target.value})}/></label>
    <label>Cor<input value={form.color} onChange={e=>setForm({...form,color:e.target.value})}/></label><label>KM<input value={form.km} onChange={e=>setForm({...form,km:e.target.value})}/></label>
    <button className="primary full"><Plus size={18}/> Salvar veículo</button>
  </form></section><section className="panel"><div className="panel-title"><h2>Veículos</h2><SearchBox q={q} setQ={setQ}/></div>
  {filtered.length===0?<Empty text="Nenhum veículo encontrado."/>:<div className="list">{filtered.map(v=><div className="list-item" key={v.id}><div><strong>{v.plate} • {v.brand} {v.model}</strong><span>{v.clientName||'Sem cliente'} {v.km&&'• '+v.km+' km'}</span></div><button className="danger-icon" onClick={()=>setVehicles(vehicles.filter(x=>x.id!==v.id))}><Trash2 size={17}/></button></div>)}</div>}</section></div>;
}

function Entry({clients,setClients,vehicles,setVehicles,orders,setOrders,onDone}) {
  const [f,setF]=useState({clientName:'',phone:'',plate:'',brand:'',model:'',km:'',fuel:'1/2',complaint:'',damages:'',date:todayISO()});
  const submit=e=>{e.preventDefault();
    let c=clients.find(x=>x.name.toLowerCase()===f.clientName.toLowerCase());
    if(!c){ c={id:uid(),name:f.clientName,phone:f.phone,document:'',notes:''}; setClients([...clients,c]); }
    let v=vehicles.find(x=>x.plate.toLowerCase()===f.plate.toLowerCase());
    if(!v){ v={id:uid(),clientId:c.id,clientName:c.name,plate:f.plate.toUpperCase(),brand:f.brand,model:f.model,year:'',color:'',km:f.km}; setVehicles([...vehicles,v]); }
    const number=(Math.max(0,...orders.map(o=>Number(o.number)||0))+1).toString().padStart(4,'0');
    setOrders([...orders,{id:uid(),number,clientId:c.id,clientName:c.name,phone:f.phone,vehicleId:v.id,vehicleText:`${f.plate.toUpperCase()} • ${f.brand} ${f.model}`.trim(),plate:f.plate.toUpperCase(),km:f.km,fuel:f.fuel,complaint:f.complaint,damages:f.damages,entryDate:f.date,entryAt:nowBR(),status:'Aguardando',items:[],labor:[],total:0,exitAt:''}]);
    onDone();
  };
  return <section className="panel wide"><h2>Registrar entrada e abrir OS</h2><form className="form-grid three" onSubmit={submit}>
    <label>Cliente<input value={f.clientName} onChange={e=>setF({...f,clientName:e.target.value})} required/></label><label>Telefone<input value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/></label><label>Data<input type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></label>
    <label>Placa<input value={f.plate} onChange={e=>setF({...f,plate:e.target.value.toUpperCase()})} required/></label><label>Marca<input value={f.brand} onChange={e=>setF({...f,brand:e.target.value})}/></label><label>Modelo<input value={f.model} onChange={e=>setF({...f,model:e.target.value})}/></label>
    <label>Quilometragem<input value={f.km} onChange={e=>setF({...f,km:e.target.value})}/></label><label>Combustível<select value={f.fuel} onChange={e=>setF({...f,fuel:e.target.value})}><option>Reserva</option><option>1/4</option><option>1/2</option><option>3/4</option><option>Cheio</option></select></label>
    <label className="full">Reclamação / serviço solicitado<textarea value={f.complaint} onChange={e=>setF({...f,complaint:e.target.value})} required/></label>
    <label className="full">Avarias observadas na entrada<textarea value={f.damages} onChange={e=>setF({...f,damages:e.target.value})} placeholder="Riscos, amassados, luzes acesas no painel..."/></label>
    <button className="primary full"><ClipboardList size={18}/> Registrar entrada e abrir OS</button>
  </form></section>;
}

function Orders({orders,setOrders}) {
  const [q,setQ]=useState(''); const [selected,setSelected]=useState(null);
  const filtered=orders.filter(o=>JSON.stringify(o).toLowerCase().includes(q.toLowerCase()));
  const save = upd => setOrders(orders.map(o=>o.id===upd.id?upd:o));
  return <><section className="panel"><div className="panel-title"><h2>Ordens de Serviço</h2><SearchBox q={q} setQ={setQ}/></div>
    {filtered.length===0?<Empty text="Nenhuma OS encontrada."/>:<div className="table-wrap"><table><thead><tr><th>OS</th><th>Cliente</th><th>Veículo</th><th>Status</th><th>Total</th><th></th></tr></thead><tbody>
      {[...filtered].reverse().map(o=><tr key={o.id}><td>#{o.number}</td><td>{o.clientName}</td><td>{o.vehicleText}</td><td><Status value={o.status}/></td><td>{money(o.total)}</td><td><button className="small" onClick={()=>setSelected(o)}>Abrir</button></td></tr>)}
    </tbody></table></div>}</section>
    {selected && <OrderModal order={orders.find(o=>o.id===selected.id)||selected} onClose={()=>setSelected(null)} onSave={o=>{save(o);setSelected(o);}}/>}
  </>;
}

function OrderModal({order,onClose,onSave}) {
  const [o,setO]=useState(order);
  useEffect(()=>setO(order),[order]);
  const [part,setPart]=useState({desc:'',qty:1,price:''}); const [labor,setLabor]=useState({desc:'',price:''});
  const recalc = (x) => ({...x,total:[...x.items,...x.labor].reduce((s,i)=>s+Number(i.total||i.price||0),0)});
  const addPart=()=>{if(!part.desc) return; const item={id:uid(),...part,total:Number(part.qty||1)*Number(part.price||0)}; const n=recalc({...o,items:[...o.items,item]}); setO(n);onSave(n);setPart({desc:'',qty:1,price:''});};
  const addLabor=()=>{if(!labor.desc) return; const item={id:uid(),...labor,total:Number(labor.price||0)}; const n=recalc({...o,labor:[...o.labor,item]}); setO(n);onSave(n);setLabor({desc:'',price:''});};
  const remove=(type,id)=>{const n=recalc({...o,[type]:o[type].filter(i=>i.id!==id)});setO(n);onSave(n);};
  const setStatus=status=>{const n={...o,status}; setO(n);onSave(n);};
  const whatsapp=()=>{ const digits=(o.phone||'').replace(/\D/g,''); const text=encodeURIComponent(`Olá ${o.clientName}! A OS #${o.number} do veículo ${o.vehicleText} está com status: ${o.status}. Total: ${money(o.total)}. Vinicar Auto Center.`); window.open(`https://wa.me/55${digits}?text=${text}`,'_blank'); };
  return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><h2>OS #{o.number}</h2><p>{o.clientName} • {o.vehicleText}</p></div><button className="icon" onClick={onClose}><X/></button></div>
    <div className="order-meta"><span><Clock3 size={16}/> Entrada: {o.entryAt}</span><span>KM: {o.km||'-'}</span><span>Combustível: {o.fuel||'-'}</span></div>
    <div className="status-row">{statusList.map(s=><button key={s} className={o.status===s?'status-btn active':''} onClick={()=>setStatus(s)}>{s}</button>)}</div>
    <div className="note-box"><strong>Solicitação:</strong> {o.complaint||'—'}<br/><strong>Avarias:</strong> {o.damages||'—'}</div>
    <h3>Peças</h3><div className="inline-form"><input placeholder="Descrição" value={part.desc} onChange={e=>setPart({...part,desc:e.target.value})}/><input type="number" min="1" placeholder="Qtd" value={part.qty} onChange={e=>setPart({...part,qty:e.target.value})}/><input type="number" step="0.01" placeholder="Valor unit." value={part.price} onChange={e=>setPart({...part,price:e.target.value})}/><button className="primary" onClick={addPart}><Plus size={18}/></button></div>
    <Items items={o.items} onRemove={id=>remove('items',id)}/>
    <h3>Mão de obra</h3><div className="inline-form labor"><input placeholder="Descrição do serviço" value={labor.desc} onChange={e=>setLabor({...labor,desc:e.target.value})}/><input type="number" step="0.01" placeholder="Valor" value={labor.price} onChange={e=>setLabor({...labor,price:e.target.value})}/><button className="primary" onClick={addLabor}><Plus size={18}/></button></div>
    <Items items={o.labor} onRemove={id=>remove('labor',id)}/>
    <div className="order-total"><span>Total da OS</span><strong>{money(o.total)}</strong></div>
    <div className="modal-actions"><button onClick={()=>window.print()}><Printer size={18}/> Imprimir / PDF</button><button onClick={whatsapp}><MessageCircle size={18}/> WhatsApp</button><button className="primary" onClick={onClose}>Concluir</button></div>
  </div></div>;
}

function Items({items,onRemove}) { if(!items.length) return <p className="muted">Nenhum item adicionado.</p>; return <div className="mini-list">{items.map(i=><div key={i.id}><span>{i.desc}{i.qty?` • ${i.qty}x`:''}</span><strong>{money(i.total||i.price)}</strong><button onClick={()=>onRemove(i.id)}><Trash2 size={15}/></button></div>)}</div>; }

function Exit({orders,setOrders}) {
  const ready=orders.filter(o=>o.status==='Pronto');
  const deliver=id=>{setOrders(orders.map(o=>o.id===id?{...o,status:'Entregue',exitAt:nowBR()}:o));};
  const delivered=orders.filter(o=>o.status==='Entregue').slice().reverse();
  return <div className="grid-2"><section className="panel"><h2>Veículos prontos para entrega</h2>{ready.length===0?<Empty text="Nenhum veículo marcado como Pronto."/>:<div className="list">{ready.map(o=><div className="list-item" key={o.id}><div><strong>OS #{o.number} • {o.vehicleText}</strong><span>{o.clientName} • {money(o.total)}</span></div><button className="primary small" onClick={()=>deliver(o.id)}>Registrar saída</button></div>)}</div>}</section>
    <section className="panel"><h2>Últimas entregas</h2>{delivered.length===0?<Empty text="Nenhuma saída registrada."/>:<div className="list">{delivered.slice(0,10).map(o=><div className="list-item" key={o.id}><div><strong>OS #{o.number} • {o.plate}</strong><span>{o.clientName} • Saída: {o.exitAt}</span></div><CheckCircle2 size={20}/></div>)}</div>}</section></div>;
}

function SearchBox({q,setQ}) { return <div className="search"><Search size={16}/><input placeholder="Pesquisar..." value={q} onChange={e=>setQ(e.target.value)}/></div>; }

createRoot(document.getElementById('root')).render(<App/>);
