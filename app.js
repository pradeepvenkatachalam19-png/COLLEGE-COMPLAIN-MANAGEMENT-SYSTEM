const $=(s)=>document.querySelector(s),get=(k,d)=>JSON.parse(localStorage.getItem(k)||JSON.stringify(d)),set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const toast=(m,ok=true)=>{const t=document.createElement('div');t.className='toast'+(ok?'':' err');t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),2500)};
const badge=s=>`<span class="b ${s.replace(' ','')}">${s}</span>`;
if(!get('users',[]).length)set('users',[{name:'Admin',email:'admin@ksrce.ac.in',reg:'ADMIN',pass:'admin123',role:'admin'}]);
const me=get('me',null),page=document.body.dataset.page,go=u=>location.href=u;
const auth=['login','register'].includes(page);
if(!auth&&page!=='home'){if(!me)go('login.html');else if(page==='admin'&&me.role!=='admin')go('dashboard.html')}
if(auth&&me)go(me.role==='admin'?'admin.html':'dashboard.html');
if($('#uname')&&me){$('#uname').textContent=me.name;$('#av').textContent=me.name[0].toUpperCase()}
if($('#logout'))$('#logout').onclick=e=>{e.preventDefault();localStorage.removeItem('me');go('login.html')};
const all=()=>get('complaints',[]),mine=()=>all().filter(c=>c.uid===me.email);
const row=c=>`<tr><td>${c.id}</td><td>${esc(c.cat)}</td><td>${esc(c.desc.slice(0,40))}</td><td>${c.date}</td><td>${badge(c.status)}</td><td><a href="track.html?id=${c.id}">Track</a></td></tr>`;
const head='<table><tr><th>ID</th><th>Category</th><th>Details</th><th>Date</th><th>Status</th><th></th></tr>';
const stats=l=>['Total:'+l.length,...['Pending','In Progress','Resolved'].map(s=>s+':'+l.filter(c=>c.status===s).length)].map(x=>`<div class="stat"><b>${x.split(':')[1]}</b>${x.split(':')[0]}</div>`).join('');

if(page==='register')$('#f').onsubmit=e=>{e.preventDefault();const v=n=>$('#'+n).value.trim(),u=get('users',[]);
 if(v('pass')!==v('pass2'))return toast('Passwords do not match',0);
 if(u.some(x=>x.email===v('email')||x.reg===v('reg')))return toast('Email / Register number already exists',0);
 u.push({name:v('name'),email:v('email'),reg:v('reg'),pass:v('pass'),role:'student'});set('users',u);toast('Registered! Please login');setTimeout(()=>go('login.html'),1000)};

if(page==='login'){let role='student';
 document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{role=b.dataset.r;document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x===b))});
 $('#eye').onclick=()=>{const p=$('#pass');p.type=p.type==='password'?'text':'password'};
 $('#fp').onclick=e=>{e.preventDefault();toast('Contact admin to reset your password')};
 $('#f').onsubmit=e=>{e.preventDefault();const id=$('#id').value.trim(),p=$('#pass').value;
  const u=get('users',[]).find(x=>x.role===role&&(x.email===id||x.reg===id)&&x.pass===p);
  if(!u)return toast('Invalid credentials',0);set('me',u);go(role==='admin'?'admin.html':'dashboard.html')}}

if(page==='dashboard'){$('#stats').innerHTML=stats(mine());const l=mine().slice(-5).reverse();$('#recent').innerHTML=l.length?head+l.map(row).join('')+'</table>':'<p>No complaints yet.</p>'}

if(page==='submit'){$('#file').onchange=e=>$('#fn').textContent=e.target.files[0]?e.target.files[0].name:'Upload Evidence (Picture / Document)';
 $('#f').onsubmit=e=>{e.preventDefault();const d=new Date(),c=get('complaints',[]),id='CMP'+String(Date.now()).slice(-6);
  c.push({id,uid:me.email,name:me.name,cat:$('#cat').value,dept:$('#dept').value,desc:$('#desc').value.trim(),file:$('#file').files[0]?.name||'',status:'Pending',date:d.toLocaleDateString(),history:[{s:'Pending',d:d.toLocaleString()}]});
  set('complaints',c);toast('Submitted! ID: '+id);setTimeout(()=>go('track.html?id='+id),1200)}}

if(page==='track'){const show=id=>{const c=all().find(x=>x.id===id.trim().toUpperCase());
  $('#res').innerHTML=c?`<h3>${c.id} ${badge(c.status)}</h3><p><b>${esc(c.cat)}</b> · ${esc(c.dept)} · ${c.date}</p><p>${esc(c.desc)}</p>${c.file?'<p>📎 '+esc(c.file)+'</p>':''}<div class="tl">${c.history.map(h=>`<div><b>${h.s}</b><br><small>${h.d}</small></div>`).join('')}</div>`:'<p>No complaint found with that ID.</p>'};
 $('#f').onsubmit=e=>{e.preventDefault();show($('#cid').value)};const q=new URLSearchParams(location.search).get('id');if(q){$('#cid').value=q;show(q)}}

if(page==='my'){const l=mine().reverse();$('#list').innerHTML=l.length?head+l.map(row).join('')+'</table>':'<p>You have not submitted any complaints.</p>'}

if(page==='feedback')$('#f').onsubmit=e=>{e.preventDefault();const f=get('feedbacks',[]);f.push({name:me.name,rate:$('#rate').value,text:$('#text').value.trim(),date:new Date().toLocaleDateString()});set('feedbacks',f);e.target.reset();toast('Thanks for your feedback!')};

if(page==='admin'){const draw=()=>{const fl=$('#flt').value,l=all().filter(c=>!fl||c.status===fl).reverse();$('#stats').innerHTML=stats(all());
  $('#list').innerHTML=l.length?`<table><tr><th>ID</th><th>Student</th><th>Category</th><th>Dept</th><th>Details</th><th>Status</th></tr>`+l.map(c=>`<tr><td>${c.id}</td><td>${esc(c.name)}</td><td>${esc(c.cat)}</td><td>${esc(c.dept)}</td><td>${esc(c.desc.slice(0,40))}</td><td><select data-id="${c.id}">${['Pending','In Progress','Resolved','Rejected'].map(s=>`<option${s===c.status?' selected':''}>${s}</option>`).join('')}</select></td></tr>`).join('')+'</table>':'<p>No complaints.</p>';
  document.querySelectorAll('#list select').forEach(s=>s.onchange=()=>{const a=all(),c=a.find(x=>x.id===s.dataset.id);c.status=s.value;c.history.push({s:s.value,d:new Date().toLocaleString()});set('complaints',a);toast('Status updated');draw()});
  const f=get('feedbacks',[]);$('#fb').innerHTML=f.length?f.reverse().map(x=>`<p>⭐${x.rate} <b>${esc(x.name)}</b> (${x.date}): ${esc(x.text)}</p>`).join(''):'<p>No feedback yet.</p>'};
 $('#flt').onchange=draw;draw()}
