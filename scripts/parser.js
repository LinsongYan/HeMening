async function loadCultureContent() {
    try {
        // Since we are running locally (file://), we cannot use fetch().
        // We use a global variable 'window.CULTURE_DATA' loaded from culture_data.js
        if (typeof window.CULTURE_DATA !== 'string') {
            throw new Error("Data not found");
        }
        parseAndRender(window.CULTURE_DATA);
    } catch (e) {
        console.error("Failed to load content:", e);
        document.getElementById('content-area').innerHTML = `
            <div style="text-align:center; padding: 2rem; color: #aa0000;">
                <h3>无法加载内容</h3>
                <p>请确保 <code>Content/culture_data.js</code> 文件存在且未被损坏。</p>
            </div>
        `;
    }
}

function parseAndRender(fullText) {
    const mainContainer = document.getElementById('content-area');
    mainContainer.innerHTML = ''; // Clear loading state

    // Split by lines and process
    const lines = fullText.split('\n');
    let currentCategory = null;
    let currentTopic = null;
    let buffer = {};

    // Helper to flush current topic card
    const flushTopic = () => {
        if (!currentTopic || !currentCategory) return;

        // Render Card
        const cardHTML = buildCardHTML(currentTopic);

        // Find or Create Category Section
        let catSection = document.getElementById(`cat-${currentCategory.id}`);
        if (!catSection) {
            catSection = document.createElement('div');
            catSection.id = `cat-${currentCategory.id}`;
            catSection.innerHTML = `
                <h2 class="category-title"><span class="category-icon">${currentCategory.icon}</span> ${currentCategory.name}</h2>
                <div class="topic-grid" id="grid-${currentCategory.id}"></div>
            `;
            mainContainer.appendChild(catSection);
        }

        document.getElementById(`grid-${currentCategory.id}`).innerHTML += cardHTML;
        currentTopic = null;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // 1. Category Detection (e.g., "💼 工作篇 (Work)")
        // We look for lines containing "篇" and an open parenthesis for the English name
        if (line.includes('篇') && line.includes('(')) {
            // New category found
            flushTopic(); // Flush previous if exists

            // Extract icon (everything before the first space)
            // or if no space, just the first few chars.
            // Safe approach: split by space, first part is icon, rest is name
            const parts = line.split(' ');
            const icon = parts[0];
            const name = parts.slice(1).join(' '); // "工作篇 (Work)"

            // ID generation: "工作篇" -> "工作"
            const id = name.split('篇')[0] || 'other';

            currentCategory = { id: id, name: line.substring(icon.length).trim(), icon: icon };
            continue;
        }

        // 2. Topic Detection (e.g., "#04 越级沟通")
        if (line.startsWith('#')) {
            flushTopic();
            const [num, ...titleParts] = line.split(' ');
            currentTopic = {
                number: num,
                title: titleParts.join(' '),
                scenario: '',
                core: '',
                coreDesc: '',
                checkYes: '',
                checkNo: '',
                tip: ''
            };
            continue;
        }

        if (currentTopic) {
            // Parsing fields
            if (line.startsWith('场景：')) {
                currentTopic.scenario = line.replace('场景：', '').trim();
            } else if (line.startsWith('文化内核：')) {
                const content = line.replace('文化内核：', '').trim();
                // Try to split logic (Title. Description)
                const parts = content.split(/[。. ] (.+)/);
                currentTopic.core = parts[0];
                // If the description is on the same line
                if (content.includes('。')) {
                    currentTopic.coreDesc = content.substring(content.indexOf('。') + 1) || content;
                } else {
                    currentTopic.coreDesc = content; // Fallback
                }
            } else if (line.startsWith('✅ 文化差异：')) {
                currentTopic.checkYes = line.replace('✅ 文化差异：', '').trim();
            } else if (line.startsWith('❌ 涉嫌歧视：')) {
                currentTopic.checkNo = line.replace('❌ 涉嫌歧视：', '').trim();
            } else if (line.startsWith('一句话攻略：')) {
                currentTopic.tip = line.replace('一句话攻略：', '').trim();
            }
            // Handle multi-line descriptions (simple fallback)
            else if (!line.startsWith('如何辨别')) {
                // If it's just text, append to the last known field if needed, 
                // but for simplicity we assume the structure is fairly strict as per sample.
                // We'll specifically fix the "Core Concept" if it was split.
                if (currentTopic.core && !currentTopic.checkYes) {
                    if (currentTopic.coreDesc === currentTopic.core) currentTopic.coreDesc = line;
                    else currentTopic.coreDesc += line;
                }
            }
        }
    }
    // Flush last one
    flushTopic();
}

function buildCardHTML(topic) {
    return `
    <div class="culture-card">
        <div class="card-header">
            <h3 class="card-title">${topic.title}</h3>
            <span class="card-number">${topic.number}</span>
        </div>
        <div class="scenario-box">场景：${topic.scenario}</div>
        <div class="core-concept"><strong>💡 文化内核：${topic.core}</strong><br>${topic.coreDesc}</div>
        <div class="check-list">
            <div class="check-item"><span class="check-icon is-culture">✅</span><span>${topic.checkYes}</span></div>
            <div class="check-item"><span class="check-icon is-racism">❌</span><span>${topic.checkNo}</span></div>
        </div>
        <div class="pro-tip">${topic.tip}</div>
    </div>
    `;
}

// Init
document.addEventListener('DOMContentLoaded', loadCultureContent);
