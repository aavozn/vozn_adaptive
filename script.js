let allPoems = [];
let filteredPoems = [];
let currentIndex = 0;

const filters = {
    verse: 'all',
    complexity: 'all',
    topic: 'all'
};

async function loadData() {
    try {
        const [poemsRes, topicsRes] = await Promise.all([
            fetch('poems.json'),
            fetch('topics.json')
        ]);
        allPoems = await poemsRes.json();
        const topics = await topicsRes.json();

        const select = document.getElementById('topic-select');
        topics.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            select.appendChild(opt);
        });

        applyFilters();
    } catch (e) {
        document.getElementById('poem-card').innerHTML =
            '<div class="no-results"><strong>Ошибка загрузки данных.</strong><br>Проверьте, что poems.json и topics.json находятся рядом с index.html.</div>';
    }
}

function applyFilters() {
    filteredPoems = allPoems.filter(p => {
        if (filters.verse !== 'all' && p.verse !== filters.verse) return false;
        if (filters.complexity !== 'all' && p.complexity !== filters.complexity) return false;
        if (filters.topic !== 'all' && p.topic !== filters.topic) return false;
        return true;
    });

    currentIndex = filteredPoems.length > 0 ? 0 : -1;
    render();
}

function render() {
    const card = document.getElementById('poem-card');
    const counter = document.getElementById('counter');

    if (filteredPoems.length === 0) {
        card.innerHTML = `
            <div class="no-results">
                <strong>Нет стихотворений, соответствующих выбранным критериям.</strong><br>
                Измените настройки фильтра.
            </div>`;
        counter.textContent = 'показано: 0';
        return;
    }

    const poem = filteredPoems[currentIndex];
    const verseLabel = poem.verse === 'classic' ? 'классический' : 'неклассический';
    const compLabel = poem.complexity === 'simple' ? 'простой' : 'сложный';
    const titleText = !poem.title || poem.title === 'Без названия' ? '...' : poem.title;

    card.innerHTML = `
        <div class="poem-header">
            <h2 class="poem-title">${escapeHtml(titleText)}</h2>
            <div class="poem-tags">
                <span>стих: ${verseLabel}</span>
                <span>сложность: ${compLabel}</span>
                <span>тема: ${poem.topic}</span>
            </div>
        </div>
        <div class="poem-text">${escapeHtml(poem.text)}</div>`;

    counter.textContent = `показано: ${currentIndex + 1} (из ${filteredPoems.length})`;
}

function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function showRandom() {
    if (filteredPoems.length === 0) return;
    currentIndex = Math.floor(Math.random() * filteredPoems.length);
    render();
}

function showPrev() {
    if (filteredPoems.length === 0) return;
    currentIndex = (currentIndex - 1 + filteredPoems.length) % filteredPoems.length;
    render();
}

function showNext() {
    if (filteredPoems.length === 0) return;
    currentIndex = (currentIndex + 1) % filteredPoems.length;
    render();
}

function resetFilters() {
    filters.verse = 'all';
    filters.complexity = 'all';
    filters.topic = 'all';

    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('topic-select').value = 'all';

    applyFilters();
}

// Обработчики
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const group = btn.dataset.filter;
        const value = btn.dataset.value;

        if (btn.classList.contains('active')) {
            btn.classList.remove('active');
            filters[group] = 'all';
            applyFilters();
            return;
        }

        document.querySelectorAll(`[data-filter="${group}"]`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filters[group] = value;
        applyFilters();
    });
});

document.getElementById('topic-select').addEventListener('change', e => {
    filters.topic = e.target.value;
    applyFilters();
});

document.getElementById('btn-reset').addEventListener('click', resetFilters);
document.getElementById('btn-random').addEventListener('click', showRandom);
document.getElementById('random-link').addEventListener('click', e => { e.preventDefault(); showRandom(); });
document.getElementById('btn-prev').addEventListener('click', showPrev);
document.getElementById('btn-next').addEventListener('click', showNext);

// Клавиатура
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
});

loadData();