function speak(text, lang = 'nl-NL') {
    if (!window.speechSynthesis) {
        alert("您的浏览器不支持语音播放功能。");
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
}

// Add event listeners to all audio buttons
document.addEventListener('DOMContentLoaded', () => {
    const audioBtns = document.querySelectorAll('.play-audio-btn');
    audioBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = btn.getAttribute('data-text');
            if (text) {
                speak(text);

                // Visual feedback
                const originalIcon = btn.innerHTML;
                btn.innerHTML = "🔊 播放中...";
                btn.classList.add('playing');
                setTimeout(() => {
                    btn.innerHTML = originalIcon;
                    btn.classList.remove('playing');
                }, 2000);
            }
        });
    });
});
