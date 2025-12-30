// ==========================================
// LÓGICA PRINCIPAL CON PAGINACIÓN Y FILTROS
// ==========================================

const viewContainer = document.getElementById('view-container');

// --- VARIABLES DE PAGINACIÓN ---
let currentPage = 1;
const itemsPerPage = 5; // Solo 5 resultados por página

function showView(view, id = null) {
    if (view === 'catalogo') {
        currentPage = 1; // Resetear a pag 1 al entrar
        renderCatalogo();
    }
    if (view === 'crear') renderForm(null);
    if (view === 'editar') renderForm(materiasOriginales.find(m => m.id === id));
}

// ------------------------------------------
// VISTA: CATÁLOGO
// ------------------------------------------
function renderCatalogo() {
    viewContainer.innerHTML = `
        <div class="module-header">
            <div>
                <h1>Catálogo de Materias</h1>
                <p>Consulte y gestione el listado completo de asignaturas académicas activas.</p>
            </div>
            <button class="btn-primary" onclick="showView('crear')"><i class='bx bx-plus'></i> Nueva Asignatura</button>
        </div>

        <div class="filter-card">
            <div class="filter-group">
                <label>Buscar</label>
                <div class="input-search-wrapper">
                    <i class='bx bx-search'></i>
                    <input type="text" id="q-search" placeholder="Buscar por nombre, código o ID..." onkeyup="if(event.key==='Enter') doSearch()">
                </div>
            </div>

            <div class="filter-group" style="flex: 0 0 200px;">
                <label>Filtrar por Año</label>
                <select id="f-filter-anio" onchange="doSearch()" style="padding:11px; border-radius:8px; border:1px solid var(--border); width:100%; outline:none;">
                    <option value="">Todos los años</option>
                    <option value="1er Año">1er Año</option>
                    <option value="2do Año">2do Año</option>
                    <option value="3er Año">3er Año</option>
                    <option value="4to Año">4to Año</option>
                    <option value="5to Año">5to Año</option>
                </select>
            </div>

            <button class="btn-reset" onclick="resetSearch()"><i class='bx bx-refresh'></i> Resetear</button>
            <button class="btn-primary" onclick="doSearch()"><i class='bx bx-search-alt'></i> Buscar</button>
        </div>

        <div class="table-card">
            <table>
                <thead>
                    <tr>
                        <th>ID</th><th>CÓDIGO</th><th>NOMBRE</th><th>DESCRIPCIÓN</th>
                        <th>AÑO</th><th>CARGA HORARIA</th><th>ACCIONES</th>
                    </tr>
                </thead>
                <tbody id="table-body">
                    </tbody>
            </table>
        </div>

        <div id="pagination-container" class="pagination"></div>
    `;
    updateTable();
}

// ------------------------------------------
// ACTUALIZAR TABLA Y PAGINACIÓN
// ------------------------------------------
function updateTable() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = materias.slice(start, end);

    document.getElementById('table-body').innerHTML = renderRows(paginatedData);
    renderPaginationControls();
}

function renderRows(data) {
    if (data.length === 0) return `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No se encontraron materias.</td></tr>`;
    
    return data.map(m => `
        <tr>
            <td style="color:#94a3b8">${m.id}</td>
            <td><span class="badge-code">${m.codigo}</span></td>
            <td><strong>${m.nombre}</strong></td>
            <td style="color:var(--text-muted); max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${m.descripcion}</td>
            <td><strong>${m.anio}</strong></td>
            <td class="carga-horaria"><i class='bx bx-time-five'></i> ${m.horas}h</td>
            <td>
                <button onclick="showView('editar', '${m.id}')" class="btn-icon edit"><i class='bx bx-edit-alt'></i></button>
                <button onclick="openDelete('${m.id}')" class="btn-icon delete"><i class='bx bx-trash'></i></button>
            </td>
        </tr>
    `).join('');
}

// --- GENERAR BOTONES DE PÁGINA ---
function renderPaginationControls() {
    const totalPages = Math.ceil(materias.length / itemsPerPage);
    const container = document.getElementById('pagination-container');
    let html = '';

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    container.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    updateTable();
}

// ------------------------------------------
// BÚSQUEDA Y FILTRO COMBINADO
// ------------------------------------------
function doSearch() {
    const q = document.getElementById('q-search').value.toLowerCase();
    const filterAnio = document.getElementById('f-filter-anio').value;

    materias = materiasOriginales.filter(m => {
        const matchesSearch = m.nombre.toLowerCase().includes(q) || 
                              m.codigo.toLowerCase().includes(q) || 
                              m.id.includes(q);
        const matchesAnio = filterAnio === "" || m.anio === filterAnio;
        
        return matchesSearch && matchesAnio;
    });

    currentPage = 1; // Volver a la página 1 tras filtrar
    updateTable();
}

function resetSearch() {
    document.getElementById('q-search').value = "";
    document.getElementById('f-filter-anio').value = ""; // Resetear dropdown
    materias = [...materiasOriginales];
    currentPage = 1;
    updateTable();
}

