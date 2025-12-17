document.addEventListener('DOMContentLoaded', () => {
    // Boot Sequence
    const preloader = document.getElementById('preloader');
    const bootLog = document.getElementById('boot-log');

    if (preloader && bootLog) {
        const bootText = [
            "INITIALIZING KERNEL...",
            "LOADING DRIVERS: [ OK ]",
            "CHECKING MEMORY: 64KB OK",
            "MOUNTING FILESYSTEM...",
            "ACCESSING RESTRICTED DATA...",
            "DECRYPTING USER PROFILE: AMAN KUMAR",
            "SYSTEM READY."
        ];

        const MIN_LOAD_TIME = 4000; // 4 seconds
        const startTime = Date.now();
        let lineIndex = 0;

        const typeLine = () => {
            if (lineIndex < bootText.length) {
                const line = document.createElement('div');
                line.textContent = "> " + bootText[lineIndex];
                bootLog.appendChild(line);
                lineIndex++;
                // Random delay between lines for realism
                setTimeout(typeLine, 100 + Math.random() * 400);
            } else {
                // Sequence finished, check time
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, MIN_LOAD_TIME - elapsedTime);

                setTimeout(() => {
                    preloader.classList.add('fade-out');
                    // Completely remove after transition
                    setTimeout(() => {
                        preloader.style.display = 'none';
                        startBioTyping();
                    }, 500);
                }, remainingTime);
            }
        };

        // Start boot sequence
        typeLine();
    } else {
        // If no preloader, start bio typing immediately
        startBioTyping();
    }

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
    function startBioTyping() {
        const bioText = document.getElementById('bio-text');
        // Check if already typed or doesn't exist
        if (!bioText || bioText.getAttribute('data-typed') === 'true') return;

        const originalText = bioText.innerHTML;
        bioText.innerHTML = '';
        bioText.setAttribute('data-typed', 'true');

        // Split by HTML tags
        // This regex splits string into parts: text, tag, text, tag...
        // e.g. "Hello <br> World" -> ["Hello ", "<br>", " World"]
        const parts = originalText.split(/(<[^>]*>)/);

        let partIndex = 0;
        let charIndex = 0;

        const typeWriter = () => {
            if (partIndex < parts.length) {
                const part = parts[partIndex];

                if (part.startsWith('<')) {
                    // It's a tag, append completely and move to next part
                    bioText.innerHTML += part;
                    partIndex++;
                    setTimeout(typeWriter, 10);
                } else {
                    // It's text, type chars
                    if (charIndex < part.length) {
                        bioText.innerHTML += part.charAt(charIndex);
                        charIndex++;
                        setTimeout(typeWriter, 10 + Math.random() * 20);
                    } else {
                        // Finished this text part, move to next
                        partIndex++;
                        charIndex = 0;
                        setTimeout(typeWriter, 10);
                    }
                }
            }
        };
        setTimeout(typeWriter, 100);
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
