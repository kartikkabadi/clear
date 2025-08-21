"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function uid() {
  // persistent anonymous user id (no login)
  if (typeof window === "undefined") return "web";
  let id = localStorage.getItem("clear_uid");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("clear_uid", id);
  }
  return id;
}

function todayISO() {
  const d = new Date();
  d.setHours(0,0,0,0);
  return d.toISOString().slice(0,10);
}

export default function Page() {
  const userId = useMemo(() => uid(), []);
  const [date, setDate] = useState(todayISO());
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(supabase ? "cloud" : "local"); // local if no env set

  // local storage key
  const lsKey = `clear_tasks_${date}`;

  useEffect(() => {
    if (mode === "local") {
      const raw = localStorage.getItem(lsKey);
      setTasks(raw ? JSON.parse(raw) : []);
      return;
    }
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("clear_tasks")
        .select("tasks")
        .eq("user_id", userId)
        .eq("date", date)
        .maybeSingle();
      if (error) console.warn(error);
      setTasks(data?.tasks ?? []);
      setLoading(false);
    })();
  }, [date, lsKey, mode, userId]);

  const save = async (next) => {
    setTasks(next);
    if (mode === "local") {
      localStorage.setItem(lsKey, JSON.stringify(next));
      return;
    }
    const payload = { user_id: userId, date, tasks: next };
    const { error } = await supabase
      .from("clear_tasks")
      .upsert(payload, { onConflict: "user_id,date" });
    if (error) alert("Save failed: " + error.message);
  };

  const addTask = () => {
    const t = text.trim();
    if (!t) return;
    const next = [...tasks, { id: crypto.randomUUID(), text: t, done: false }];
    setText("");
    save(next);
  };

  const toggleTask = (id) => {
    const next = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    save(next);
  };

  const delTask = (id) => {
    const next = tasks.filter(t => t.id !== id);
    save(next);
  };

  const done = tasks.filter(t => t.done);
  const todo = tasks.filter(t => !t.done);

  return (
    <main>
      <div style={{
        display:"grid", gap:16,
        gridTemplateColumns:"1fr"
      }}>
        <section style={{ padding:16, background:"#111116", borderRadius:16, boxShadow:"0 0 0 1px #1f1f24 inset" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
            <h2 style={{ margin:0, fontSize:18 }}>Your Tasks</h2>
            <select value={mode} onChange={e=>setMode(e.target.value)} style={{ background:"#1a1a22", color:"#fff", border:"1px solid #2b2b33", borderRadius:8, padding:"6px 8px" }}>
              <option value="local">Free (Local only)</option>
              <option value="cloud">Pro (Cloud sync)</option>
            </select>
          </div>

          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                   style={{ background:"#0f0f14", color:"#fff", border:"1px solid #2b2b33", borderRadius:8, padding:"6px 8px" }}/>
            <input placeholder="Add a task…" value={text} onChange={e=>setText(e.target.value)}
                   onKeyDown={e=>e.key==="Enter" && addTask()}
                   style={{ flex:1, background:"#0f0f14", color:"#fff", border:"1px solid #2b2b33", borderRadius:8, padding:"6px 10px" }}/>
            <button onClick={addTask} style={{ background:"#7c3aed", color:"#fff", border:"none", borderRadius:10, padding:"8px 12px", cursor:"pointer" }}>
              Add
            </button>
          </div>

          {loading ? <p style={{ opacity:0.8 }}>Loading…</p> : null}

          <div style={{ display:"grid", gap:8, marginTop:12 }}>
            {todo.map(t=>(
              <div key={t.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#0f0f14", border:"1px solid #2b2b33", borderRadius:10, padding:"8px 10px" }}>
                <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                  <input type="checkbox" checked={t.done} onChange={()=>toggleTask(t.id)} />
                  <span>{t.text}</span>
                </label>
                <button onClick={()=>delTask(t.id)} style={{ background:"transparent", color:"#ff9aa2", border:"1px solid #573c3f", borderRadius:8, padding:"4px 8px", cursor:"pointer" }}>
                  Delete
                </button>
              </div>
            ))}
            {done.length>0 && (
              <details style={{ marginTop:8 }}>
                <summary>Completed ({done.length})</summary>
                <div style={{ display:"grid", gap:8, marginTop:8 }}>
                  {done.map(t=>(
                    <div key={t.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#0f0f14", border:"1px solid #2b2b33", borderRadius:10, padding:"8px 10px", opacity:0.7 }}>
                      <label style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <input type="checkbox" checked={t.done} onChange={()=>toggleTask(t.id)} />
                        <span style={{ textDecoration:"line-through" }}>{t.text}</span>
                      </label>
                      <button onClick={()=>delTask(t.id)} style={{ background:"transparent", color:"#ff9aa2", border:"1px solid #573c3f", borderRadius:8, padding:"4px 8px", cursor:"pointer" }}>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </section>

        <section style={{ padding:16, background:"#111116", borderRadius:16, boxShadow:"0 0 0 1px #1f1f24 inset" }}>
          <h2 style={{ marginTop:0, fontSize:18 }}>Pricing</h2>
          <div style={{ display:"grid", gap:12 }}>
            <div style={{ border:"1px solid #2b2b33", borderRadius:12, padding:12 }}>
              <h3 style={{ margin:"0 0 6px" }}>Free</h3>
              <ul style={{ margin:"0 0 8px 18px" }}>
                <li>Local-only storage on your device</li>
                <li>Unlimited tasks</li>
              </ul>
              <strong>₹0/month</strong>
            </div>
            <div style={{ border:"1px solid #2b2b33", borderRadius:12, padding:12 }}>
              <h3 style={{ margin:"0 0 6px" }}>Pro</h3>
              <ul style={{ margin:"0 0 8px 18px" }}>
                <li>Cloud sync (Supabase)</li>
                <li>Access your tasks anywhere</li>
              </ul>
              <strong>₹499/month</strong>
              <p style={{ opacity:0.8, marginTop:8, fontSize:13 }}>
                (For now, toggle “Pro (Cloud sync)” above and set Supabase keys in Vercel. Payments can be added later.)
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
