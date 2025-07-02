export function addChatListeners(html) {
    html.addEventListener("click", ev => {
        if (ev.target.closest(".collapsable")) {
            _collapsableToggle(ev);
        }

        const itemRow = ev.target.closest('.item-row');

        // Make sure the click was inside this specific .chat-card
        if (itemRow && html.contains(itemRow)) {
            // Get the next sibling element — should be .item-description
            const description = itemRow.nextElementSibling;

            if (description && description.classList.contains('item-description')) {
                // Toggle visibility
                description.style.display =
                    (description.style.display || 'none') === 'none' ? 'block' : 'none';
            }
        }
    });

    
}

function _collapsableToggle(ev) {
    const li = ev.target.closest(".collapsable").nextElementSibling;
    if (li) {
        li.style.display = li.style.display === "none" ? "block" : "none";
    }
}