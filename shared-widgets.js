// ==========================================
// Shared Floating Widgets: Chat + Coffee
// ==========================================
// This file is included on all sub-pages (reviews, files, resources, exams)
// to provide the live chat widget and fix coffee modal helpers.

// openModal / closeModal helpers (needed for coffee button on sub-pages)
window.openModal = function(id) {
    document.getElementById(id).classList.remove('hidden');
};
window.closeModal = function(id) {
    document.getElementById(id).classList.add('hidden');
};

// ==========================================
// Supabase Client (for chat)
// ==========================================
const _sb = window.supabase ? window.supabase.createClient(
    'https://yqsjtcqxzouglmarvumk.supabase.co',
    'sb_publishable__qCSfxLN65HRJH_9UuKlzA_9XN9Sc0l'
) : null;

// ==========================================
// Live Chat Logic
// ==========================================
let _chatContact = localStorage.getItem('b_chat_contact');
if (!_chatContact || _chatContact === 'null' || _chatContact === 'undefined') {
    _chatContact = '';
}
let _chatPolling = null;

window.toggleChatWidget = function() {
    const widget = document.getElementById('chatWidget');
    if (!widget) return;
    if (widget.classList.contains('hidden')) {
        widget.classList.remove('hidden');
        widget.classList.add('flex');
        if (_chatContact) {
            document.getElementById('chatRegisterView').classList.add('hidden');
            document.getElementById('chatMessagesView').classList.remove('hidden');
            document.getElementById('chatMessagesView').classList.add('flex');
            _loadMessages();
            if(!_chatPolling) _chatPolling = setInterval(_loadMessages, 5000);
        } else {
            document.getElementById('chatRegisterView').classList.remove('hidden');
            document.getElementById('chatMessagesView').classList.add('hidden');
            document.getElementById('chatMessagesView').classList.remove('flex');
        }
    } else {
        widget.classList.add('hidden');
        widget.classList.remove('flex');
        if(_chatPolling) { clearInterval(_chatPolling); _chatPolling = null; }
    }
};

window.startChat = function() {
    const ig = document.getElementById('chatIgInput').value.trim();
    if (!ig) return;
    _chatContact = ig;
    localStorage.setItem('b_chat_contact', ig);
    document.getElementById('chatRegisterView').classList.add('hidden');
    document.getElementById('chatMessagesView').classList.remove('hidden');
    document.getElementById('chatMessagesView').classList.add('flex');
    _loadMessages();
    if(!_chatPolling) _chatPolling = setInterval(_loadMessages, 5000);
};

async function _loadMessages() {
    if (!_chatContact || !_sb) return;
    try {
        const { data, error } = await _sb
            .from('messages').select('*')
            .eq('contact', _chatContact)
            .order('created_at', { ascending: true });
        if (error && error.code !== '42P01') throw error;
        _renderMessages(data || []);
    } catch (err) { console.error("Chat load error", err); }
}

function _renderMessages(messages) {
    const c = document.getElementById('chatMessagesList');
    if (!c) return;
    const atBottom = c.scrollHeight - c.scrollTop <= c.clientHeight + 50;
    c.innerHTML = messages.map(m => {
        const isUser = m.sender === 'user';
        return `<div class="flex ${isUser ? 'justify-end' : 'justify-start'}">
            <div class="max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isUser ? 'bg-latte-700 text-white rounded-br-none' : 'bg-white border border-latte-200 text-latte-900 rounded-bl-none'}">
                ${m.message}
            </div>
        </div>`;
    }).join('');
    if (atBottom || messages.length <= 1) c.scrollTop = c.scrollHeight;
}

window.sendChatMessage = async function() {
    const input = document.getElementById('chatMsgInput');
    const msg = input.value.trim();
    if (!msg || !_chatContact || !_sb) return;
    input.value = '';
    const c = document.getElementById('chatMessagesList');
    c.innerHTML += `<div class="flex justify-end"><div class="max-w-[80%] rounded-2xl px-4 py-2 text-sm bg-latte-700 text-white rounded-br-none opacity-50">${msg}</div></div>`;
    c.scrollTop = c.scrollHeight;
    try {
        const { data: existing } = await _sb.from('messages').select('id').eq('contact', _chatContact).limit(1);
        const isFirst = !existing || existing.length === 0;
        const { error } = await _sb.from('messages').insert([{ contact: _chatContact, message: msg, sender: 'user', is_read: false }]);
        if (error) throw error;
        if (isFirst) {
            await _sb.from('messages').insert([{ contact: _chatContact, message: 'ได้รับข้อความแล้วครับ บีสจะรีบตอบกลับนะ 💖', sender: 'admin', is_read: true }]);
        }
        _loadMessages();
    } catch (err) {
        console.error(err);
        if(err.code === '42P01') { alert("แอดมินยังไม่ได้สร้างตาราง messages ในฐานข้อมูลครับ!"); }
        else { alert("ส่งข้อความไม่สำเร็จ"); }
    }
};

// ==========================================
// Settings Widget (Dark Mode & Language)
// ==========================================
window.toggleSettingsWidget = function() {
    const widget = document.getElementById('settingsWidget');
    if (!widget) return;
    if (widget.classList.contains('hidden')) {
        widget.classList.remove('hidden');
        widget.classList.add('flex');
    } else {
        widget.classList.add('hidden');
        widget.classList.remove('flex');
    }
};

