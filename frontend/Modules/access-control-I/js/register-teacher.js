;(function(){
    let API_BASE = window.API_BASE || 'http://localhost:3000';

    async function resolveApiBase(){
        const origin = window.location && window.location.origin ? window.location.origin : null;
        if(!origin || origin === 'null' || window.location.protocol === 'file:') return API_BASE;
        try{
            const controller = new AbortController();
            const timeout = setTimeout(()=>controller.abort(), 1000);
            const res = await fetch(`${origin}/api`, { method: 'GET', signal: controller.signal });
            clearTimeout(timeout);
            if(res.ok) return origin;
        }catch(e){}
        return API_BASE;
    }

    async function fetchSelectData(){
        const base = await resolveApiBase();
        const subjectsSel = document.getElementById('subjectSelect');
        const sectionsSel = document.getElementById('sectionSelect');
        const subjectsList = document.getElementById('availableSubjects');
        const sectionsList = document.getElementById('availableSections');
        subjectsSel.innerHTML = '<option> Cargando... </option>';
        sectionsSel.innerHTML = '<option> Cargando... </option>';
        try{
            const [sRes, secRes] = await Promise.all([
                fetch(`${base}/api/subjects/all`),
                fetch(`${base}/api/sections/all`)
            ]);
            const subjects = sRes.ok ? await sRes.json() : [];
            const sections = secRes.ok ? await secRes.json() : [];
            subjectsSel.innerHTML = '';
            (subjects || []).forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.subject_id;
                opt.textContent = `${s.subject_name}`;
                subjectsSel.appendChild(opt);
            });
            sectionsSel.innerHTML = '';
            (sections || []).forEach(sec => {
                const opt = document.createElement('option');
                opt.value = sec.section_id;
                opt.textContent = `${sec.section_name} — ${sec.grade_name || ''}`;
                sectionsSel.appendChild(opt);
            });
            // Render available lists (click to select)
            if(subjectsList){
                subjectsList.innerHTML = '';
                (subjects || []).forEach(s => {
                    const item = document.createElement('div');
                    item.className = 'p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer';
                    item.textContent = s.subject_name || `#${s.subject_id}`;
                    item.addEventListener('click', ()=>{ subjectsSel.value = s.subject_id; subjectsSel.dispatchEvent(new Event('change')); });
                    subjectsList.appendChild(item);
                });
            }
            if(sectionsList){
                sectionsList.innerHTML = '';
                (sections || []).forEach(sec => {
                    const item = document.createElement('div');
                    item.className = 'p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer text-sm';
                    item.textContent = `${sec.section_name} — ${sec.grade_name || ''}`;
                    item.addEventListener('click', ()=>{ sectionsSel.value = sec.section_id; sectionsSel.dispatchEvent(new Event('change')); });
                    sectionsList.appendChild(item);
                });
            }
        }catch(err){
            subjectsSel.innerHTML = '<option>Error</option>';
            sectionsSel.innerHTML = '<option>Error</option>';
            console.error(err);
        }
    }

    async function fetchTeacher(userId){
        if(!userId) return null;
        const base = await resolveApiBase();
        try{
            const res = await fetch(`${base}/api/auth/user/${userId}`);
            if(!res.ok) return null;
            const data = await res.json();
            return data.user ? data.user[0] : null;
        }catch(e){ return null; }
    }

    async function submitHandler(e){
        e.preventDefault();
        const teacherId = Number(document.getElementById('teacherId').value);
        const subjectId = Number(document.getElementById('subjectSelect').value);
        const sectionId = Number(document.getElementById('sectionSelect').value);
        const msg = document.getElementById('message');
        msg.textContent = '';
        if(!teacherId || !subjectId || !sectionId){ msg.textContent = 'Complete todos los campos.'; return; }
        const base = await resolveApiBase();
        try{
            const res = await fetch(`${base}/api/auth/teacher-assignments`, {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ teacher_user_id: teacherId, subject_id: subjectId, section_id: sectionId })
            });
            const data = await res.json();
            if(!res.ok){ msg.textContent = data.error || 'Error al crear asignación'; return; }
            msg.textContent = data.message || 'Asignación creada';
        }catch(err){ msg.textContent = 'Error de conexión'; console.error(err); }
    }

    document.addEventListener('DOMContentLoaded', function(){
        fetchSelectData();
        // If the page was opened with ?userId=..., prefill and fetch teacher info
        try{
            const params = new URLSearchParams(window.location.search);
            const qId = Number(params.get('userId'));
            if(qId){
                const idInput = document.getElementById('teacherId');
                const info = document.getElementById('teacherInfo');
                idInput.value = qId;
                info.textContent = 'Buscando...';
                fetchTeacher(qId).then(t => {
                    if(!t) return info.textContent = 'Profesor no encontrado';
                    info.textContent = `${t.first_name || ''} ${t.last_name || ''} — ${t.email || ''}`;
                }).catch(()=>{ info.textContent = 'Profesor no encontrado'; });
            }
        }catch(e){}
        document.getElementById('assignForm').addEventListener('submit', submitHandler);
        document.getElementById('btnFetchTeacher').addEventListener('click', async ()=>{
            const id = Number(document.getElementById('teacherId').value);
            const info = document.getElementById('teacherInfo');
            info.textContent = 'Buscando...';
            const t = await fetchTeacher(id);
            if(!t){ info.textContent = 'Profesor no encontrado'; return; }
            info.textContent = `${t.first_name || ''} ${t.last_name || ''} — ${t.email || ''}`;
        });
        document.getElementById('btnCancel').addEventListener('click', ()=>{ window.history.back(); });
    });

})();
