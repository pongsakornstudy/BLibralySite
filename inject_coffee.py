import os

html_snippet = """
    <!-- Floating Coffee Button -->
    <button onclick="openModal('coffeeModal')" class="fixed bottom-6 left-6 bg-latte-800 text-white p-3 rounded-full shadow-lg hover:bg-latte-900 hover:scale-110 transition-all duration-300 z-40 flex items-center gap-2 group border-2 border-[#D4B89F]">
        <span class="text-2xl">☕️</span>
        <span class="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out font-medium text-sm group-hover:px-2 group-hover:pr-3">
            สนับสนุนค่ากาแฟบีส
        </span>
    </button>

    <!-- Coffee QR Modal -->
    <div id="coffeeModal" class="fixed inset-0 bg-latte-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden transition-opacity">
        <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-center border-4 border-[#D4B89F]">
            <button onclick="closeModal('coffeeModal')" class="absolute top-4 right-4 text-latte-500 hover:text-latte-900 bg-latte-100 p-1.5 rounded-full transition hover:bg-latte-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div class="text-5xl mb-3 animate-bounce mt-2">☕️</div>
            <h3 class="text-xl font-serif font-bold text-latte-900 mb-2">สนับสนุนค่ากาแฟบีส</h3>
            <p class="text-sm text-latte-600 mb-6">ขอบคุณที่เป็นกำลังใจให้บีสนะครับ ขอให้สอบผ่านทุกวิชาเลย! 💖</p>
            <div class="bg-latte-50 p-4 rounded-2xl border border-latte-200 shadow-inner">
                <img src="./images/qr-coffee.jpg" alt="QR Code รับเงิน" class="w-full rounded-xl shadow-sm mb-4 border border-latte-200">
                <p class="font-bold text-latte-800 tracking-wide text-sm">พร้อมเพย์ / Make by KBank</p>
            </div>
        </div>
    </div>
"""

files_to_update = ['index.html', 'files.html', 'exams.html', 'resources.html', 'reviews.html', 'admin.html']

for filename in files_to_update:
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already added
        if 'coffeeModal' not in content:
            # We want to insert it before the closing </body> tag
            # Actually, right before `<script>` block at the bottom is safer, but replacing `</body>` works
            new_content = content.replace('</body>', f"{html_snippet}\n</body>")
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filename}")
        else:
            print(f"Already updated {filename}")

