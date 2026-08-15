import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {io, Socket} from "socket.io-client";
import {AnimatePresence, motion} from "framer-motion";
import "./styles.css";

type Player={id:string;name:string;alive:boolean;host?:boolean};
type View={roomCode:string;phase:string;players:Player[];me:{id:string;name:string;role?:string;alive:boolean;host?:boolean};message:string;winner?:string;timer:number};

const socket:Socket=io(import.meta.env.VITE_SERVER_URL||"http://localhost:3001",{autoConnect:false});

function speak(text:string){if("speechSynthesis" in window){speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text);u.rate=.9;u.pitch=.72;speechSynthesis.speak(u)}}
function App(){
 const [screen,setScreen]=useState<"home"|"lobby"|"game">("home");
 const [name,setName]=useState(""); const [code,setCode]=useState(""); const [room,setRoom]=useState<View|null>(null); const [reveal,setReveal]=useState(false);
 useEffect(()=>{socket.connect(); socket.on("room:update",(v:View)=>setRoom(v)); socket.on("narrate",(m:string)=>speak(m)); socket.on("game:reveal",()=>setReveal(true)); return()=>{socket.off("room:update");socket.off("narrate");socket.off("game:reveal")}},[]);
 const create=()=>{if(!name.trim())return;socket.emit("room:create",{name:name.trim()},(r:any)=>{setCode(r.code);setScreen("lobby")})};
 const join=()=>{if(!name.trim()||!code.trim())return;socket.emit("room:join",{name:name.trim(),code:code.trim().toUpperCase()},(r:any)=>{if(r?.error){alert(r.error);return}setScreen("lobby")})};
 useEffect(()=>{if(room?.phase&&room.phase!=="lobby")setScreen("game")},[room?.phase]);
 if(screen==="home")return <main className="shell"><div className="grain"/><section className="hero"><p className="eyebrow">A SOCIAL DEDUCTION GAME</p><h1>NOCTURNE</h1><p className="tag">THE NIGHT HAS A MEMORY.</p><div className="panel homepanel"><label>Your name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name"/><button onClick={create}>CREATE A ROOM</button><div className="or">OR</div><div className="joinrow"><input value={code} onChange={e=>setCode(e.target.value)} placeholder="ROOM CODE"/><button className="ghost" onClick={join}>JOIN</button></div></div><p className="tiny">2–12 players · real-time · no account required</p></section></main>;
 if(!room)return null;
 return <main className="shell"><div className="grain"/><header className="top"><span>NOCTURNE</span><span className="roomcode">ROOM <b>{room.roomCode}</b></span></header>
 <AnimatePresence mode="wait">{screen==="lobby"?<motion.section key="lobby" className="stage" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}><p className="eyebrow">THE CIRCLE GATHERS</p><h2>ROOM {room.roomCode}</h2><p className="muted">Share the code. The night begins when everyone is ready.</p><div className="players">{room.players.map(p=><div className="player" key={p.id}><span className="dot"/><span>{p.name}</span>{p.host&&<small>HOST</small>}</div>)}</div>{room.me.host&&<button onClick={()=>socket.emit("game:start")}>DEAL THE CARDS</button>}<p className="tiny">{room.players.length}/12 players · minimum 2</p></motion.section>:
 <motion.section key="game" className="stage game" initial={{opacity:0}} animate={{opacity:1}}><p className="eyebrow">{room.phase.toUpperCase()}</p><h2>{room.message}</h2><div className="divider"/>{reveal&&room.me.role&&<motion.div className="rolecard" initial={{rotateY:180,scale:.8}} animate={{rotateY:0,scale:1}}><span className="cardmark">♠</span><small>YOUR ROLE</small><strong>{room.me.role}</strong><em>{roleLine(room.me.role)}</em><button className="ghost" onClick={()=>setReveal(false)}>HIDE ROLE</button></motion.div>}{!reveal&&<button onClick={()=>setReveal(true)}>REVEAL MY ROLE</button>}<div className="players compact">{room.players.map(p=><div className={"player "+(!p.alive?"dead":"")} key={p.id}><span className="dot"/><span>{p.name}</span>{!p.alive&&<small>DEAD</small>}</div>)}</div></motion.section>}</AnimatePresence></main>
}
function roleLine(r:string){return r==="MAFIA"?"You belong to the shadows.":"Find the truth before the town falls."}
createRoot(document.getElementById("root")!).render(<App/>);