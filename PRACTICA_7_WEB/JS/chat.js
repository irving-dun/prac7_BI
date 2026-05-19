/**
 * chat.js — Widget de chat para Café y a Gusto
 * Se comunica con el webhook de n8n vía POST.
 */

(function () {
    'use strict';

    /* ─── Configuración ─────────────────────────────────────────────── */
    const WEBHOOK_URL =
        'https://irvingmed.app.n8n.cloud/webhook/328b9a52-b17b-4a70-9f5a-ba2f885e6dc0/chat';

    const WELCOME_MESSAGE =
        '¡Hola! ☕ Bienvenido a Café y a Gusto. ¿En qué te puedo ayudar hoy?';

    /* ─── Elementos del DOM ─────────────────────────────────────────── */
    const fab        = document.getElementById('chatFab');
    const chatWindow = document.getElementById('chatWindow');
    const messages   = document.getElementById('chatMessages');
    const input      = document.getElementById('chatInput');
    const sendBtn    = document.getElementById('chatSendBtn');
    const badge      = document.getElementById('chatBadge');

    /* ─── Estado ────────────────────────────────────────────────────── */
    let isOpen        = false;
    let isWaiting     = false;       // Evita envíos mientras el bot responde
    let sessionId     = generateSessionId();
    let welcomeShown  = false;

    /* ─── Funciones de utilidad ─────────────────────────────────────── */

    /** Genera un ID de sesión único para mantener contexto en n8n */
    function generateSessionId() {
        return 'cafe-' + Math.random().toString(36).slice(2, 11) + '-' + Date.now();
    }

    /** Hace scroll automático al último mensaje */
    function scrollToBottom() {
        messages.scrollTop = messages.scrollHeight;
    }

    /* ─── Render de mensajes ────────────────────────────────────────── */

    /**
     * Añade una burbuja de mensaje al chat.
     * @param {string} text   - Texto del mensaje.
     * @param {'bot'|'user'} role - Quién lo envía.
     */
    function addMessage(text, role) {
        const bubble = document.createElement('div');
        bubble.classList.add('chat-bubble', `chat-bubble--${role}`);
        bubble.textContent = text;
        messages.appendChild(bubble);
        scrollToBottom();
    }

    /**
     * Muestra el indicador de "escribiendo…" y devuelve el elemento
     * para poder eliminarlo después.
     */
    function showTypingIndicator() {
        const bubble = document.createElement('div');
        bubble.classList.add('chat-bubble', 'chat-bubble--typing');
        bubble.id = 'typingIndicator';
        bubble.innerHTML = `
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>`;
        messages.appendChild(bubble);
        scrollToBottom();
        return bubble;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    /* ─── Comunicación con n8n ──────────────────────────────────────── */

    /**
     * Envía el mensaje del usuario al webhook de n8n
     * y muestra la respuesta del bot.
     * @param {string} userText - Texto escrito por el usuario.
     */
    async function sendMessage(userText) {
        if (!userText.trim() || isWaiting) return;

        isWaiting = true;
        sendBtn.disabled = true;

        // 1. Mostrar burbuja del usuario
        addMessage(userText, 'user');

        // 2. Mostrar indicador de escritura
        showTypingIndicator();

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatInput: userText,     // Campo que n8n espera por defecto
                    sessionId: sessionId,    // Contexto de conversación
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // n8n puede devolver la respuesta en distintos campos según el flujo:
            // data.output | data.text | data.message | data.response
            const botReply =
                data.output ||
                data.text   ||
                data.message||
                data.response||
                'No entendí tu mensaje, ¿puedes intentarlo de nuevo?';

            removeTypingIndicator();
            addMessage(botReply, 'bot');

        } catch (error) {
            removeTypingIndicator();
            addMessage(
                'Lo siento, hubo un problema de conexión. Por favor intenta de nuevo en un momento.',
                'bot'
            );
            console.error('[Chat widget] Error al contactar el webhook:', error);
        } finally {
            isWaiting    = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }

    /* ─── Abrir / cerrar el chat ────────────────────────────────────── */

    function openChat() {
        isOpen = true;
        fab.classList.add('is-open');
        chatWindow.classList.add('is-open');
        badge.classList.remove('visible');

        // Mostrar mensaje de bienvenida la primera vez
        if (!welcomeShown) {
            welcomeShown = true;
            setTimeout(() => addMessage(WELCOME_MESSAGE, 'bot'), 300);
        }

        input.focus();
    }

    function closeChat() {
        isOpen = false;
        fab.classList.remove('is-open');
        chatWindow.classList.remove('is-open');
    }

    function toggleChat() {
        isOpen ? closeChat() : openChat();
    }

    /* ─── Event listeners ───────────────────────────────────────────── */

    fab.addEventListener('click', toggleChat);

    sendBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (text) {
            input.value = '';
            sendMessage(text);
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const text = input.value.trim();
            if (text) {
                input.value = '';
                sendMessage(text);
            }
        }
    });

    // Mostrar badge si el chat está cerrado después de 5 s (invita al usuario a interactuar)
    setTimeout(() => {
        if (!isOpen) badge.classList.add('visible');
    }, 5000);

})();