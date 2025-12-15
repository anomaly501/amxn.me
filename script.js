document.addEventListener('DOMContentLoaded', () => {
    // Icons
    const icons = {
        recovered: document.getElementById('icon-recovered'),
        projects: document.getElementById('icon-projects'),
        about: document.getElementById('icon-about'),
        skills: document.getElementById('icon-skills'),
        contact: document.getElementById('icon-contact')
    };

    // Content Sections - mapped by icon ID suffix
    const sections = {
        recovered: document.getElementById('content-recovered'),
        projects: document.getElementById('content-projects'),
        about: document.getElementById('content-about'),
        skills: document.getElementById('content-skills'),
        contact: document.getElementById('content-contact')
    };

    // Navigation Logic
    Object.keys(icons).forEach(key => {
        icons[key].addEventListener('click', () => {
            // Remove active class from all icons
            Object.values(icons).forEach(icon => icon.classList.remove('active'));
            // Add active class to clicked icon
            icons[key].classList.add('active');

            // Hide all sections
            Object.values(sections).forEach(section => {
                if (section) {
                    section.classList.remove('active');
                    section.style.display = 'none';
                }
            });

            // Show target section
            if (sections[key]) {
                sections[key].style.display = 'block';
                // Trigger reflow to restart animation
                void sections[key].offsetWidth;
                sections[key].classList.add('active');
            }

            // [FIX] Ensure Window is visible and Taskbar is updated
            if (missionWindow) {
                missionWindow.style.display = 'flex';
                // Reset minimized state if accessible keys are in scope (captured by closure)
                isMinimized = false;
            }
            if (taskItem) {
                taskItem.classList.add('active');
                taskItem.style.opacity = '1';
            }
        });
    });
    // Typing Effect
    const bioText = document.getElementById('bio-text');
    if (bioText) {
        const originalText = bioText.innerHTML;
        bioText.innerHTML = '';

        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                bioText.innerHTML += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 10 + Math.random() * 20);
            }
        };
        setTimeout(typeWriter, 1000);
    }

    // WINDOW CONTROLS
    const missionWindow = document.querySelector('.mission-window');
    const taskItem = document.getElementById('task-portfolio');
    const btnMinimize = document.getElementById('btn-minimize');
    const btnMaximize = document.getElementById('btn-maximize');
    const btnClose = document.getElementById('btn-close');

    // Store original state
    let isFullscreen = false;
    let isMinimized = false;

    // Minimize
    if (btnMinimize) {
        btnMinimize.addEventListener('click', () => {
            isMinimized = true;
            missionWindow.style.display = 'none';
            if (taskItem) {
                taskItem.classList.remove('active');
                taskItem.style.opacity = '0.5';
            }
        });
    }

    // Taskbar Item Click (Restore)
    if (taskItem) {
        taskItem.addEventListener('click', () => {
            if (isMinimized) {
                isMinimized = false;
                missionWindow.style.display = 'flex';
                taskItem.classList.add('active');
                taskItem.style.opacity = '1';
            }
        });
    }

    // Maximize
    if (btnMaximize) {
        btnMaximize.addEventListener('click', () => {
            isFullscreen = !isFullscreen;
            if (isFullscreen) {
                missionWindow.classList.add('fullscreen');
                btnMaximize.textContent = '❐';
            } else {
                missionWindow.classList.remove('fullscreen');
                btnMaximize.textContent = '□';
            }
        });
    }

    // Close
    if (btnClose) {
        btnClose.addEventListener('click', () => {
            isMinimized = true;
            missionWindow.style.display = 'none';
            if (taskItem) taskItem.classList.remove('active');
        });
    }

    // CLOCK
    const updateClock = () => {
        const now = new Date();
        const clockEl = document.getElementById('clock');
        if (clockEl) {
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            clockEl.textContent = `${hours}:${minutes}:${seconds}`;
        }
    };
    setInterval(updateClock, 1000);
    updateClock();

    // DRAG FUNCTIONALITY
    const makeDraggable = (element, handle) => {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        const dragMouseDown = (e) => {
            e = e || window.event;
            // Allow clicking controls without dragging
            if (e.target.classList.contains('control-box')) return;

            e.preventDefault();
            // Get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;

            // Bring to front
            element.style.zIndex = 100;
            if (element.classList.contains('mission-window')) {
                element.style.zIndex = 105;
            }

            // Freeze position before dragging to prevent jumps
            const style = window.getComputedStyle(element);
            if (style.position !== 'absolute' && style.position !== 'fixed') {
                const rect = element.getBoundingClientRect();

                // Create placeholder to prevent layout collapse
                const placeholder = document.createElement('div');
                placeholder.style.width = rect.width + 'px';
                placeholder.style.height = rect.height + 'px';
                placeholder.style.margin = style.margin;
                placeholder.style.flexShrink = '0';
                placeholder.className = 'icon-placeholder'; // Class for potential future styling

                // Insert placeholder
                element.parentNode.insertBefore(placeholder, element);

                // Calculate position
                const offsetParent = element.offsetParent || document.body;
                const parentRect = offsetParent.getBoundingClientRect();
                const left = rect.left - parentRect.left;
                const top = rect.top - parentRect.top;

                element.style.width = rect.width + 'px';
                element.style.height = rect.height + 'px';
                element.style.position = 'absolute';
                element.style.left = left + 'px';
                element.style.top = top + 'px';
                element.style.margin = '0';
            }
        };

        const elementDrag = (e) => {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        };

        const closeDragElement = () => {
            document.onmouseup = null;
            document.onmousemove = null;
        };

        if (handle) {
            handle.onmousedown = dragMouseDown;
        } else {
            element.onmousedown = dragMouseDown;
        }
    };

    const windowHeader = document.querySelector('.window-header');
    if (missionWindow && windowHeader) {
        makeDraggable(missionWindow, windowHeader);
    }

    // Apply Dragging to Icons
    console.log('Initializing Icon Dragging');
    Object.values(icons).forEach(icon => {
        if (icon) {
            console.log('Making draggable:', icon.id);
            makeDraggable(icon);

            // Prevent drag from triggering click immediately (simple check)
            let startX, startY;
            icon.addEventListener('mousedown', (e) => {
                startX = e.clientX;
                startY = e.clientY;
            });
            icon.addEventListener('click', (e) => {
                if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
                    // It was a drag, not a click
                    e.stopImmediatePropagation();
                    e.preventDefault();
                }
            }, true); // Capture phase to intervene before other listeners
        }
    });
});
