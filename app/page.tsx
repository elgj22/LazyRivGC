 "use client";
import {useState, useEffect } from "react";
import {Home, Trophy, Flag, Bell, Users, CalendarDays, WalletCards, Settings, Plus, ChevronRight, Menu, X} from "lucide-react";
import { supabase } from "@/lib/supabase";
const players=[
 {name:"Mike Johnson",hcp:8.4,team:"USA",score:79,pts:3},
 {name:"Chris Smith",hcp:12.2,team:"USA",score:82,pts:2},
 {name:"Dave Brown",hcp:15.6,team:"Europe",score:84,pts:1},
 {name:"John Miller",hcp:18.1,team:"Europe",score:88,pts:1},
];
const matches=[
 {id:1,a:"Mike Johnson / Chris Smith",b:"Dave Brown / John Miller",status:"USA 2 UP",live:true},
 {id:2,a:"Tom / Steve",b:"Rob / Mark",status:"AS",live:true},
 {id:3,a:"John / Mark",b:"Steve / Rob",status:"USA WINS 3 & 2",live:false},
];

export default function App(){
 const [tab,setTab]=useState("Dashboard"),[mobile,setMobile]=useState(false),[notice,setNotice]=useState("");
 const nav = [
  { name: "Dashboard", icon: Home },
  { name: "Players", icon: Users },
  { name: "Rounds", icon: Flag },
  { name: "Matches", icon: Trophy },
  { name: "Schedule", icon: CalendarDays },
  { name: "Settlements", icon: WalletCards },
  { name: "Notifications", icon: Bell },
  { name: "Settings", icon: Settings },
];
 const send=()=>{setNotice("Notification sent to all players.");setTimeout(()=>setNotice(""),2500)};
 return <div className="shell">
  <aside className={mobile?"side open":"side"}>
   <div className="brand"><div className="logo">⛳</div><div><b>Golf Trip</b><span>Scottsdale Cup 2026</span></div><button className="close" onClick={()=>setMobile(false)}><X size={20}/></button></div>
   <nav>
     {nav.map(({name, icon: I}) =>
    <button
      className={tab === name ? "nav active" : "nav"}
      onClick={() => {
        setTab(name);
        setMobile(false);
      }}
      key={name}
    >
      <I size={19}/>
      {name}
    </button>
  )}
</nav>
   <div className="sideBottom"><span>Admin Mode</span><strong>J Gino</strong></div>
  </aside>
  {mobile&&<div className="shade" onClick={()=>setMobile(false)}/>}
  <main>
   <header><button className="hamb" onClick={()=>setMobile(true)}><Menu/></button><div><h1>{tab}</h1><p>Scottsdale Cup 2026</p></div><div className="headerActions"><button className="icon"><Bell size={20}/></button><div className="avatar">JG</div></div></header>
   {notice&&<div className="toast">✓ {notice}</div>}
   {tab==="Dashboard"&&<Dashboard send={send}/>}
   {tab==="Players"&&<Players/>}
   {tab==="Rounds"&&<Rounds/>}
   {tab==="Matches"&&<Matches/>}
   {tab==="Schedule"&&<Schedule/>}
   {tab==="Settlements"&&<Settlements/>}
   {tab==="Notifications"&&<Notifications send={send}/>}
   {tab==="Settings"&&<SettingsPage/>}
  </main>
 </div>
}

function Dashboard({send}:{send:()=>void}){return <section>
 <div className="hero"><div><div className="eyebrow">LIVE COMPETITION</div><h2>USA leads Europe</h2><p>Keep the trip moving from one command center.</p></div><button className="primary" onClick={send}><Bell size={17}/> Send update</button></div>
 <div className="scoreboard"><div><span>🇺🇸 USA</span><b>8.5</b></div><div className="vs">VS</div><div><span>🇪🇺 Europe</span><b>7.5</b></div></div>
 <div className="grid4">{[["16","Players"],["3","Rounds"],["24","Matches"],["13","Complete"]].map(x=><div className="stat" key={x[1]}><b>{x[0]}</b><span>{x[1]}</span></div>)}</div>
 <div className="two">
  <Card title="Live matches"><div className="list">{matches.filter(m=>m.live).map(m=><div className="row" key={m.id}><div><b>{m.a}</b><span>vs {m.b}</span></div><strong className="live">{m.status}</strong></div>)}</div><button className="link">View all matches <ChevronRight size={15}/></button></Card>
  <Card title="Needs attention"><div className="attention"><p>⚠ 2 players missing handicaps</p><p>⚠ Round 2 has 1 incomplete pairing</p><p>✓ All active scores synced</p></div></Card>
 </div>
 </section>}
