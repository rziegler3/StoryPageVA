let controller;

export function stopWatching() {
    controller?.abort();
    controller = undefined;
}

export function watch(reference) {
    stopWatching();
    controller = new AbortController();
    const options = { passive: true, signal: controller.signal };
    let pending = false;
    let touchY;
    let previousScrollY = window.scrollY;

    function setDetailVisible(visible) {
        if (pending || visible === !!document.getElementById("full-story")) return;
        pending = true;
        reference.invokeMethodAsync(visible ? "ShowDetail" : "HideDetail")
            .catch(error => console.error("Unable to update story detail visibility.", error))
            .finally(() => { pending = false; });
    }

    function canScrollWithin(target) {
        for (let element = target instanceof Element ? target : null; element; element = element.parentElement) {
            const overflow = getComputedStyle(element).overflowY;
            if (["auto", "scroll"].includes(overflow) &&
                element.scrollTop + element.clientHeight < element.scrollHeight - 1) {
                return true;
            }
        }
        return false;
    }

    window.addEventListener("wheel", event => {
        if (event.ctrlKey) return;
        if (event.deltaY > 0 && !canScrollWithin(event.target)) setDetailVisible(true);
        if (event.deltaY < 0 && window.scrollY <= 0) setDetailVisible(false);
    }, options);

    window.addEventListener("scroll", () => {
        if (window.scrollY <= 0 && previousScrollY > 0) setDetailVisible(false);
        previousScrollY = window.scrollY;
    }, options);

    window.addEventListener("touchstart", event => {
        touchY = event.touches.length === 1 ? event.touches[0].clientY : undefined;
    }, options);

    window.addEventListener("touchmove", event => {
        if (touchY !== undefined && event.touches.length === 1 &&
            touchY - event.touches[0].clientY > 20 && !canScrollWithin(event.target)) {
            setDetailVisible(true);
        }
        if (touchY !== undefined && event.touches.length === 1 &&
            event.touches[0].clientY - touchY > 20 && window.scrollY <= 0) {
            setDetailVisible(false);
        }
    }, options);

    window.addEventListener("keydown", event => {
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
            event.target instanceof Element &&
            event.target.closest("input, textarea, select, button, a, [contenteditable]")) return;
        if (["ArrowDown", "PageDown", "End", " "].includes(event.key) &&
            !canScrollWithin(event.target)) setDetailVisible(true);
        if (["ArrowUp", "PageUp", "Home"].includes(event.key) &&
            window.scrollY <= 0) setDetailVisible(false);
    }, { signal: controller.signal });
}
