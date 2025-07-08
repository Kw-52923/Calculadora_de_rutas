//  - Calculadora de Rutas

// Variables globales que usaremos en todo el script
let mapa = []; // Aquí se guardará la estructura del mapa en forma de matriz
let tamanoMapa = 15; // Tamaño por defecto del mapa (15x15)
let punto_inicio = { filas: 0, columnas: 0 }; // Coordenadas iniciales del punto de partida
let punto_final = { filas: 14, columnas: 14 }; // Coordenadas iniciales del punto de llegada
let ruta_actual = []; // Aquí se guarda la ruta calculada una vez encontrada

// Constantes que representan los diferentes tipos de terreno en el mapa
const TERRENO = {
    CAMINO_LIBRE: 0,       // Camino transitable
    EDIFICIO: 1,           // Obstáculo: edificio
    AGUA: 2,               // Obstáculo: agua
    ZONA_BLOQUEADA: 3,     // Obstáculo: zona bloqueada
    INICIO: 4,             // Punto de inicio
    DESTINO: 5,            // Punto de destino
    RUTA_CALCULADA: 6      // Parte del camino encontrado
};

// Diccionario para asociar cada tipo de terreno con una clase CSS
const CLASES_TERRENO = {
    [TERRENO.CAMINO_LIBRE]: 'libre',
    [TERRENO.EDIFICIO]: 'edificio',
    [TERRENO.AGUA]: 'agua',
    [TERRENO.ZONA_BLOQUEADA]: 'bloqueado',
    [TERRENO.INICIO]: 'inicio',
    [TERRENO.DESTINO]: 'final',
    [TERRENO.RUTA_CALCULADA]: 'camino'
};

// Diccionario para asociar cada tipo de terreno con un símbolo para mostrar en la celda
const SIMBOLOS_TERRENO = {
    [TERRENO.CAMINO_LIBRE]: '·',
    [TERRENO.EDIFICIO]: '🏢',
    [TERRENO.AGUA]: '🌊',
    [TERRENO.ZONA_BLOQUEADA]: '🚧',
    [TERRENO.INICIO]: '🚀',
    [TERRENO.DESTINO]: '🎯',
    [TERRENO.RUTA_CALCULADA]: '⭐'
};

// Función que genera un nuevo mapa vacío con caminos libres y obstáculos aleatorios
function generarMapa() {
    tamanoMapa = parseInt(document.getElementById('tamanoMapa').value); // Leer tamaño del mapa seleccionado
    mapa = [];

    // Crear matriz de caminos libres
    for (let i = 0; i < tamanoMapa; i++) {
        mapa[i] = [];
        for (let j = 0; j < tamanoMapa; j++) {
            mapa[i][j] = TERRENO.CAMINO_LIBRE;
        }
    }

    agregarObstaculosAleatorios(); // Colocar obstáculos de forma aleatoria
    actualizarInicioFin(); // Validar y colocar el inicio y fin
    renderizarMapa(); // Dibujar el mapa en pantalla
    mostrarMensaje('🗺️ ¡Nuevo mapa generado exitosamente!', 'success'); // Mostrar mensaje al usuario
}

// Agrega obstáculos aleatoriamente al mapa
function agregarObstaculosAleatorios() {
    const cantidad = Math.floor(tamanoMapa * tamanoMapa * 0.15); // 15% del total de celdas serán obstáculos

    for (let i = 0; i < cantidad; i++) {
        const fila = Math.floor(Math.random() * tamanoMapa);
        const columna = Math.floor(Math.random() * tamanoMapa);

        // Evitar colocar obstáculos en la esquina de inicio y fin
        if ((fila === 0 && columna === 0) || (fila === tamanoMapa - 1 && columna === tamanoMapa - 1)) {
            continue;
        }

        const tipo = Math.floor(Math.random() * 3) + 1; // Número entre 1 y 3
        mapa[fila][columna] = tipo; // Asignar obstáculo
    }
}

