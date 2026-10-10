import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUpRight, Command, CornerDownLeft, Disc3, Globe2, Radio, Send, Sparkles, Volume2 } from 'lucide-react'

const intro = {
  1990: 'MERHABA, YOLCU.\n\nBen Zaman Makinesi’nin sohbet operatörüyüm. Takvimler 1990’ı gösteriyor; modemler ötüyor, kasetler dönüyor ve gelecek hâlâ güzel bir sır.\n\nNeyi merak ediyorsun?',
  2030: 'Yeniden bağlandım. ✦\n\nYıl 2030 ve arayüzüm zamanın ritmine ayak uyduruyor. Bilgi daha akışkan, fikirler daha cesur.\n\nAklındaki her şeyi sor — geleceğin frekansındayım.',
}
const starters = { 1990: ['Gelecek nasıl olacak?', 'Bana bir şaka yap', '1990’da müzik'], 2030: ['Gelecek için fikir ver', 'Yeni bir şey keşfet', 'Bana ilham ver'] }

function Typewriter({ text, retro }) {
  const [shown, setShown] = useState(retro ? '' : text)
  useEffect(() => {
    if (!retro) { setShown(text); return }
    setShown('')
    let i = 0
    const timer = setInterval(() => { i += 2; setShown(text.slice(0, i)); if (i >= text.length) clearInterval(timer) }, 13)
    return () => clearInterval(timer)
  }, [text, retro])
  return <>{shown}{retro && shown.length < text.length && <span className="caret">█</span>}</>
}

