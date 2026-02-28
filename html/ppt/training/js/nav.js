(function() {
  if (typeof NAV === 'undefined') return;

  const chapterNames = {
    0: '目录',
    1: '一、系统概述',
    2: '二、AI 硬件体系架构',
    3: '三、智算集群设计实施'
  };

  const accentClass = 'chapter-' + (NAV.section || 0);
  const container = document.querySelector('.slide-container');
  if (container && NAV.section) container.classList.add(accentClass);

  // Render header
  if (NAV.section !== undefined && !document.querySelector('.slide-header')) {
    const header = document.createElement('div');
    header.className = 'slide-header';
    header.innerHTML =
      '<div class="chapter-indicator"></div>' +
      '<span class="chapter-label">' + (chapterNames[NAV.section] || '') + '</span>' +
      '<span class="page-number">' + (NAV.pageNum || '') + ' / ' + (NAV.totalPages || '') + '</span>';
    const main = document.querySelector('.slide-main');
    if (main) container.insertBefore(header, main);
  }

  // Render footer
  if (!document.querySelector('.slide-footer')) {
    const pct = NAV.totalPages ? ((NAV.pageNum / NAV.totalPages) * 100).toFixed(1) : 0;
    const footer = document.createElement('div');
    footer.className = 'slide-footer';
    footer.innerHTML =
      '<span class="topic-name">' + (NAV.topic || '') + '</span>' +
      '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="nav-arrows">' +
        (NAV.prev ? '<a href="' + NAV.prev + '" title="上一页">&#9664;</a>' : '<span></span>') +
        (NAV.next ? '<a href="' + NAV.next + '" title="下一页">&#9654;</a>' : '<span></span>') +
      '</div>';
    container.appendChild(footer);
  }

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.target.classList.contains('lightbox-overlay')) {
      if (e.key === 'Escape') { e.target.remove(); return; }
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      if (NAV.next) { e.preventDefault(); window.location.href = NAV.next; }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (NAV.prev) { e.preventDefault(); window.location.href = NAV.prev; }
    }
  });

  // Image lightbox — click any img in slide-main to view full size
  (function() {
    var style = document.createElement('style');
    style.textContent =
      '.lightbox-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;}' +
      '.lightbox-overlay img{max-width:92vw;max-height:92vh;object-fit:contain;border-radius:6px;box-shadow:0 4px 30px rgba(0,0,0,.5);}' +
      '.slide-main img{cursor:zoom-in;}';
    document.head.appendChild(style);

    document.querySelector('.slide-main').addEventListener('click', function(e) {
      if (e.target.tagName !== 'IMG') return;
      var overlay = document.createElement('div');
      overlay.className = 'lightbox-overlay';
      overlay.tabIndex = 0;
      overlay.innerHTML = '<img src="' + e.target.src + '" alt="' + (e.target.alt || '') + '">';
      overlay.addEventListener('click', function() { overlay.remove(); });
      document.body.appendChild(overlay);
      overlay.focus();
    });
  })();
})();