// Lee los valores de los inputs de inicio y fin y los valida
function actualizarInicioFin() {
    //document.getElementById- Esto busca un elemento del HTML con el atributo
    const inicio = document.getElementById('punto_inicio').value.split(',');
    const fin = document.getElementById('punto_final').value.split(',');

    const filaInicio = parseInt(inicio[0]) || 0;
    const colInicio = parseInt(inicio[1]) || 0;

    if (esPosicionValida(filaInicio, colInicio)) {
        punto_inicio = { filas: filaInicio, columnas: colInicio };
    } else {
        punto_inicio = { filas: 0, columnas: 0 };
        document.getElementById('punto_inicio').value = '0,0';
    }

    const filaFin = parseInt(fin[0]) || tamanoMapa - 1;
    const colFin = parseInt(fin[1]) || tamanoMapa - 1;
   
    if (esPosicionValida(filaFin, colFin)) {
        punto_final = { filas: filaFin, columnas: colFin };
    } else {
        punto_final = { filas: tamanoMapa - 1, columnas: tamanoMapa - 1 };
        document.getElementById('punto_final').value = `${tamanoMapa - 1},${tamanoMapa - 1}`;
    }
}

// Verifica si una posición está dentro del mapa
function esPosicionValida(filas, columnas) {
    return filas >= 0 && filas < tamanoMapa && columnas >= 0 && columnas < tamanoMapa;
}

// Dibuja la grilla del mapa en pantalla
function renderizarMapa() {
    const grilla = document.getElementById('grillaMapa');
    grilla.innerHTML = ''; //innerHTML- Lee o reemplaza el contenido HTML dentro de un elemento
    // gridTemplateColumns son propiedades de CSS ,cuántas columnas y filas tiene la grilla, y cómo se distribuyen.
    grilla.style.gridTemplateColumns = `repeat(${tamanoMapa}, 1fr)`; 

    for (let i = 0; i < tamanoMapa; i++) {
        for (let j = 0; j < tamanoMapa; j++) {
            const celda = document.createElement('div');
            celda.className = 'cell';
            //dataset es una propiedad que te permite acceder y modificar los atributos de un elemento HTML
            celda.dataset.filas = i;
            celda.dataset.columnas = j;
            //addEventListener-Prestá atención cuando pase tal cosa (como un click)... y hacé esto.”
            celda.addEventListener('click', () => clicEnCelda(i, j));
            // .appendChild- Tomá esta celda que acabo de crear y ponela dentro del elemento grilla.
            grilla.appendChild(celda);
        }
    }

    actualizarVisualizacionMapa();
}

// Cuando el usuario hace clic en una celda, se alterna entre obstáculo y camino libre
function clicEnCelda(filas, columnas) {
    if ((filas === punto_inicio.filas && columnas === punto_inicio.columnas) ||
        (filas === punto_final.filas && columnas === punto_final.columnas)) {
        return;
    }

    const tipo = parseInt(document.getElementById('tipo_obstaculos').value);

    if (mapa[filas][columnas] !== TERRENO.CAMINO_LIBRE && mapa[filas][columnas] !== TERRENO.RUTA_CALCULADA) {
        mapa[filas][columnas] = TERRENO.CAMINO_LIBRE;
    } else {
        mapa[filas][columnas] = tipo;
    }

    limpiarRuta();
    actualizarVisualizacionMapa();
}

// Actualiza visualmente todas las celdas del mapa
function actualizarVisualizacionMapa() {
    //.querySelectorAll -seleeciona todo lo que tenga la clase cell
    const celdas = document.querySelectorAll('.cell');
    //Para cada celda en celdas, hacé lo siguiente…”
    celdas.forEach(celda => {
        const fila = parseInt(celda.dataset.filas);
        const columna = parseInt(celda.dataset.columnas);
        let tipoTerreno = mapa[fila][columna];

        // Mostrar íconos especiales para inicio y destino
        if (fila === punto_inicio.filas && columna === punto_inicio.columnas) {
            tipoTerreno = TERRENO.INICIO;
        } else if (fila === punto_final.filas && columna === punto_final.columnas) {
            tipoTerreno = TERRENO.DESTINO;
        }

        celda.className = 'cell ' + CLASES_TERRENO[tipoTerreno];
        celda.textContent = SIMBOLOS_TERRENO[tipoTerreno];
    });
}