// ------------------------------------------
// LÓGICA: GUARDAR DATOS (CREAR / EDITAR)
// ------------------------------------------
function saveData(id) {
    // 1. Validar que se haya seleccionado un año (requerido)
    const anioSeleccionado = document.getElementById('f-anio').value;
    if(!anioSeleccionado) {
        alert("Por favor, seleccione el Año al que pertenece la materia.");
        return; // Detiene la función si no hay año
    }

    // 2. Crear el objeto con los valores de los inputs
    const obj = {
        nombre: document.getElementById('f-nombre').value,
        codigo: document.getElementById('f-codigo').value,
        // MODIFICADO: Se captura el valor del nuevo select de año
        anio: anioSeleccionado, 
        horas: document.getElementById('f-horas').value,
        // creditos: document.getElementById('f-creditos').value, // Eliminé créditos ya que no es común en bachillerato
        descripcion: document.getElementById('f-desc').value,
        estado: document.getElementById('f-estado').value
    };

    // 3. Decidir si es una actualización o una creación
    if (id) {
        // MODO EDICIÓN: Buscamos el índice y actualizamos el objeto existente
        let idx = materiasOriginales.findIndex(m => m.id === id);
        // Usamos spread syntax (...) para fusionar los datos viejos con los nuevos cambios
        materiasOriginales[idx] = { ...materiasOriginales[idx], ...obj };
    } else {
        // MODO CREACIÓN: Generamos un nuevo ID y agregamos al array
        const newId = (materiasOriginales.length + 1).toString().padStart(3, '0');
        // Agregamos propiedades por defecto para datos futuros (estudiantes, promedio)
        materiasOriginales.push({ id: newId, ...obj, estudiantes: 0, grupos: 0, promedio: '0/100' });
    }

    // 4. Actualizar la vista y volver al catálogo
    materias = [...materiasOriginales]; // Actualizamos la lista visible
    showView('catalogo'); // Volvemos a la tabla
}

// ------------------------------------------
// LÓGICA: BORRAR (MODAL)
// ------------------------------------------
let idDel = null;
function openDelete(id) { idDel = id; document.getElementById('delete-modal').style.display = 'flex'; }
function closeDel() { document.getElementById('delete-modal').style.display = 'none'; }
function confirmDel() {
    // Filtramos el array original para excluir el ID seleccionado
    materiasOriginales = materiasOriginales.filter(m => m.id !== idDel);
    materias = [...materiasOriginales]; // Actualizamos la lista visible
    closeDel(); // Cerramos modal
    renderCatalogo(); // Re-renderizamos la tabla
}

// ------------------------------------------
// FORMULARIO: CREAR / EDITAR
// ------------------------------------------
function renderForm(m) {
    const isEdit = !!m;
    viewContainer.innerHTML = `
        <div style="margin-bottom:20px; font-size:13px; color:var(--text-muted);">
            Inicio / Gestión de Materias / <span style="color:var(--primary); font-weight:700;">${isEdit ? 'Editar' : 'Crear Nueva'}</span>
        </div>
        <h1 style="margin-bottom:30px;">${isEdit ? 'Editar Asignatura' : 'Crear Nueva Asignatura'}</h1>
        
        <div class="table-card" style="padding:40px; position:relative;">
            <div style="position:absolute; top:0; left:0; width:100%; height:4px; background:var(--primary);"></div>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:25px;">
                <div class="filter-group" style="grid-column: span 3;">
                    <label>Nombre de la Materia *</label>
                    <div class="input-search-wrapper"><i class='bx bx-book'></i><input id="f-nombre" type="text" value="${isEdit ? m.nombre : ''}"></div>
                </div>
                <div class="filter-group">
                    <label>Código Identificador *</label>
                    <div class="input-search-wrapper"><i class='bx bx-hash'></i><input id="f-codigo" type="text" value="${isEdit ? m.codigo : ''}"></div>
                </div>
                <div class="filter-group">
                    <label>Estado del Curso</label>
                    <select id="f-estado" style="padding:11px; border-radius:8px; border:1px solid var(--border);">
                        <option ${isEdit && m.estado==='Activo'?'selected':''}>Activo</option>
                        <option ${isEdit && m.estado==='Inactivo'?'selected':''}>Inactivo</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Año *</label>
                    <select id="f-anio" style="padding:11px; border-radius:8px; border:1px solid var(--border);">
                        <option value="">Seleccionar Año</option>
                        <option value="1er Año" ${isEdit && m.anio==='1er Año'?'selected':''}>1er Año</option>
                        <option value="2do Año" ${isEdit && m.anio==='2do Año'?'selected':''}>2do Año</option>
                        <option value="3er Año" ${isEdit && m.anio==='3er Año'?'selected':''}>3er Año</option>
                        <option value="4to Año" ${isEdit && m.anio==='4to Año'?'selected':''}>4to Año</option>
                        <option value="5to Año" ${isEdit && m.anio==='5to Año'?'selected':''}>5to Año</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Carga Horaria Semanal *</label>
                    <div class="input-search-wrapper">
                        <i class='bx bx-time'></i>
                        <input id="f-horas" type="number" value="${isEdit ? m.horas : ''}">
                        <span style="position:absolute; right:15px; color:var(--text-muted); font-size:12px;">Horas</span>
                    </div>
                </div>
                <div class="filter-group">
                    <label>Créditos Académicos</label>
                    <div class="input-search-wrapper"><i class='bx bx-star'></i><input id="f-creditos" type="number" value="${isEdit ? m.creditos : '0'}"></div>
                </div>
                <div class="filter-group" style="grid-column: span 3;">
                    <label>Descripción / Síntesis</label>
                    <textarea id="f-desc" rows="4" style="padding:15px; border-radius:8px; border:1px solid var(--border);">${isEdit ? m.descripcion : ''}</textarea>
                </div>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:15px; margin-top:30px;">
                <button class="btn-cancel" onclick="showView('catalogo')">Cancelar</button>
                <button class="btn-save" onclick="saveData('${isEdit ? m.id : ''}')">${isEdit ? 'Guardar Cambios' : 'Crear Asignatura'}</button>
            </div>
        </div>
    `;
}

// Al cargar la página, mostrar el catálogo por defecto
window.onload = () => showView('catalogo');