export default function App() {
  const [year, setYear] = useState(1990)
  const [messages, setMessages] = useState([{ role: 'assistant', content: intro[1990], id: 1 }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState(new Date())
  const bottom = useRef(null)
  const inputRef = useRef(null)
  const retro = year === 1990

  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer) }, [])
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy])

  function switchTime() {
    const next = retro ? 2030 : 1990
    setYear(next)
    setMessages([{ role: 'assistant', content: intro[next], id: Date.now() }])
    setInput('')
  }

  async function send(value = input) {
    const prompt = value.trim()
    if (!prompt || busy) return
    const history = messages.filter(m => m.role !== 'error').map(({ role, content }) => ({ role, content }))
    setMessages(previous => [...previous, { role: 'user', content: prompt, id: Date.now() }])
    setInput('')
    setBusy(true)
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: prompt, mode: year, history }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Bağlantı kesildi. Yeniden dene.')
      setMessages(previous => [...previous, { role: 'assistant', content: data.reply, id: Date.now() + 1 }])
    } catch (error) {
      setMessages(previous => [...previous, { role: 'error', content: error.message || 'Sunucuya ulaşılamıyor. FastAPI sunucusunu kontrol et.', id: Date.now() + 2 }])
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  return <main className={'app ' + (retro ? 'era-1990' : 'era-2030')}>
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Zaman Makinesi ana sayfa"><span className="brand-mark"><Disc3 size={19} /></span><span className="brand-copy"><b>ZAMAN MAKİNESİ</b><small>SOHBET HATTI · NO. 001</small></span></a>
      <div className="topbar-right"><span className="connection"><i /> TÜM SİSTEMLER AKTİF</span><button className="about-button" onClick={() => inputRef.current?.focus()}>İLETİŞİME GEÇ <ArrowUpRight size={14} /></button></div>
    </header>
    <section className="scene" id="top">
      <div className="scene-head"><div className="scene-label"><span className="eyebrow">GELEN SİNYAL</span><span className="line" /></div><div className="coordinate">{retro ? '40° 11′ 00″ N' : '40.1833° N, 29.0610° E'} <span>·</span> {retro ? 'KANAL 09' : 'NODE 30.10'}</div></div>
      <div className="year-wrap"><div className="year-art" aria-hidden="true">{retro ? '90' : '30'}<span className="year-dot">{retro ? '.' : '✳'}</span></div><div className="year-caption"><span className="eyebrow">ŞU ANDA ŞURADASIN</span><div className="year-main">{year}<span className="year-dash">/</span><span className="year-word">{retro ? 'DÜNYA' : 'DÜNYA+'}</span></div></div><div className="year-note">{retro ? <>GELECEĞE BİR<br />BAĞLANTI AÇ.</> : <>GELECEĞİN<br />FREKANSINDA.</>}</div></div>
      <div className="switch-row"><div className="switch-note"><ArrowDown size={15} /><span>{retro ? 'ZAMANIN İLERİSİNE GİT' : 'KENDİ ZAMANINA DÖN'}</span></div><button className="time-switch" onClick={switchTime} aria-label={retro ? '2030 yılına geç' : '1990 yılına dön'}><span className="switch-icons"><ArrowLeft size={15} /><span className="switch-track"><i /></span><ArrowUpRight size={15} /></span><span className="switch-label">{retro ? '2030’A ZIPLA' : '1990’A GERİ DÖN'}</span></button></div>
    </section>
    <section className="chat-panel" aria-label={year + ' sohbet alanı'}>
      <div className="chat-top"><div className="chat-identity"><div className="avatar">{retro ? <Radio size={18} /> : <Sparkles size={19} />}</div><div><div className="chat-name">{retro ? 'OPERATÖR_01' : 'SİNYAL // 30'}</div><div className="chat-status"><i /> {retro ? 'HATTA · SESİNİ DUYUYORUM' : 'ÇEVRİM İÇİ · AKIŞTA'}</div></div></div><div className="chat-meta"><span>{retro ? '28.8 KBPS' : '0.04 MS LATENCY'}</span><span className="meta-divider" /><Volume2 size={16} /></div></div>
      <div className="message-list"><div className="date-marker"><span>{retro ? 'SİNYAL ALINDI · 14 MAYIS 1990' : 'YENİ OTURUM · 14 MAYIS 2030'}</span></div>
        {messages.map((message, index) => <article className={'message message-' + message.role} key={message.id}>{message.role !== 'user' && <span className="message-avatar">{message.role === 'error' ? '!' : retro ? 'Z>' : '✳'}</span>}<div className="message-body"><div className="message-heading">{message.role === 'user' ? 'SEN' : message.role === 'error' ? 'SİNYAL KESİLDİ' : retro ? 'OPERATÖR_01' : 'SİNYAL // 30'}<span>·</span>{message.role === 'assistant' && index === 0 ? (retro ? '00:00' : 'ŞİMDİ') : now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div><div className="message-content">{message.role === 'assistant' && index === 0 ? <Typewriter text={message.content} retro={retro} /> : message.content}</div></div></article>)}
        {busy && <article className="message message-assistant"><span className="message-avatar">{retro ? 'Z>' : '✳'}</span><div className="message-body"><div className="message-heading">{retro ? 'OPERATÖR_01' : 'SİNYAL // 30'}<span>·</span>{retro ? 'HATTA' : 'DÜŞÜNÜYOR'}</div><div className="typing"><i /><i /><i /><span>{retro ? 'BİR SANİYE, DALGA GELİYOR' : 'FREKANSLAR EŞLEŞTİRİLİYOR'}</span></div></div></article>}
        <div ref={bottom} />
      </div>
      <div className="suggestions">{starters[year].map((text, index) => <button key={text} onClick={() => send(text)} disabled={busy}><span>0{index + 1}</span>{text}<ArrowUpRight size={13} /></button>)}</div>
      <form className="composer" onSubmit={event => { event.preventDefault(); send() }}><span className="composer-symbol">{retro ? '>' : '✳'}</span><input ref={inputRef} className="chat-input" value={input} onChange={event => setInput(event.target.value)} placeholder={retro ? 'MESAJINI YAZ...' : 'Aklından ne geçiyor?'} maxLength={2000} disabled={busy} aria-label="Mesajını yaz" /><span className="input-hint"><Command size={12} /> ENTER</span><button className="send-button" type="submit" disabled={busy || !input.trim()} aria-label="Mesajı gönder">{retro ? <CornerDownLeft size={17} /> : <Send size={16} />}</button></form>
      <div className="chat-foot"><span>{retro ? 'HAT KAYDEDİLMİYOR · BAĞLANTI GÜVENLİ' : 'UÇTAN UCA · ZAMAN DIŞI · GÜVENLİ'}</span><span>{input.length}/2000</span></div>
    </section>
    <footer className="footer"><span>© 1990—2030 · TÜM ZAMANLAR SAKLIDIR</span><span className="footer-center"><Globe2 size={13} /> DÜNYA, TAM BURADA</span><span>{now.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }).toUpperCase()} <span className="footer-slash">/</span> {now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span></footer><div className="noise" aria-hidden="true" />
  </main>
}