// Esta es la función principal que llama a buscarRutaBFS() si todo está validado.
function calcularRuta() {
    limpiarRuta();
    actualizarInicioFin();

    if (!esPosicionValida(punto_inicio.filas, punto_inicio.columnas) ||
        !esPosicionValida(punto_final.filas, punto_final.columnas)) {
        mostrarMensaje('❌ ¡Puntos de inicio o destino inválidos!', 'error');
        return;
    }

    if (esObstaculo(punto_inicio.filas, punto_inicio.columnas) || 
        esObstaculo(punto_final.filas, punto_final.columnas)) {
        mostrarMensaje('❌ ¡Los puntos de inicio o destino están en obstáculos!', 'error');
        return;
    }

    const ruta = buscarRutaBFS(punto_inicio, punto_final);

    if (ruta.length === 0) {
        mostrarMensaje('❌ ¡No se encontró una ruta posible!', 'error');
        return;
    }

    ruta_actual = ruta;
    for (let i = 1; i < ruta.length - 1; i++) {
        const { filas, columnas } = ruta[i];
        mapa[filas][columnas] = TERRENO.RUTA_CALCULADA;
    }

    actualizarVisualizacionMapa();
    mostrarMensaje(`✅ ¡Ruta encontrada! Distancia: ${ruta.length - 1} pasos`, 'success');
}

// Algoritmo BFS para encontrar la ruta más corta en una grilla
function buscarRutaBFS(inicio, destino) {
    const cola = [{ filas: inicio.filas, columnas: inicio.columnas, camino: [inicio] }];
    //Set para evitar visitar celdas duplicadas.
    const visitados = new Set();
    // .add  evita repetir caminos,guarda las posiciones visitadas 
    visitados.add(`${inicio.filas},${inicio.columnas}`);

    const direcciones = [
        { filas: -1, columnas: 0 }, // arriba
        { filas: 1, columnas: 0 },  // abajo
        { filas: 0, columnas: -1 }, // izquierda
        { filas: 0, columnas: 1 }   // derecha
    ];
    // length cuántos elementos hay 
    while (cola.length > 0) {
        //shift() saca y devuelve el primer elemento del array cola.
        const actual = cola.shift();
        const { filas, columnas, camino } = actual;

        if (filas === destino.filas && columnas === destino.columnas) {
            return camino; // Se encontró la ruta
        }
            // con of accede directamente al objeto
        for (const dir of direcciones) {
            const nuevaFila = filas + dir.filas;
            const nuevaCol = columnas + dir.columnas;
            const posicion = `${nuevaFila},${nuevaCol}`;

            if (esPosicionValida(nuevaFila, nuevaCol) &&
                !visitados.has(posicion) &&
                !esObstaculo(nuevaFila, nuevaCol)) {
                // .add  evita repetir caminos,guarda las posiciones visitadas 
                visitados.add(posicion);
                //  ...camino, Tomá todo el camino recorrido hasta ahora, y agregale esta nueva celda.
                const nuevoCamino = [...camino, { filas: nuevaFila, columnas: nuevaCol }];
                // .push agrega la nueva ruta posible al final de la cola para que luego explorarla
                cola.push({ filas: nuevaFila, columnas: nuevaCol, camino: nuevoCamino });
            }
        }
    }

    return []; // No se encontró una ruta
}

// Verifica si una celda es un obstáculo
function esObstaculo(filas, columnas) {
    const terreno = mapa[filas][columnas];
    return terreno === TERRENO.EDIFICIO ||
           terreno === TERRENO.AGUA ||
           terreno === TERRENO.ZONA_BLOQUEADA;
}

// Limpia el camino actual encontrado
function limpiarRuta() {
    for (let i = 0; i < tamanoMapa; i++) {
        for (let j = 0; j < tamanoMapa; j++) {
            if (mapa[i][j] === TERRENO.RUTA_CALCULADA) {
                mapa[i][j] = TERRENO.CAMINO_LIBRE;
            }
        }
    }

    ruta_actual = []; // Resetear ruta
    actualizarVisualizacionMapa();
}

// Muestra mensajes temporales en pantalla (éxito o error)
function mostrarMensaje(mensaje, tipo) {
    const contenedor = document.getElementById('info');
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = tipo;
    mensajeDiv.textContent = mensaje;

    contenedor.appendChild(mensajeDiv);
    // Espera 3 segundos y luego elimina el mensaje
    setTimeout(() => {
        mensajeDiv.remove();
    }, 3000);
}

// Ejecutar funciones iniciales al cargar la página
// Carga mapa y actualiza campos si el usuario cambia el inicio o final
document.addEventListener('DOMContentLoaded', function () {
    generarMapa();

    document.getElementById('punto_inicio').addEventListener('change', actualizarInicioFin);
    document.getElementById('punto_final').addEventListener('change', actualizarInicioFin);
});
