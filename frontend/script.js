const cardVaultForm = document.getElementById('card-vault-form');
const savedCardList = document.getElementById('saved-card-list');
const savedCardCount = document.getElementById('saved-card-count');
const clearCardsButton = document.getElementById('clear-cards-button');
const cardSyncToggle = document.getElementById('card-sync-toggle');
const cardSyncShell = document.getElementById('card-sync-shell');
const cardApiBase = '/api/card-profiles';

function setSyncEnabled(enabled) {
    localStorage.setItem('offerbridge.cardSyncEnabled', enabled ? 'true' : 'false');

    if (enabled) {
        cardSyncShell.classList.add('is-visible');
    } else {
        cardSyncShell.classList.remove('is-visible');
    }

    if (enabled) {
        loadSavedCards();
    }
}

async function loadSavedCards() {
    if (!cardSyncToggle.checked) {
        savedCardCount.textContent = 'optional';
        savedCardList.innerHTML = '<div class="empty-state">Card syncing is off. Turn it on only if you want to store card profiles.</div>';
        return;
    }

    savedCardCount.textContent = 'loading';

    try {
        const response = await fetch(cardApiBase, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load saved cards');
        }

        const cards = await response.json();
        renderSavedCards(cards);
    } catch (error) {
        savedCardCount.textContent = 'offline';
        savedCardList.innerHTML = '<div class="empty-state">Could not reach the Spring Boot backend. Start it or adjust the API URL.</div>';
    }
}

function renderSavedCards(cards) {
    savedCardCount.textContent = `${cards.length} saved`;

    if (!cards.length) {
        savedCardList.innerHTML = '<div class="empty-state">No synced card profiles yet. Add one if you want this feature.</div>';
        return;
    }

    savedCardList.innerHTML = cards.map(card => `
        <div class="saved-card-item">
            <div class="saved-card-meta">
                <p class="text-white font-semibold">${card.nickname}</p>
                <p class="text-gray-400 text-sm">${card.bank} • ${card.network}</p>
                <p class="text-gray-500 text-sm">${card.holderName} • •••• ${card.last4} • Expires ${card.expiry}</p>
            </div>
            <div class="saved-card-actions">
                <button type="button" class="btn-secondary" data-remove-card="${card.id}">Remove</button>
            </div>
        </div>
    `).join('');
}

function normalizeLast4(value) {
    return value.replace(/\D/g, '').slice(0, 4);
}

async function deleteCardProfile(id) {
    const response = await fetch(`${cardApiBase}/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error('Failed to remove card profile');
    }
}

cardSyncToggle.addEventListener('change', function() {
    setSyncEnabled(cardSyncToggle.checked);
});

cardVaultForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(cardVaultForm);
    const nickname = formData.get('nickname').trim();
    const bank = formData.get('bank').trim();
    const holderName = formData.get('holderName').trim();
    const last4 = normalizeLast4(formData.get('last4').trim());
    const network = formData.get('network').trim();
    const expiry = formData.get('expiry');

    if (last4.length !== 4) {
        cardVaultForm.querySelector('[name="last4"]').style.borderColor = '#ff4444';
        return;
    }

    if (!cardSyncToggle.checked) {
        savedCardList.innerHTML = '<div class="empty-state">Turn on card profile sync to save this profile.</div>';
        return;
    }

    const response = await fetch(cardApiBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            nickname,
            bank,
            holderName,
            last4,
            network,
            expiry
        })
    });

    if (!response.ok) {
        savedCardList.innerHTML = '<div class="empty-state">The backend rejected the card profile. Check the Spring Boot API and try again.</div>';
        return;
    }

    cardVaultForm.reset();
    await loadSavedCards();
});

clearCardsButton.addEventListener('click', async function() {
    if (!cardSyncToggle.checked) {
        return;
    }

    const response = await fetch(cardApiBase, {
        method: 'DELETE'
    });

    if (response.ok) {
        await loadSavedCards();
    }
});

savedCardList.addEventListener('click', async function(event) {
    const removeButton = event.target.closest('[data-remove-card]');
    if (!removeButton) {
        return;
    }

    const id = Number(removeButton.getAttribute('data-remove-card'));
    try {
        await deleteCardProfile(id);
        await loadSavedCards();
    } catch (error) {
        savedCardList.innerHTML = '<div class="empty-state">Could not remove the saved card profile.</div>';
    }
});

const savedFeaturePref = localStorage.getItem('offerbridge.cardSyncEnabled') === 'true';
cardSyncToggle.checked = savedFeaturePref;
setSyncEnabled(savedFeaturePref);

document.querySelectorAll('input[type="email"]').forEach(input => {
    const button = input.nextElementSibling || input.closest('.waitlist-input-group').querySelector('button');
    if (button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (input.value && input.value.includes('@')) {
                const originalText = button.textContent;
                button.textContent = '✓ Email captured!';
                button.style.backgroundColor = 'rgba(0, 212, 170, 0.8)';

                setTimeout(() => {
                    input.value = '';
                    button.textContent = originalText;
                    button.style.backgroundColor = '';
                }, 2000);
            } else {
                input.style.borderColor = '#ff4444';
                setTimeout(() => {
                    input.style.borderColor = '';
                }, 2000);
            }
        });
    }
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.problem-card, .step-card, .feature-card').forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
});

loadSavedCards();