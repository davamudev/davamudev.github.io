(function () {
    'use strict';

    var bootMsgs = [
        ['C:\\>ssh daniel@82.12.137.220', 'ok'],
        ["daniel@82.12.137.220's password:", 'dim'],
        [' ', ''],
        ['Welcome to Ubuntu 24.04.4 LTS (GNU/Linux 6.8.0-117-generic x86_64)', 'dim'],
        [' ', ''],
        [' * Documentation:  https://help.ubuntu.com', 'dim'],
        [' * Management:     https://landscape.canonical.com', 'dim'],
        [' * Support:        https://ubuntu.com/pro', 'dim'],
        [' ', ''],
        [' System information as of Sun Jul 12 06:08:35 PM UTC 2026', 'dim'],
        [' ', ''],
        ['  System load:  12.86               Temperature:             52.0 C', ''],
        ['  Usage of /:   18.8% of 914.78GB   Processes:                343', ''],
        ['  Memory usage: 42%                 Users logged in:          1', ''],
        ['  Swap usage:   5%                  IPv4 address for enp89s0: 82.12.137.220', ''],
        [' ', ''],
        [' * Strictly confined Kubernetes makes edge and IoT secure. Learn how MicroK8s just raised the bar for easy, resilient and secure K8s cluster deployment.', 'dim'],
        [' ', 'dim'],
        ['   https://ubuntu.com/engage/secure-kubernetes-at-the-edge', 'dim'],
        [' ', ''],
        ['Expanded Security Maintenance for Applications is not enabled.', 'dim'],
        [' ', ''],
        ['13 updates can be applied immediately.', 'warn'],
        ['To see these additional updates run: apt list --upgradable', 'dim'],
        [' ', ''],
        ['16 additional security updates can be applied with ESM Apps.', 'warn'],
        ['Learn more about enabling ESM Apps service at https://ubuntu.com/esm', 'dim'],
        [' ', ''],
        ['*** System restart required ***', 'warn'],
        ['Last login: Sat Jul 11 18:26:23 2026 from 82.12.137.220', 'dim'],
    ];

    (function() {
        var now = new Date();
        var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var d = days[now.getDay()];
        var m = months[now.getMonth()];
        var dd = String(now.getDate()).padStart(2,'0');
        var hh = String(now.getHours() % 12 || 12).padStart(2,'0');
        var mm = String(now.getMinutes()).padStart(2,'0');
        var ss = String(now.getSeconds()).padStart(2,'0');
        var ap = now.getHours() >= 12 ? 'PM' : 'AM';
        bootMsgs[9][0] = ' System information as of ' + d + ' ' + m + ' ' + dd + ' ' + hh + ':' + mm + ':' + ss + ' ' + ap + ' CEST ' + now.getFullYear();
        var ago = 6 + Math.floor(Math.random() * 48);
        var last = new Date(now.getTime() - ago * 60 * 60 * 1000);
        var ld = days[last.getDay()];
        var lm = months[last.getMonth()];
        var ldd = String(last.getDate()).padStart(2,'0');
        var lh = String(last.getHours() % 12 || 12).padStart(2,'0');
        var lmin = String(last.getMinutes()).padStart(2,'0');
        var ls = String(last.getSeconds()).padStart(2,'0');
        var lap = last.getHours() >= 12 ? 'PM' : 'AM';
        bootMsgs[bootMsgs.length - 1][0] = 'Last login: ' + ld + ' ' + lm + ' ' + ldd + ' ' + lh + ':' + lmin + ':' + ls + ' ' + lap + ' ' + last.getFullYear() + ' from 82.12.137.220';
    })();

    let audioCtx = null;
    var audioResumed = false;

    function initAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            function resume() {
                if (audioCtx && audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
            }
            document.addEventListener('click', resume, { once: true });
            document.addEventListener('keydown', resume, { once: true });
            document.addEventListener('touchstart', resume, { once: true });
        } catch (e) {
            audioCtx = null;
        }
    }

    function playTone(freq, dur, type, vol) {
        if (!audioCtx) return;
        if (!audioResumed && audioCtx.state === 'suspended') {
            audioCtx.resume();
            audioResumed = true;
        }
        try {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = type || 'sine';
            osc.frequency.value = freq;
            gain.gain.value = vol || 0.08;
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (dur || 100) / 1000);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + (dur || 100) / 1000);
        } catch (e) {}
    }

    function playClick() { playTone(900, 20, 'square', 0.04); }
    function playBoot() { playTone(440, 150, 'sine', 0.1); }
    function playBeep() { playTone(660, 80, 'sine', 0.06); }

    var bootEl = document.getElementById('boot');
    var bootContent = document.getElementById('bootContent');
    var terminal = document.getElementById('terminal');
    var termPrompt = document.querySelector('.term-prompt');
    var paletteTrigger = document.querySelector('.palette-trigger');
    var paletteMenu = document.querySelector('.palette-menu');

    function bootSequence() {
        var i = 0;
        terminal.style.display = 'none';

        var pressAnyKey = document.createElement('div');
        pressAnyKey.className = 'boot-line';
        pressAnyKey.innerHTML = '<span class="warn">Press any key to boot...</span>';
        bootContent.appendChild(pressAnyKey);

        function startBoot() {
            bootContent.innerHTML = '';
            initAudio();
            nextLine();
        }

        function onInteraction() {
            document.removeEventListener('click', onInteraction);
            document.removeEventListener('keydown', onInteraction);
            document.removeEventListener('touchstart', onInteraction);
            startBoot();
        }

        document.addEventListener('click', onInteraction);
        document.addEventListener('keydown', onInteraction);
        document.addEventListener('touchstart', onInteraction);

        function nextLine() {
            if (i >= bootMsgs.length) {
                setTimeout(function () {
                    bootEl.classList.add('fade-out');
                    setTimeout(function () {
                        bootEl.style.display = 'none';
                        terminal.style.display = 'block';
                        setTimeout(startTypingCmds, 400);
                    }, 800);
                }, 500);
                return;
            }

            var msg = bootMsgs[i];
            var line = document.createElement('div');
            line.className = 'boot-line';
            var span = document.createElement('span');
            if (msg[1] === 'ok') span.className = 'ok';
            else if (msg[1] === 'dim') span.className = 'dim';
            else if (msg[1] === 'err') span.className = 'err';
            else if (msg[1] === 'warn') span.className = 'warn';
            span.textContent = msg[0];
            line.appendChild(span);
            bootContent.appendChild(line);

            if (msg[0]) {
                playBoot();
                setTimeout(function () {
                    playClick();
                }, 50);
            }

            i++;
            var delay = msg[0] ? 100 + Math.random() * 150 : 200;
            setTimeout(nextLine, delay);
        }
    }

    function typeCmd(el, callback) {
        var text = el.getAttribute('data-text') || el.textContent;
        el.textContent = '';
        el.classList.remove('done');
        var i = 0;

        function type() {
            if (i < text.length) {
                el.textContent += text.charAt(i);
                playClick();
                i++;
                setTimeout(type, 25 + Math.random() * 20);
            } else {
                el.classList.add('done');
                if (callback) callback();
            }
        }

        type();
    }

    function startTypingCmds() {
        var sections = Array.prototype.slice.call(document.querySelectorAll('.section'));
        var idx = 0;
        var firstSection = true;

        function observeNext() {
            if (idx >= sections.length) {
                if (termPrompt) termPrompt.classList.add('show');
                return;
            }
            var section = sections[idx];
            section.classList.add('active');
            var observer = new IntersectionObserver(function (entries) {
                var entry = entries[0];
                if (!entry.isIntersecting) return;
                var cmd = section.querySelector('.cmd');
                var output = section.querySelector('.output');
                if (!cmd || cmd.classList.contains('done')) {
                    idx++;
                    observeNext();
                    return;
                }
                typeCmd(cmd, function () {
                    if (output) output.classList.add('visible');
                    if (firstSection) { firstSection = false; playBeep(); }
                    observer.unobserve(section);
                    idx++;
                    observeNext();
                });
            }, { threshold: 0 });
            observer.observe(section);
        }

        observeNext();
    }

    function calcAge() {
        var now = new Date();
        var age = now.getFullYear() - 1998;
        if (now.getMonth() < 6) age--;
        return age;
    }

    function calcExp() {
        var years = new Date().getFullYear() - 2021;
        return (years > 0 ? years : 0) + '+ Years';
    }

    window.addEventListener('load', function () {
        var ageEl = document.getElementById('ageDisplay');
        var expEl = document.getElementById('expDisplay');
        var yearEl = document.getElementById('copyrightYear');
        if (ageEl) ageEl.textContent = calcAge();
        if (expEl) expEl.textContent = calcExp();
        if (yearEl) yearEl.textContent = new Date().getFullYear();
        bootSequence();
    });

    if (paletteTrigger) {
        paletteTrigger.addEventListener('click', function (e) {
            e.stopPropagation();
            paletteMenu.classList.toggle('open');
        });
        document.addEventListener('click', function () {
            paletteMenu.classList.remove('open');
        });
        paletteMenu.addEventListener('click', function (e) {
            paletteMenu.classList.remove('open');
        });
    }

    window.help = function () {
        var cmds = [
            'whoami                       — About me',
            'cat about.md                — Read my bio',
            'neofetch                    — Skills overview',
            'tail -f experience.log      — Work & education',
            'ls -la /projects/           — My projects',
            'systemctl status services   — Services offered',
            'cat /etc/testimonials       — Client reviews',
            'mail -s hello dani          — Contact info',
            'uptime                      — System status',
            'matrix                      — 🫠',
            'help                        — This message'
        ];
        console.log('%c╔════════════════════════════════════════╗', 'color: #00ff41');
        console.log('%c║   dani@portfolio — Available Commands  ║', 'color: #00ffff');
        console.log('%c╚════════════════════════════════════════╝', 'color: #00ff41');
        cmds.forEach(function (c) {
            console.log('%c  ' + c, 'color: #00ff41');
        });
    };

    window.matrix = function () {
        var c = document.createElement('canvas');
        c.style.position = 'fixed';
        c.style.inset = '0';
        c.style.zIndex = '9998';
        c.style.pointerEvents = 'none';
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        document.body.appendChild(c);
        var ctx = c.getContext('2d');
        var cols = Math.floor(c.width / 14);
        var drops = [];
        for (var i = 0; i < cols; i++) drops[i] = 1;
        var chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01';

        function draw() {
            ctx.fillStyle = 'rgba(10, 14, 10, 0.05)';
            ctx.fillRect(0, 0, c.width, c.height);
            ctx.fillStyle = '#00ff41';
            ctx.font = '14px monospace';
            for (var i = 0; i < drops.length; i++) {
                var text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * 14, drops[i] * 14);
                if (drops[i] * 14 > c.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }

        var interval = setInterval(draw, 50);
        setTimeout(function () {
            clearInterval(interval);
            c.style.opacity = '0';
            c.style.transition = 'opacity 1s';
            setTimeout(function () { c.remove(); }, 1000);
        }, 5000);
        console.log('%c 🫠 ', 'color: #00ff41; font-size: 24px;');
    };

    console.log('%c╔════════════════════════════════════════╗', 'color: #00ff41');
    console.log('%c║   dani@portfolio — Terminal Portfolio  ║', 'color: #00ffff');
    console.log('%c╚════════════════════════════════════════╝', 'color: #00ff41');
    console.log('%cType help() to see available commands', 'color: #005c1a');
    console.log('%cType matrix() for a surprise', 'color: #003300');
})();