window.toggleDarkMode = function() {
    const htmlEl = document.documentElement;
    if (htmlEl.classList.contains('dark')) {
        htmlEl.classList.remove('dark');
        localStorage.setItem('b_theme', 'light');
    } else {
        htmlEl.classList.add('dark');
        localStorage.setItem('b_theme', 'dark');
    }
    updateDarkModeToggleUI();
};

function updateDarkModeToggleUI() {
    const isDark = document.documentElement.classList.contains('dark');
    const toggle = document.getElementById('darkModeToggle');
    if(toggle) {
        if(isDark) {
            toggle.classList.remove('bg-latte-200');
            toggle.classList.add('bg-latte-500');
            toggle.innerHTML = '<span class="translate-x-5 inline-block w-4 h-4 transform bg-white rounded-full transition-transform"></span>';
        } else {
            toggle.classList.remove('bg-latte-500');
            toggle.classList.add('bg-latte-200');
            toggle.innerHTML = '<span class="translate-x-1 inline-block w-4 h-4 transform bg-white rounded-full transition-transform"></span>';
        }
    }
}



// ==========================================
// Inject Floating Buttons + Chat Widget HTML
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Apply dark mode on load
    if (localStorage.getItem('b_theme') === 'dark') {
        document.documentElement.classList.add('dark');
    }
    setTimeout(updateDarkModeToggleUI, 100);

    const floatingHTML = `
    <!-- Floating Settings Button -->
    <button onclick="toggleSettingsWidget()"
        class="fixed bottom-[150px] left-6 bg-white text-latte-700 p-3 rounded-full shadow-lg hover:bg-latte-100 hover:scale-110 transition-all duration-300 z-40 flex items-center justify-center border border-latte-200 w-12 h-12">
        <span class="text-xl">⚙️</span>
    </button>

    <!-- Settings Widget -->
    <div id="settingsWidget" class="fixed bottom-[210px] left-6 w-64 bg-white rounded-2xl shadow-2xl z-50 flex-col hidden overflow-hidden border border-latte-200">
        <div class="bg-latte-800 text-white p-3 flex justify-between items-center">
            <h3 class="font-sans font-medium text-sm">ตั้งค่า (Settings)</h3>
            <button onclick="toggleSettingsWidget()" class="hover:text-latte-200"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        <div class="p-4 space-y-4 bg-latte-50">
            <!-- Dark Mode Toggle -->
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-latte-900 flex items-center gap-2">🌙 โหมดกลางคืน</span>
                <button id="darkModeToggle" onclick="toggleDarkMode()" class="relative inline-flex items-center h-6 rounded-full w-10 transition-colors focus:outline-none bg-latte-200">
                    <span class="translate-x-1 inline-block w-4 h-4 transform bg-white rounded-full transition-transform"></span>
                </button>
            </div>

        </div>
    </div>

    <!-- Floating Chat Button -->
    <button onclick="toggleChatWidget()"
        class="fixed bottom-[90px] left-6 bg-[#D4B89F] text-white p-3 rounded-full shadow-lg hover:bg-latte-800 hover:scale-110 transition-all duration-300 z-40 flex items-center gap-2 group border-2 border-white">
        <span class="text-2xl">💬</span>
        <span class="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out font-medium text-sm text-white group-hover:px-2 group-hover:pr-3">
            คุยกับบีส
        </span>
    </button>

    <!-- Chat Widget -->
    <div id="chatWidget" class="fixed bottom-[170px] left-6 sm:left-auto sm:bottom-8 sm:right-8 w-[calc(100vw-3rem)] sm:w-80 max-w-sm h-[420px] bg-white rounded-2xl shadow-2xl z-50 flex-col hidden overflow-hidden border border-latte-200">
        <div class="bg-latte-800 text-white p-4 flex justify-between items-center shrink-0">
            <h3 class="font-serif font-bold flex items-center gap-2">💬 คุยกับบีส</h3>
            <button onclick="toggleChatWidget()" class="hover:text-latte-200 transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        <div id="chatRegisterView" class="flex-1 flex flex-col items-center justify-center p-6 bg-latte-50">
            <p class="text-sm text-latte-700 text-center mb-4">ใส่ชื่อ IG ของคุณเพื่อเริ่มแชทครับ (จะได้ตอบกลับถูกคนน้า)</p>
            <input type="text" id="chatIgInput" placeholder="IG Username" class="w-full bg-white border border-latte-300 rounded-xl p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-latte-400">
            <button onclick="startChat()" class="w-full bg-latte-700 text-white rounded-xl p-3 hover:bg-latte-900 transition font-medium">เริ่มคุยเลย!</button>
        </div>
        <div id="chatMessagesView" class="flex-1 hidden flex-col bg-latte-50 h-full">
            <div id="chatMessagesList" class="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col"></div>
            <div class="p-3 bg-white border-t border-latte-200 shrink-0 flex gap-2">
                <input type="text" id="chatMsgInput" placeholder="พิมพ์ข้อความ..." class="flex-1 bg-latte-50 border border-latte-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-latte-400 text-sm" onkeypress="if(event.key === 'Enter') sendChatMessage()">
                <button onclick="sendChatMessage()" class="bg-latte-700 text-white p-2 rounded-full hover:bg-latte-900 transition flex items-center justify-center w-10 h-10 shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', floatingHTML);


});