function Card(p:any){return <div className="card"><div className="cardHead"><h3>{p.title}</h3><ChevronRight size={17}/></div>{p.children}</div>}
function Players(){return <section><div className="sectionTop"><div><h2>Players</h2><p>Handicaps, teams and current trip performance.</p></div><button className="primary"><Plus size={17}/> Add player</button></div><div className="card tableWrap"><table><thead><tr><th>Player</th><th>Handicap</th><th>Team</th><th>Round score</th><th>Cup pts</th></tr></thead><tbody>{players.map(p=><tr key={p.name}><td><b>{p.name}</b></td><td>{p.hcp}</td><td><span className={"pill "+(p.team==="USA"?"usa":"eur")}>{p.team}</span></td><td>{p.score}</td><td>{p.pts.toFixed(1)}</td></tr>)}</tbody></table></div></section>}
function Rounds(){return <section><div className="sectionTop"><div><h2>Rounds</h2><p>Manage courses, tees, formats and scoring.</p></div><button className="primary"><Plus size={17}/> Create round</button></div><div className="cards">{["Round 1 — Four-Ball","Round 2 — Foursomes","Round 3 — Singles"].map((r,i)=><Card title={r} key={r}><div className="round"><b>{["Troon North","Grayhawk","Troon North"][i]}</b><span>{["Complete","Active","Scheduled"][i]} · {i===1?"10:30 AM":"10:30 AM"}</span><button className="link">Manage round <ChevronRight size={15}/></button></div></Card>)}</div></section>}
function Matches(){return <section><div className="sectionTop"><div><h2>Matches</h2><p>Manual pairings, live scoring and results.</p></div><button className="primary"><Plus size={17}/> Create match</button></div><div className="cards">{matches.map(m=><Card title={"Match "+m.id} key={m.id}><div className="match"><div><b>🇺🇸 {m.a}</b><span>vs</span><b>🇪🇺 {m.b}</b></div><strong className={m.live?"live":""}>{m.status}</strong></div></Card>)}</div></section>}
function Schedule(){return <section><div className="sectionTop"><div><h2>Schedule</h2><p>The master timeline for the trip.</p></div><button className="primary"><Plus size={17}/> Add event</button></div><div className="timeline">{["8:00 AM — Breakfast","10:30 AM — Round 2 · Troon North","4:30 PM — Pool / Free Time","7:00 PM — Dinner"].map((x,i)=><div className="event" key={x}><span>{x.split(" — ")[0]}</span><b>{x.split(" — ")[1]}</b><small>{i===1?"16 players · 8 matches": "Scottsdale Cup 2026"}</small></div>)}</div></section>}
function Settlements(){return <section><div className="sectionTop"><div><h2>Settlement overview</h2><p>General balance by player.</p></div><button className="primary"><Plus size={17}/> Add expense</button></div><div className="card tableWrap"><table><thead><tr><th>Player</th><th>Competition</th><th>Expenses</th><th>Net</th></tr></thead><tbody>{[["Mike Johnson","+ $100","- $25","+ $125"],["Chris Smith","+ $50","- $90","- $40"],["Dave Brown","+ $100","- $25","+ $75"],["John Miller","$0","- $160","- $160"]].map(r=><tr key={r[0]}>{r.map((v,i)=><td key={i} className={i===3?(v[0]==="+"?"positive":"negative"):""}>{i===0?<b>{v}</b>:v}</td>)}</tr>)}</tbody></table></div></section>}
function Notifications({send}:{send:()=>void}){return <section><div className="sectionTop"><div><h2>Notifications</h2><p>Send targeted or trip-wide announcements.</p></div><button className="primary" onClick={send}><Bell size={17}/> Send notification</button></div><div className="card compose"><label>Audience<select><option>Everyone</option><option>USA</option><option>Europe</option><option>Round participants</option><option>Specific players</option></select></label><label>Title<input defaultValue="Round 2 Pairings Posted"/></label><label>Message<textarea defaultValue="Your Round 2 pairings are now available. Please arrive 20 minutes early."/></label><button className="primary" onClick={send}>Send notification</button></div></section>}
function SettingsPage(){return <section><div className="sectionTop"><div><h2>Trip settings</h2><p>Competition rules and event configuration.</p></div></div><div className="card settings"><label>Trip name<input defaultValue="Scottsdale Cup 2026"/></label><label>Competition format<select><option>Ryder Cup</option><option>Custom</option></select></label><label>Win points<input defaultValue="1.0"/></label><label>Halve points<input defaultValue="0.5"/></label><label>Handicap allowance<input defaultValue="90%"/></label><button className="primary">Save settings</button></div></section>}
