export function addChatListeners(html) {
    html.addEventListener("click", ev => {
        if (ev.target.closest(".collapsable")) {
            _collapsableToggle(ev);
        }
    });
}

function _collapsableToggle(ev) {
    const li = ev.target.closest(".collapsable").nextElementSibling;
    if (li) {
        li.style.display = li.style.display === "none" ? "block" : "none";
    }
}