const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');

// Chat State Machine
let currentState = 'INIT'; // INIT, SCENARIO_SELECTED, DESCRIBING, ANALYZING, END
let userScenario = '';

// Initial Message
window.onload = () => {
    setTimeout(() => {
        addBotMessage("您好，我是荷鸣 AI 助手。我可以帮您分析您遇到的情况是否属于歧视，并提供建议。");
        setTimeout(() => {
            addBotMessage("请告诉我，这件事发生在哪里？", [
                "职场 / 公司",
                "学校 / 校园",
                "公共交通 / 街道",
                "租房 / 邻里",
                "商店 / 餐厅"
            ]);
        }, 800);
    }, 500);
};

// Event Listeners
sendBtn.addEventListener('click', handleUserMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserMessage();
});

function handleUserMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addUserMessage(text);
    userInput.value = '';

    // Simulate AI thinking
    showTyping();

    // Core Logic Flow
    setTimeout(() => {
        hideTyping();
        processResponse(text);
    }, 1500);
}

function processResponse(text) {
    if (currentState === 'INIT') {
        // Fallback if they didn't click a button but typed "Work"
        userScenario = text; 
        currentState = 'DESCRIBING';
        addBotMessage(`明白了。在【${text}】发生的事件往往比较复杂。请简单描述一下发生了什么？\n\n例如：“同事叫我...”，“老板说...”`);
    } else if (currentState === 'DESCRIBING') {
        currentState = 'ANALYZING';
        // Mock Analysis
        addBotMessage("正在分析语义和荷兰法律背景...", null, true); // true for 'system' style or just text
        
        setTimeout(() => {
            generateAnalysisReport(text);
        }, 2000);
    }
}

function generateAnalysisReport(description) {
    currentState = 'END';
    
    // Heuristic Keyword Matching (Simple Mock)
    const lowerDesc = description.toLowerCase();
    let isSevere = lowerDesc.includes("滚") || lowerDesc.includes("cancer") || lowerDesc.includes("kanker") || lowerDesc.includes("go back");
    let isMicro = lowerDesc.includes("where are you from") || lowerDesc.includes("ni hao") || lowerDesc.includes("sambal");

    if (isSevere) {
        addBotMessage(`⚠️ **评估结果：高风险 (High Risk)**\n\n这段经历不仅涉及种族歧视，甚至可能构成【仇恨言论】或【骚扰】。\n\n根据荷兰法律，这是不可接受的。`);
        addBotMessage("建议行动：\n1. 立即保存证据（录音、邮件）。\n2. 您可以向 discriminatie.nl 匿名举报。\n3. 如感到威胁，请联系警方 (0900-8844)。");
    } else if (isMicro) {
        addBotMessage(`ℹ️ **评估结果：微侵犯 (Microaggression)**\n\n这属于隐性歧视。对方可能辩解是“玩笑”，但这对您造成了冒犯。\n\n文化背景：荷兰人以“直接”著称，但常常缺乏界限感。`);
        addBotMessage("建议应对：\n使用严肃的反问句阻断对话。例如：“Why is that funny?” (这哪里好笑？)");
    } else {
        addBotMessage(`📋 **评估结果：需要更多信息**\n\n这听起来确实令人不适。根据目前的描述，这可能源于文化误解或职场霸凌，也可能含有隐性偏见。`);
        addBotMessage("建议：\n您可以尝试记录下来，并咨询我们的【反击百科】查看类似案例。");
    }

    // Call to Action
    setTimeout(() => {
        addBotMessage("您需要查看具体的法律投诉渠道吗？", ["查看法律指南", "结束对话"]);
    }, 1000);
}

// Option Button Click Handler
window.handleOptionClick = function(optionText) {
    if (currentState === 'END') {
        if (optionText.includes("法律")) {
             window.location.href = 'legal.html';
        } else {
             addBotMessage("好的，希望这些建议对您有帮助。加油！💪");
        }
        return;
    }

    addUserMessage(optionText);
    userScenario = optionText;
    currentState = 'DESCRIBING';
    
    showTyping();
    setTimeout(() => {
        hideTyping();
        addBotMessage(`明白了。在【${optionText}】发生的事件往往比较复杂。请简单描述一下发生了什么？`);
    }, 1000);
}

// UI Helpers
function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'message user';
    div.textContent = text;
    chatMessages.appendChild(div);
    scrollToBottom();
}

function addBotMessage(text, options = null) {
    const div = document.createElement('div');
    div.className = 'message bot';
    
    // Convert newlines to breaks for formatting
    div.innerHTML = text.replace(/\n/g, '<br>');

    if (options) {
        const optionsDiv = document.createElement('div');
        optionsDiv.style.marginTop = "10px";
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => window.handleOptionClick(opt);
            optionsDiv.appendChild(btn);
        });
        div.appendChild(optionsDiv);
    }

    chatMessages.appendChild(div);
    scrollToBottom();
}

function showTyping() {
    typingIndicator.style.display = 'flex';
    chatMessages.appendChild(typingIndicator);
    scrollToBottom();
}

function hideTyping() {
    typingIndicator.style.display = 'none';
    if (typingIndicator.parentNode === chatMessages) {
        chatMessages.removeChild(typingIndicator);
    }
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
