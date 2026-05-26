let currentImageData = ""; 

// --- Typing Effect Logic ---
const texts = [
    "Generate high-definition cinematic imagery.",
    "Transform your imagination into pixels.",
    "Create photorealistic art in seconds."
];
let textIndex = 0;
let charIndex = 0;
const speed = 50; 
const pause = 2000; 

function typeWriter() {
    if (charIndex < texts[textIndex].length) {
        document.getElementById("typewriter").innerHTML += texts[textIndex].charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, speed);
    } else {
        setTimeout(eraseText, pause);
    }
}

function eraseText() {
    if (charIndex > 0) {
        let currentText = texts[textIndex].substring(0, charIndex - 1);
        document.getElementById("typewriter").innerHTML = currentText;
        charIndex--;
        setTimeout(eraseText, speed / 2);
    } else {
        textIndex = (textIndex + 1) % texts.length;
        setTimeout(typeWriter, speed);
    }
}

// Start everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    typeWriter();
    loadDrafts();
});

// --- Generator Logic ---
async function generateImage() {
    const prompt = document.getElementById('prompt').value;
    const loader = document.getElementById('loader');
    const img = document.getElementById('result');
    const actionButtons = document.getElementById('action-buttons');
    
    if (!prompt) return alert('Please enter a prompt');
    
    loader.style.display = 'flex';
    img.style.display = 'none';
    actionButtons.style.display = 'none';

    try {
        const response = await fetch('http://127.0.0.1:5001/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();
        
        if (data.image) {
            currentImageData = "data:image/png;base64," + data.image;
            img.src = currentImageData;
            img.style.display = 'block';
            actionButtons.style.display = 'flex'; 
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Backend connection failed. Is your Python server running?');
    } finally {
        loader.style.display = 'none';
    }
}

function downloadImage() {
    if (!currentImageData) return;
    const link = document.createElement('a');
    link.href = currentImageData;
    link.download = `DreamScape_${Date.now()}.png`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function saveDraft() {
    if (!currentImageData) return;
    
    const promptText = document.getElementById('prompt').value;
    const draft = {
        prompt: promptText,
        image: currentImageData,
        date: new Date().toLocaleDateString() // Kept it clean, just the date
    };

    let drafts = JSON.parse(localStorage.getItem('ai_image_drafts')) || [];
    drafts.push(draft);
    localStorage.setItem('ai_image_drafts', JSON.stringify(drafts));
    
    // Change icon temporarily to show success
    const saveBtn = document.querySelector('[data-tooltip="Save to Gallery"] i');
    saveBtn.className = 'fa-solid fa-check';
    setTimeout(() => { saveBtn.className = 'fa-solid fa-bookmark'; }, 1500);
    
    loadDrafts(); 
}

// --- Gallery Logic ---
function loadDrafts() {
    const drafts = JSON.parse(localStorage.getItem('ai_image_drafts')) || [];
    const draftsSection = document.getElementById('drafts-section');
    const draftsGrid = document.getElementById('drafts-grid');
    const countSpan = document.getElementById('draft-count');
    
    if (drafts.length === 0) {
        draftsSection.style.display = 'none';
        return;
    }

    draftsSection.style.display = 'block';
    draftsGrid.innerHTML = ''; 
    countSpan.textContent = `${drafts.length} item${drafts.length !== 1 ? 's' : ''}`;

    for (let i = drafts.length - 1; i >= 0; i--) {
        const draft = drafts[i];
        const card = document.createElement('div');
        card.className = 'draft-card';
        
        // Ensure long prompts don't break the card design
        const truncatedPrompt = draft.prompt.length > 80 
            ? draft.prompt.substring(0, 80) + '...' 
            : draft.prompt;
        
        card.innerHTML = `
            <img src="${draft.image}" alt="Draft Image">
            <p class="draft-prompt" title="${draft.prompt}">"${truncatedPrompt}"</p>
            <div class="draft-meta">
                <span class="draft-date"><i class="fa-regular fa-clock"></i> ${draft.date}</span>
                <button onclick="deleteDraft(${i})" class="delete-btn" title="Delete">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        
        draftsGrid.appendChild(card);
    }
}

function deleteDraft(index) {
    if(confirm("Delete this masterpiece?")) {
        let drafts = JSON.parse(localStorage.getItem('ai_image_drafts')) || [];
        drafts.splice(index, 1); 
        localStorage.setItem('ai_image_drafts', JSON.stringify(drafts));
        loadDrafts(); 
    }
}