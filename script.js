(function () {
    'use strict';

    var root = document.documentElement;

    function calcAge() {
        var now = new Date();
        var age = now.getFullYear() - 1998;
        if (now.getMonth() < 6) age--;
        return age;
    }

    function calcExp() {
        var years = new Date().getFullYear() - 2021;
        return (years > 0 ? years : 0) + '+ years';
    }

    function setText(id, value) {
        var el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    setText('ageDisplay', calcAge());
    setText('expDisplay', calcExp());
    setText('copyrightYear', new Date().getFullYear());

    // Theme toggle
    var toggle = document.querySelector('.theme-toggle');
    var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function currentTheme() {
        return root.getAttribute('data-theme') || (darkQuery.matches ? 'dark' : 'light');
    }

    if (toggle) {
        toggle.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) {}
        });
    }

    // Header border on scroll
    var header = document.querySelector('.site-header');
    function onScroll() {
        if (header) header.classList.toggle('scrolled', window.scrollY > 8);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Reveal sections and highlight the active nav link
    var sections = document.querySelectorAll('.reveal');
    var navLinks = document.querySelectorAll('.nav a');

    if (!('IntersectionObserver' in window)) {
        sections.forEach(function (s) { s.classList.add('in'); });
        return;
    }

    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -10% 0px' });

    var navObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            navLinks.forEach(function (a) {
                a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) {
        revealObserver.observe(s);
        navObserver.observe(s);
    });

    console.log('%cdavamu.dev', 'font: 600 16px Inter, sans-serif');
    console.log('%cLooking under the hood? Say hi → contacto@davamu.dev', 'color: #71717a');
})();
