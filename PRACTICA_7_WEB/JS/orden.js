/**
 * orden.js — Validaciones y lógica del formulario de pedido
 * Café y a Gusto
 */

(function () {
    'use strict';

    /* ─── Referencias al DOM ─────────────────────────────────────────── */
    const form               = document.getElementById('orderForm');

    // Sección 1
    const inputNombre        = document.getElementById('nombre-completo');
    const inputCurp          = document.getElementById('curp');
    const inputDireccion     = document.getElementById('direccion');

    // Sección 2
    const radioTipoMenu      = document.getElementById('tipo-menu');
    const radioTipoPromo     = document.getElementById('tipo-promocion');
    const containerMenu      = document.getElementById('container-select-menu');
    const containerPromo     = document.getElementById('container-select-promo');
    const selectMenu         = document.getElementById('producto-menu');
    const selectPromo        = document.getElementById('producto-promo');
    const inputTemperatura   = document.getElementById('temperatura');

    // Sección 5 — Pago
    const radioEfectivo      = document.getElementById('pago-efectivo');
    const radioTarjeta       = document.getElementById('pago-tarjeta');
    const seccionTarjeta     = document.getElementById('seccion-tarjeta');
    const inputNumTarjeta    = document.getElementById('num-tarjeta');
    const inputVencimiento   = document.getElementById('vencimiento');
    const inputCvv           = document.getElementById('cvv');

    /* ─── Helpers para mensajes de error ────────────────────────────── */
    function mostrarError(id, mensaje) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = mensaje;
            el.style.display = mensaje ? 'block' : 'none';
        }
    }

    function limpiarError(id) {
        mostrarError(id, '');
    }

    function marcarCampo(input, valido) {
        if (!input) return;
        input.classList.toggle('input-error', !valido);
        input.classList.toggle('input-ok', valido);
    }

    /* ═══════════════════════════════════════════════════════════════════
       SECCIÓN 2 — Tipo de compra: radio buttons que cambian el select
       ═══════════════════════════════════════════════════════════════════ */

    function manejarTipoCompra() {
        const esMenu  = radioTipoMenu  && radioTipoMenu.checked;
        const esPromo = radioTipoPromo && radioTipoPromo.checked;

        // Mostrar / ocultar el contenedor correcto
        if (esMenu) {
            containerMenu.classList.remove('hidden');
            containerPromo.classList.add('hidden');

            // Habilitar el select de menú y deshabilitar el de promo
            selectMenu.disabled  = false;
            selectPromo.disabled = true;
            selectPromo.value    = '';

            limpiarError('error-producto-promo');
        } else if (esPromo) {
            containerPromo.classList.remove('hidden');
            containerMenu.classList.add('hidden');

            // Habilitar el select de promo y deshabilitar el de menú
            selectPromo.disabled = false;
            selectMenu.disabled  = true;
            selectMenu.value     = '';

            limpiarError('error-producto-menu');
        } else {
            // Ninguno elegido aún: ambos deshabilitados
            selectMenu.disabled  = true;
            selectPromo.disabled = true;
        }

        limpiarError('error-tipo-compra');
    }

    if (radioTipoMenu)  radioTipoMenu.addEventListener('change',  manejarTipoCompra);
    if (radioTipoPromo) radioTipoPromo.addEventListener('change', manejarTipoCompra);

    // Ejecutar al cargar por si hay algún radio pre-seleccionado
    manejarTipoCompra();

    /* ═══════════════════════════════════════════════════════════════════
       SECCIÓN 5 — Pago: mostrar/ocultar campos de tarjeta
       ═══════════════════════════════════════════════════════════════════ */

    function manejarMetodoPago() {
        const esTarjeta = radioTarjeta && radioTarjeta.checked;
        seccionTarjeta.style.display = esTarjeta ? 'block' : 'none';

        // Limpiar errores de tarjeta cuando se oculta
        if (!esTarjeta) {
            limpiarError('error-num-tarjeta');
            limpiarError('error-vencimiento');
            limpiarError('error-cvv');
            marcarCampo(inputNumTarjeta, true);
            marcarCampo(inputVencimiento, true);
            marcarCampo(inputCvv, true);
        }
    }

    if (radioEfectivo) radioEfectivo.addEventListener('change', manejarMetodoPago);
    if (radioTarjeta)  radioTarjeta.addEventListener('change',  manejarMetodoPago);

    // Ejecutar al cargar
    manejarMetodoPago();

    /* ═══════════════════════════════════════════════════════════════════
       VALIDACIONES INDIVIDUALES (se disparan al salir del campo)
       ═══════════════════════════════════════════════════════════════════ */

    /* ── CURP: exactamente 18 caracteres alfanuméricos ── */
    function validarCurp() {
        const val   = inputCurp.value.trim().toUpperCase();
        const regex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/;
        let valido  = false;

        if (val.length === 0) {
            mostrarError('error-curp', 'El CURP es obligatorio.');
        } else if (val.length !== 18) {
            mostrarError('error-curp', `El CURP debe tener exactamente 18 caracteres (llevas ${val.length}).`);
        } else if (!regex.test(val)) {
            mostrarError('error-curp', 'El CURP no tiene un formato válido.');
        } else {
            limpiarError('error-curp');
            valido = true;
        }

        marcarCampo(inputCurp, valido);
        return valido;
    }

    inputCurp.addEventListener('blur', validarCurp);
    // Convertir a mayúsculas mientras escribe
    inputCurp.addEventListener('input', function () {
        this.value = this.value.toUpperCase();
    });

    /* ── Nombre: no vacío ── */
    function validarNombre() {
        const val    = inputNombre.value.trim();
        const valido = val.length > 0;
        if (!valido) {
            mostrarError('error-nombre', 'Por favor ingresa tu nombre completo.');
        } else {
            limpiarError('error-nombre');
        }
        marcarCampo(inputNombre, valido);
        return valido;
    }

    inputNombre.addEventListener('blur', validarNombre);

    /* ── Dirección: no vacía y al menos 15 caracteres ── */
    function validarDireccion() {
        const val = inputDireccion.value.trim();
        let valido = false;

        if (val.length === 0) {
            mostrarError('error-direccion', 'La dirección es obligatoria.');
        } else if (val.length < 15) {
            mostrarError('error-direccion', 'Por favor ingresa una dirección más completa.');
        } else {
            limpiarError('error-direccion');
            valido = true;
        }

        marcarCampo(inputDireccion, valido);
        return valido;
    }

    inputDireccion.addEventListener('blur', validarDireccion);

    /* ── Tipo de compra: debe elegirse uno ── */
    function validarTipoCompra() {
        const elegido = radioTipoMenu.checked || radioTipoPromo.checked;
        if (!elegido) {
            mostrarError('error-tipo-compra', 'Selecciona si quieres del Menú Regular o de las Promociones.');
        } else {
            limpiarError('error-tipo-compra');
        }
        return elegido;
    }

    /* ── Producto seleccionado ── */
    function validarProducto() {
        if (radioTipoMenu.checked) {
            const valido = selectMenu.value !== '';
            if (!valido) mostrarError('error-producto-menu', 'Selecciona un producto del menú.');
            else limpiarError('error-producto-menu');
            marcarCampo(selectMenu, valido);
            return valido;
        }
        if (radioTipoPromo.checked) {
            const valido = selectPromo.value !== '';
            if (!valido) mostrarError('error-producto-promo', 'Selecciona una promoción.');
            else limpiarError('error-producto-promo');
            marcarCampo(selectPromo, valido);
            return valido;
        }
        return false;
    }

    selectMenu.addEventListener('change',  validarProducto);
    selectPromo.addEventListener('change', validarProducto);

    /* ── Temperatura: entre 0 y 100 si se llena ── */
    function validarTemperatura() {
        const val = inputTemperatura.value;
        if (val === '') {
            limpiarError('error-temperatura');
            marcarCampo(inputTemperatura, true);
            return true; // campo opcional
        }
        const num    = Number(val);
        const valido = num >= 0 && num <= 100;
        if (!valido) {
            mostrarError('error-temperatura', 'La temperatura debe estar entre 0 y 100 °C.');
        } else {
            limpiarError('error-temperatura');
        }
        marcarCampo(inputTemperatura, valido);
        return valido;
    }

    inputTemperatura.addEventListener('blur', validarTemperatura);

    /* ══════════════════════════════════════════════════════════════════
       SECCIÓN 5 — Validaciones de tarjeta (anti-patrón intencional)
       ══════════════════════════════════════════════════════════════════ */

    /* ── Número de tarjeta: 16 dígitos, sin formato automático ── */
    function validarNumTarjeta() {
        if (!radioTarjeta.checked) return true;
        const val    = inputNumTarjeta.value.trim();
        const valido = /^\d{16}$/.test(val);

        if (val.length === 0) {
            mostrarError('error-num-tarjeta', 'Ingresa el número de tarjeta.');
        } else if (!valido) {
            mostrarError('error-num-tarjeta', 'El número debe tener exactamente 16 dígitos.');
        } else {
            limpiarError('error-num-tarjeta');
        }

        marcarCampo(inputNumTarjeta, valido);
        return valido;
    }

    inputNumTarjeta.addEventListener('blur', validarNumTarjeta);
    // Solo permite dígitos
    inputNumTarjeta.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 16);
    });

    /* ── Vencimiento: campo libre sin máscara (anti-patrón) ── */
    function validarVencimiento() {
        if (!radioTarjeta.checked) return true;
        const val    = inputVencimiento.value.trim();
        // Acepta cualquier cosa que no esté vacía (anti-patrón: sin validación de formato)
        const valido = val.length > 0;

        if (!valido) {
            mostrarError('error-vencimiento', 'Ingresa la fecha de vencimiento.');
        } else {
            limpiarError('error-vencimiento');
        }

        marcarCampo(inputVencimiento, valido);
        return valido;
    }

    inputVencimiento.addEventListener('blur', validarVencimiento);

    /* ── CVV: tipo text visible (anti-patrón), 3 o 4 dígitos ── */
    function validarCvv() {
        if (!radioTarjeta.checked) return true;
        const val    = inputCvv.value.trim();
        const valido = /^\d{3,4}$/.test(val);

        if (val.length === 0) {
            mostrarError('error-cvv', 'Ingresa el CVV.');
        } else if (!valido) {
            mostrarError('error-cvv', 'El CVV debe tener 3 o 4 dígitos.');
        } else {
            limpiarError('error-cvv');
        }

        marcarCampo(inputCvv, valido);
        return valido;
    }

    inputCvv.addEventListener('blur', validarCvv);
    // Solo permite dígitos
    inputCvv.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 4);
    });

    /* ═══════════════════════════════════════════════════════════════════
       ENVÍO DEL FORMULARIO — Validación general
       ═══════════════════════════════════════════════════════════════════ */

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Ejecutar todas las validaciones
        const ok = [
            validarNombre(),
            validarCurp(),
            validarDireccion(),
            validarTipoCompra(),
            validarProducto(),
            validarTemperatura(),
            validarNumTarjeta(),
            validarVencimiento(),
            validarCvv(),
        ].every(Boolean);

        if (ok) {
            // Todo correcto: mostrar confirmación
            alert('✅ ¡Orden enviada con éxito! Gracias por tu pedido en Café y a Gusto.');
            form.reset();
            // Resetear estado de los selectores
            manejarTipoCompra();
            manejarMetodoPago();
            // Limpiar clases de validación
            document.querySelectorAll('.input-ok, .input-error').forEach(function (el) {
                el.classList.remove('input-ok', 'input-error');
            });
        } else {
            // Scroll al primer campo con error
            const primerError = form.querySelector('.input-error');
            if (primerError) {
                primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                primerError.focus();
            }
        }
    });

})();